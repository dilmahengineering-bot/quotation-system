const Quotation = require('../models/Quotation');
const PDFExportService = require('../services/pdfExportService');
const ExcelExportService = require('../services/excelExportService');

const quotationController = {
  // Get all quotations
  async getAll(req, res) {
    try {
      const quotations = await Quotation.getAll();
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get statistics
  async getStatistics(req, res) {
    try {
      const stats = await Quotation.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get quotation by ID
  async getById(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create quotation
  async create(req, res) {
    try {
      const quotation = await Quotation.create(req.body);
      res.status(201).json(quotation);
    } catch (error) {
      console.error('Error creating quotation:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update quotation
  async update(req, res) {
    try {
      console.log('UPDATE Request received for quotation:', req.params.id);
      console.log('Payload:', JSON.stringify(req.body, null, 2));
      
      const quotation = await Quotation.update(req.params.id, req.body);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      console.error('UPDATE Error:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: error.message });
    }
  },

  // Update quotation status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const quotation = await Quotation.updateStatus(req.params.id, status);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Workflow actions
  async submit(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'submitted');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async engineerApprove(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'engineer approved');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async managementApprove(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'management approved');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async reject(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'rejected');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async issue(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'issued');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async revertToDraft(req, res) {
    try {
      const quotation = await Quotation.updateStatus(req.params.id, 'draft');
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete quotation
  async delete(req, res) {
    try {
      const quotation = await Quotation.delete(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json({ message: 'Quotation deleted successfully', quotation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export quotation as PDF
  async exportPDF(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      const pdfBuffer = await PDFExportService.generateQuotationPDF(quotation);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Quotation_${quotation.quote_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF: ' + error.message });
    }
  },

  // Export quotation as Excel
  async exportExcel(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      const excelBuffer = ExcelExportService.generateQuotationExcel(quotation);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Quotation_${quotation.quote_number}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating Excel:', error);
      res.status(500).json({ error: 'Failed to generate Excel: ' + error.message });
    }
  },

  // Export quotations list as Excel
  async exportListExcel(req, res) {
    try {
      const quotations = await Quotation.getAll();
      const excelBuffer = ExcelExportService.generateQuotationListExcel(quotations);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Quotations_List_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating Excel list:', error);
      res.status(500).json({ error: 'Failed to generate Excel: ' + error.message });
    }
  }
};

module.exports = quotationController;
