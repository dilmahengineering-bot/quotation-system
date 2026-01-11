const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFExportService {
  /**
   * Generate PDF for quotation
   * @param {Object} quotation - Complete quotation data
   * @param {String} outputPath - Path to save PDF
   */
  static async generateQuotationPDF(quotation, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add content
        this.addHeader(doc, quotation);
        this.addCustomerInfo(doc, quotation);
        this.addQuotationDetails(doc, quotation);
        this.addPartsTable(doc, quotation);
        this.addFinancialSummary(doc, quotation);
        this.addFooter(doc, quotation);

        // Finalize
        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  static addHeader(doc, quotation) {
    // Company Header
    doc.fontSize(24)
       .fillColor('#1e3c72')
       .text('MANUFACTURING COSTING SHEETS', 50, 50, { align: 'center' });

    doc.fontSize(10)
       .fillColor('#666666')
       .text('Your Company Name', 50, 80, { align: 'center' });

    doc.text('Address Line 1, City, Country', 50, 95, { align: 'center' });
    doc.text('Phone: +1-234-567-8900 | Email: info@company.com', 50, 110, { align: 'center' });

    // Quote Number Box
    doc.rect(400, 50, 145, 80)
       .fillAndStroke('#f0f0f0', '#cccccc');

    doc.fontSize(10)
       .fillColor('#000000')
       .text('Quote Number:', 410, 60);
    
    doc.fontSize(14)
       .fillColor('#1e3c72')
       .text(quotation.quote_number, 410, 80);

    doc.fontSize(10)
       .fillColor('#000000')
       .text('Date:', 410, 105);
    
    doc.text(new Date(quotation.quotation_date).toLocaleDateString(), 460, 105);

    // Horizontal line
    doc.moveTo(50, 145)
       .lineTo(545, 145)
       .stroke('#cccccc');
  }

  static addCustomerInfo(doc, quotation) {
    let y = 160;

    doc.fontSize(14)
       .fillColor('#1e3c72')
       .text('CUSTOMER INFORMATION', 50, y);

    y += 25;

    doc.fontSize(10)
       .fillColor('#000000')
       .text('Company:', 50, y);
    doc.text(quotation.company_name || 'N/A', 150, y);

    y += 20;
    doc.text('Contact Person:', 50, y);
    doc.text(quotation.contact_person_name || 'N/A', 150, y);

    y += 20;
    doc.text('Email:', 50, y);
    doc.text(quotation.email || 'N/A', 150, y);

    y += 20;
    doc.text('Phone:', 50, y);
    doc.text(quotation.phone || 'N/A', 150, y);

    if (quotation.address) {
      y += 20;
      doc.text('Address:', 50, y);
      doc.text(quotation.address, 150, y, { width: 350 });
    }

    y += 35;
    doc.moveTo(50, y)
       .lineTo(545, y)
       .stroke('#cccccc');
  }

  static addQuotationDetails(doc, quotation) {
    let y = doc.y + 15;

    doc.fontSize(14)
       .fillColor('#1e3c72')
       .text('QUOTATION DETAILS', 50, y);

    y += 25;

    doc.fontSize(10)
       .fillColor('#000000');

    // Left column
    doc.text('Currency:', 50, y);
    doc.text(quotation.currency, 150, y);

    doc.text('Lead Time:', 300, y);
    doc.text(quotation.lead_time || 'N/A', 400, y);

    y += 20;
    doc.text('Payment Terms:', 50, y);
    doc.text(quotation.payment_terms || 'N/A', 150, y);

    doc.text('Shipment Type:', 300, y);
    doc.text(quotation.shipment_type || 'N/A', 400, y);

    y += 35;
    doc.moveTo(50, y)
       .lineTo(545, y)
       .stroke('#cccccc');
  }

  static addPartsTable(doc, quotation) {
    let y = doc.y + 15;

    doc.fontSize(14)
       .fillColor('#1e3c72')
       .text('PARTS & OPERATIONS', 50, y);

    y += 25;

    // For each part
    quotation.parts.forEach((part, partIndex) => {
      // Check if we need a new page
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      // Part header
      doc.fontSize(11)
         .fillColor('#2a5298')
         .text(`Part ${partIndex + 1}: ${part.part_number}`, 50, y);

      y += 20;

      if (part.part_description) {
        doc.fontSize(9)
           .fillColor('#666666')
           .text(part.part_description, 50, y);
        y += 15;
      }

      // Part details table
      doc.fontSize(9)
         .fillColor('#000000');

      const tableData = [
        ['Quantity:', part.quantity.toString()],
        ['Unit Material Cost:', `${quotation.currency} ${parseFloat(part.unit_material_cost).toFixed(2)}`],
        ['Unit Operations Cost:', `${quotation.currency} ${parseFloat(part.unit_operations_cost).toFixed(2)}`],
        ['Unit Auxiliary Cost:', `${quotation.currency} ${parseFloat(part.unit_auxiliary_cost).toFixed(2)}`]
      ];

      tableData.forEach(row => {
        doc.text(row[0], 70, y);
        doc.text(row[1], 250, y);
        y += 15;
      });

      // Operations
      if (part.operations && part.operations.length > 0) {
        y += 5;
        doc.fontSize(10)
           .fillColor('#2a5298')
           .text('Operations:', 70, y);
        y += 15;

        part.operations.forEach((op, opIndex) => {
          doc.fontSize(8)
             .fillColor('#000000')
             .text(`${opIndex + 1}. ${op.machine_name} (${op.machine_type})`, 90, y);
          doc.text(`${parseFloat(op.operation_time_hours).toFixed(2)} hrs @ ${quotation.currency} ${parseFloat(op.hourly_rate).toFixed(2)}/hr`, 300, y);
          doc.text(`= ${quotation.currency} ${parseFloat(op.operation_cost).toFixed(2)}`, 450, y);
          y += 12;
        });
      }

      // Auxiliary costs
      if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
        y += 5;
        doc.fontSize(10)
           .fillColor('#2a5298')
           .text('Auxiliary Costs:', 70, y);
        y += 15;

        part.auxiliary_costs.forEach((aux, auxIndex) => {
          doc.fontSize(8)
             .fillColor('#000000')
             .text(`${auxIndex + 1}. ${aux.aux_type}`, 90, y);
          doc.text(`${quotation.currency} ${parseFloat(aux.cost).toFixed(2)}`, 450, y);
          y += 12;
        });
      }

      // Part subtotal
      y += 10;
      doc.fontSize(10)
         .fillColor('#1e3c72')
         .text('Part Subtotal:', 70, y);
      doc.text(`${quotation.currency} ${parseFloat(part.part_subtotal).toFixed(2)}`, 450, y, { align: 'right' });

      y += 25;
      doc.moveTo(50, y)
         .lineTo(545, y)
         .stroke('#e0e0e0');
      y += 15;
    });
  }

  static addFinancialSummary(doc, quotation) {
    let y = doc.y;

    // Check if we need a new page
    if (y > 600) {
      doc.addPage();
      y = 50;
    }

    doc.fontSize(14)
       .fillColor('#1e3c72')
       .text('FINANCIAL SUMMARY', 50, y);

    y += 25;

    // Summary box
    doc.rect(300, y, 245, 150)
       .fillAndStroke('#f8f9fa', '#cccccc');

    y += 15;

    doc.fontSize(10)
       .fillColor('#000000');

    const summaryData = [
      ['Subtotal:', parseFloat(quotation.subtotal).toFixed(2)],
      [`Discount (${parseFloat(quotation.discount_percent).toFixed(1)}%):`, `-${parseFloat(quotation.discount_amount).toFixed(2)}`],
      [`Margin (${parseFloat(quotation.margin_percent).toFixed(1)}%):`, `+${parseFloat(quotation.margin_amount).toFixed(2)}`],
      [`VAT (${parseFloat(quotation.vat_percent).toFixed(1)}%):`, `+${parseFloat(quotation.vat_amount).toFixed(2)}`]
    ];

    summaryData.forEach(row => {
      doc.text(row[0], 310, y);
      doc.text(`${quotation.currency} ${row[1]}`, 480, y, { align: 'right' });
      y += 20;
    });

    // Total line
    y += 10;
    doc.moveTo(310, y)
       .lineTo(535, y)
       .lineWidth(2)
       .stroke('#2a5298');

    y += 15;

    doc.fontSize(12)
       .fillColor('#1e3c72')
       .text('TOTAL QUOTE VALUE:', 310, y);
    
    doc.fontSize(14)
       .text(`${quotation.currency} ${parseFloat(quotation.total_quote_value).toFixed(2)}`, 480, y, { align: 'right' });
  }

  static addFooter(doc, quotation) {
    const pageHeight = doc.page.height;
    const y = pageHeight - 80;

    doc.fontSize(8)
       .fillColor('#666666')
       .text('This quotation is valid for 30 days from the date of issue.', 50, y, { 
         align: 'center',
         width: 495
       });

    doc.text('Terms and conditions apply. Please contact us for any clarifications.', 50, y + 15, {
      align: 'center',
      width: 495
    });

    doc.fontSize(7)
       .text(`Generated on ${new Date().toLocaleString()}`, 50, y + 40, {
         align: 'center',
         width: 495
       });
  }
}

module.exports = PDFExportService;
