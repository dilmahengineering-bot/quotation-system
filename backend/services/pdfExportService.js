const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFExportService {
  /**
   * Generate PDF for quotation with professional industrial-grade layout
   * @param {Object} quotation - Complete quotation data
   * @param {String} outputPath - Path to save PDF
   */
  static async generateQuotationPDF(quotation, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document with proper A4 margins (25mm)
        const doc = new PDFDocument({ 
          size: 'A4',
          margin: 70.87, // 25mm in points
          bufferPages: true
        });

        // Pipe to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Brand colors - Dilmah theme
        const brandBlue = '#0B5394';
        const accentGreen = '#38761D';
        const lightGray = '#F3F3F3';
        const darkGray = '#666666';
        const borderGray = '#D0D0D0';

        const leftColumn = 70.87;

        // Add all sections with enhanced design
        this.addEnhancedHeader(doc, quotation, brandBlue, darkGray, borderGray);
        this.addCustomerInfoBox(doc, quotation, brandBlue, lightGray, borderGray, leftColumn);
        this.addQuotationDetailsGrid(doc, quotation, brandBlue, borderGray, leftColumn);
        this.addPartsTableStructured(doc, quotation, brandBlue, lightGray, borderGray, leftColumn);
        this.addFinancialSummaryEnhanced(doc, quotation, brandBlue, accentGreen, lightGray, borderGray, leftColumn);
        this.addSignatureSectionEnhanced(doc, leftColumn, brandBlue, borderGray);
        this.addProfessionalFooter(doc, darkGray);

        // Finalize
        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  }

  // Enhanced two-column header
  static addEnhancedHeader(doc, quotation, brandColor, darkGray, borderGray) {
    const leftX = 70.87;
    const rightX = 370;
    let y = 70.87;

    // LEFT BLOCK - Company Branding
    doc.fontSize(20).font('Helvetica-Bold').fillColor(brandColor)
       .text('DILMAH CNC MANUFACTURING', leftX, y);
    
    y += 28;
    doc.fontSize(9).font('Helvetica').fillColor(darkGray)
       .text('No. 123, Industrial Zone, Colombo, Sri Lanka', leftX, y);
    
    y += 12;
    doc.text('Phone: +94 11 234 5678 | Email: info@dilmahcnc.lk', leftX, y);

    // Thin horizontal divider under company info
    doc.strokeColor(borderGray).lineWidth(1)
       .moveTo(leftX, y + 15)
       .lineTo(leftX + 250, y + 15)
       .stroke();

    // RIGHT BLOCK - Quotation metadata box
    const boxY = 70.87;
    const boxWidth = 155;
    const boxHeight = 85;

    // Box with subtle border
    doc.rect(rightX, boxY, boxWidth, boxHeight)
       .fillAndStroke('#FAFAFA', borderGray);

    // Quote number (bold & highlighted)
    doc.fontSize(9).font('Helvetica').fillColor('#333333')
       .text('Quote Number', rightX + 10, boxY + 10);
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor(brandColor)
       .text(quotation.quote_number, rightX + 10, boxY + 25);

    // Date
    doc.fontSize(9).font('Helvetica').fillColor('#333333')
       .text('Date', rightX + 10, boxY + 50);
    
    doc.fontSize(10).fillColor('#000000')
       .text(new Date(quotation.quotation_date).toLocaleDateString(), rightX + 10, boxY + 63);

    // Status badge
    const statusColors = {
      'Draft': '#6c757d',
      'Submitted': '#0288D1',
      'Approved': '#388E3C',
      'Rejected': '#D32F2F'
    };
    
    doc.fontSize(8).fillColor(statusColors[quotation.quotation_status] || '#6c757d')
       .text(`Status: ${quotation.quotation_status}`, rightX + 10, boxY + boxHeight + 8);

    doc.moveDown(3);
  }

  // Customer information - bordered box with grid
  static addCustomerInfoBox(doc, quotation, brandColor, lightGray, borderGray, leftX) {
    let y = 200;
    const boxWidth = 453.26;
    const boxHeight = 110;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('CUSTOMER INFORMATION', leftX, y);
    
    y += 20;

    // Light bordered box
    doc.rect(leftX, y, boxWidth, boxHeight)
       .fillAndStroke(lightGray, borderGray);

    // Two-column grid layout
    y += 12;
    const labelX = leftX + 15;
    const valueX = leftX + 140;
    const col2LabelX = leftX + 250;
    const col2ValueX = leftX + 350;

    doc.fontSize(9).font('Helvetica').fillColor('#666666');

    // Row 1
    doc.text('Company', labelX, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.company_name || 'N/A', valueX, y);
    
    doc.font('Helvetica').fillColor('#666666').text('Contact Person', col2LabelX, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.contact_person_name || 'N/A', col2ValueX, y);

    // Row 2
    y += 22;
    doc.font('Helvetica').fillColor('#666666').text('Email', labelX, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.email || 'N/A', valueX, y);
    
    doc.font('Helvetica').fillColor('#666666').text('Phone', col2LabelX, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.phone || 'N/A', col2ValueX, y);

    // Row 3
    y += 22;
    doc.font('Helvetica').fillColor('#666666').text('Quote Date', labelX, y);
    doc.font('Helvetica-Bold').fillColor('#000000')
       .text(new Date(quotation.quotation_date).toLocaleDateString(), valueX, y);
    
    if (quotation.address) {
      doc.font('Helvetica').fillColor('#666666').text('Address', col2LabelX, y);
      doc.font('Helvetica').fillColor('#000000')
         .text(quotation.address.substring(0, 30), col2ValueX, y, { width: 100 });
    }

    doc.moveDown(3);
  }

  // Quotation details - 2x2 grid
  static addQuotationDetailsGrid(doc, quotation, brandColor, borderGray, leftX) {
    let y = 345;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('QUOTATION DETAILS', leftX, y);
    
    y += 22;

    doc.fontSize(9).font('Helvetica').fillColor('#666666');

    // Grid layout - 2x2
    const labelX1 = leftX;
    const valueX1 = leftX + 90;
    const labelX2 = leftX + 250;
    const valueX2 = leftX + 340;

    // Row 1: Currency | Lead Time
    doc.text('Currency', labelX1, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.currency, valueX1, y);
    
    doc.font('Helvetica').fillColor('#666666').text('Lead Time', labelX2, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.lead_time || 'N/A', valueX2, y);

    // Row 2: Payment Terms | Shipment Type
    y += 18;
    doc.font('Helvetica').fillColor('#666666').text('Payment Terms', labelX1, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.payment_terms || 'N/A', valueX1, y);
    
    doc.font('Helvetica').fillColor('#666666').text('Shipment Type', labelX2, y);
    doc.font('Helvetica-Bold').fillColor('#000000').text(quotation.shipment_type || 'N/A', valueX2, y);

    // Horizontal separator
    y += 22;
    doc.strokeColor(borderGray).lineWidth(0.5)
       .moveTo(leftX, y)
       .lineTo(leftX + 453.26, y)
       .stroke();

    doc.moveDown(2);
  }

  // Parts table - structured professional layout
  static addPartsTableStructured(doc, quotation, brandColor, lightGray, borderGray, leftColumn) {
  // Parts table - structured professional layout
  static addPartsTableStructured(doc, quotation, brandColor, lightGray, borderGray, leftColumn) {
    let y = 440;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('PARTS & OPERATIONS', leftColumn, y);
    
    y += 22;

    if (quotation.parts && quotation.parts.length > 0) {
      quotation.parts.forEach((part, index) => {
        // Check if we need a new page
        if (y > 650) {
          doc.addPage();
          y = 70.87;
        }

        // Part header row
        doc.fontSize(10).font('Helvetica-Bold').fillColor(brandColor)
           .text(`Part ${index + 1}: ${part.part_number || part.part_name}`, leftColumn, y);
        
        y += 18;

        // Table header with light gray background
        const tableTop = y;
        const tableWidth = 453.26;
        const colWidths = [80, 50, 80, 80, 80, 83.26];
        const colX = [
          leftColumn,
          leftColumn + colWidths[0],
          leftColumn + colWidths[0] + colWidths[1],
          leftColumn + colWidths[0] + colWidths[1] + colWidths[2],
          leftColumn + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
          leftColumn + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]
        ];

        // Header background
        doc.rect(leftColumn, tableTop, tableWidth, 18)
           .fill(lightGray);

        // Header text
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333');
        doc.text('Part No', colX[0] + 3, tableTop + 5, { width: colWidths[0] - 6 });
        doc.text('Qty', colX[1] + 3, tableTop + 5, { width: colWidths[1] - 6, align: 'center' });
        doc.text('Material Cost', colX[2] + 3, tableTop + 5, { width: colWidths[2] - 6, align: 'right' });
        doc.text('Operations Cost', colX[3] + 3, tableTop + 5, { width: colWidths[3] - 6, align: 'right' });
        doc.text('Auxiliary Cost', colX[4] + 3, tableTop + 5, { width: colWidths[4] - 6, align: 'right' });
        doc.text('Subtotal', colX[5] + 3, tableTop + 5, { width: colWidths[5] - 6, align: 'right' });

        // Table border
        doc.rect(leftColumn, tableTop, tableWidth, 18)
           .stroke(borderGray);

        y += 18;

        // Data row - calculate costs
        const unitMaterialCost = parseFloat(part.unit_material_cost || 0);
        const unitOperationsCost = parseFloat(part.unit_operations_cost || 0);
        const unitAuxiliaryCost = parseFloat(part.unit_auxiliary_cost || 0);
        const partSubtotal = parseFloat(part.part_subtotal || 0);
        const quantity = parseInt(part.quantity || 1);

        doc.fontSize(9).font('Helvetica').fillColor('#000000');
        
        const partDisplayName = (part.part_number || part.part_name || 'Part').substring(0, 12);
        doc.text(partDisplayName, colX[0] + 3, y + 5, { width: colWidths[0] - 6 });
        doc.text(quantity.toString(), colX[1] + 3, y + 5, { width: colWidths[1] - 6, align: 'center' });
        doc.text(`${unitMaterialCost.toFixed(2)}`, colX[2] + 3, y + 5, { width: colWidths[2] - 6, align: 'right' });
        doc.text(`${unitOperationsCost.toFixed(2)}`, colX[3] + 3, y + 5, { width: colWidths[3] - 6, align: 'right' });
        doc.text(`${unitAuxiliaryCost.toFixed(2)}`, colX[4] + 3, y + 5, { width: colWidths[4] - 6, align: 'right' });
        
        doc.font('Helvetica-Bold').text(`${partSubtotal.toFixed(2)}`, colX[5] + 3, y + 5, { width: colWidths[5] - 6, align: 'right' });

        // Row border
        doc.rect(leftColumn, y, tableWidth, 20)
           .stroke(borderGray);

        y += 20;

        // Part description
        if (part.part_description) {
          y += 8;
          doc.fontSize(8).font('Helvetica').fillColor('#666666')
             .text(`Description: ${part.part_description}`, leftColumn + 10, y, { width: 430 });
          y += 12;
        }

        // Operations details (if any)
        if (part.operations && part.operations.length > 0) {
          y += 5;
          doc.fontSize(8).font('Helvetica').fillColor('#666666')
             .text('Operations:', leftColumn + 10, y);
          y += 12;

          part.operations.forEach((op, opIndex) => {
            const opCost = parseFloat(op.operation_cost || 0).toFixed(2);
            const machineName = op.machine_name || 'Machine';
            const opTime = parseFloat(op.operation_time_hours || 0).toFixed(2);
            const hourlyRate = parseFloat(op.hourly_rate || 0).toFixed(2);
            
            doc.fontSize(8).fillColor('#000000')
               .text(`${opIndex + 1}. ${machineName} - ${opTime} hrs @ ${quotation.currency} ${hourlyRate}/hr = ${quotation.currency} ${opCost}`, 
                 leftColumn + 20, y, { width: 420 });
            y += 12;
          });
        }

        // Auxiliary costs details (if any)
        if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
          y += 5;
          doc.fontSize(8).font('Helvetica').fillColor('#666666')
             .text('Auxiliary Costs:', leftColumn + 10, y);
          y += 12;

          part.auxiliary_costs.forEach((aux, auxIndex) => {
            const auxCost = parseFloat(aux.cost || 0).toFixed(2);
            const auxType = aux.aux_type || 'Cost';
            
            doc.fontSize(8).fillColor('#000000')
               .text(`${auxIndex + 1}. ${auxType}: ${quotation.currency} ${auxCost}`, 
                 leftColumn + 20, y, { width: 420 });
            y += 12;
          });
        }

        y += 15;
      });
    }

    doc.moveDown(2);
  }

  // Financial summary - right-aligned boxed panel with hierarchy
  static addFinancialSummaryEnhanced(doc, quotation, brandColor, accentColor, lightGray, borderGray, leftColumn) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    let y = doc.y + 20;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('FINANCIAL SUMMARY', leftColumn, y);
    
    y += 22;

    // Right-aligned box panel
    const boxX = leftColumn + 240;
    const boxWidth = 213.26;
    const boxHeight = 145;

    // Box background with border
    doc.rect(boxX, y, boxWidth, boxHeight)
       .fillAndStroke(lightGray, borderGray);

    y += 15;

    // Cost breakdown rows
    const labelX = boxX + 15;
    const valueX = boxX + boxWidth - 15;

    doc.fontSize(9).font('Helvetica').fillColor('#333333');

    const costRows = [
      ['Subtotal:', quotation.subtotal],
      [`Discount (${parseFloat(quotation.discount_percent || 0).toFixed(1)}%):`, `-${parseFloat(quotation.discount_amount || 0).toFixed(2)}`],
      [`Margin (${parseFloat(quotation.margin_percent || 0).toFixed(1)}%):`, `+${parseFloat(quotation.margin_amount || 0).toFixed(2)}`],
      [`VAT (${parseFloat(quotation.vat_percent || 0).toFixed(1)}%):`, `+${parseFloat(quotation.vat_amount || 0).toFixed(2)}`]
    ];

    costRows.forEach(([label, value]) => {
      doc.text(label, labelX, y);
      const displayValue = typeof value === 'string' ? value : parseFloat(value).toFixed(2);
      doc.font('Helvetica-Bold').text(`${quotation.currency} ${displayValue}`, labelX, y, { 
        width: boxWidth - 30, 
        align: 'right' 
      });
      doc.font('Helvetica');
      y += 18;
    });

    // Strong divider line above total
    y += 5;
    doc.strokeColor(brandColor).lineWidth(2)
       .moveTo(labelX, y)
       .lineTo(valueX, y)
       .stroke();
    
    y += 12;

    // TOTAL (emphasized with larger font and brand color)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
    doc.text('TOTAL QUOTE VALUE:', labelX, y);
    
    doc.fontSize(13).fillColor(accentColor)
       .text(`${quotation.currency} ${parseFloat(quotation.total_quote_value).toFixed(2)}`, labelX, y, { 
         width: boxWidth - 30, 
         align: 'right' 
       });

    doc.moveDown(3);
  }

  // Enhanced signature section
  static addSignatureSectionEnhanced(doc, leftColumn, brandColor, borderGray) {
    // Check if we need a new page for signatures
    if (doc.y > 620) {
      doc.addPage();
    } else {
      doc.moveDown(3);
    }

    let y = doc.y;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('APPROVAL & AUTHORIZATION', leftColumn, y);

    y += 30;

    // Define three signature blocks
    const approvers = [
      { title: 'Workshop Manager' },
      { title: 'Head of Engineering' },
      { title: 'Finance Approval' }
    ];

    const columnWidth = 151;
    const spacing = 151;

    approvers.forEach((approver, index) => {
      const xPos = leftColumn + (index * spacing);

      // Designation title (brand color)
      doc.fontSize(9).fillColor(brandColor).font('Helvetica-Bold')
         .text(approver.title, xPos, y, { width: columnWidth - 10 });
      
      doc.fillColor('#000000').font('Helvetica');

      // Signature line (thin, professional)
      doc.fontSize(8).fillColor('#666666').text('Signature:', xPos, y + 35);
      doc.strokeColor(borderGray).lineWidth(0.5)
         .moveTo(xPos, y + 55)
         .lineTo(xPos + columnWidth - 15, y + 55)
         .stroke();

      // Date line
      doc.fontSize(8).text('Date:', xPos, y + 65);
      doc.strokeColor(borderGray).lineWidth(0.5)
         .moveTo(xPos, y + 85)
         .lineTo(xPos + columnWidth - 15, y + 85)
         .stroke();
    });

    doc.moveDown(8);
  }

  // Professional footer
  static addProfessionalFooter(doc, darkGray) {
    const pageHeight = doc.page.height;
    const y = pageHeight - 60;

    doc.fontSize(8).fillColor(darkGray).font('Helvetica')
       .text('This quotation is valid for 30 days from the date of issue. Terms and conditions apply.', 
         70.87, y, { align: 'center', width: 453.26 });

    doc.fontSize(7).fillColor('#999999')
       .text(`Generated on ${new Date().toLocaleString()}`, 
         70.87, y + 20, { align: 'center', width: 453.26 });
  }
}

module.exports = PDFExportService;
