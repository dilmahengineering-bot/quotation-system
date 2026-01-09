const Quotation = require('../models/Quotation');
const PDFGenerator = require('../utils/pdfGenerator');

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
      const quotation = await Quotation.update(req.params.id, req.body);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
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

  // Generate PDF
  async generatePDF(req, res) {
    try {
      const quotation = await Quotation.getById(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=quotation-${quotation.quote_number}.pdf`);

      // Generate PDF
      await PDFGenerator.generateQuotationPDF(quotation, res);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = quotationController;
