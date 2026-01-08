const path = require('path');
const fs = require('fs');
const Quotation = require('../models/Quotation');
const PDFExportService = require('../services/pdfExportService');
const ExcelExportService = require('../services/excelExportService');

const exportController = {
  // Export quotation as PDF
  async exportPDF(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(__dirname, '..', 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Generate filename
      const filename = `Quotation_${quotation.quote_number}_${Date.now()}.pdf`;
      const filepath = path.join(exportsDir, filename);

      // Generate PDF
      await PDFExportService.generateQuotationPDF(quotation, filepath);

      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error sending PDF:', err);
        }
        
        // Delete file after sending
        setTimeout(() => {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }, 5000);
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      res.status(500).json({ error: 'Failed to export PDF: ' + error.message });
    }
  },

  // Export quotation as Excel
  async exportExcel(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(__dirname, '..', 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Generate filename
      const filename = `Quotation_${quotation.quote_number}_${Date.now()}.xlsx`;
      const filepath = path.join(exportsDir, filename);

      // Generate Excel
      await ExcelExportService.generateQuotationExcel(quotation, filepath);

      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error sending Excel:', err);
        }
        
        // Delete file after sending
        setTimeout(() => {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }, 5000);
      });

    } catch (error) {
      console.error('Error exporting Excel:', error);
      res.status(500).json({ error: 'Failed to export Excel: ' + error.message });
    }
  }
};

module.exports = exportController;
