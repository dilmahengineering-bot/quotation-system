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

        // Finalize
        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Enhanced two-column header
  static addEnhancedHeader(doc, quotation, brandColor, darkGray, borderGray) {
    const leftX = 70.87;
    let y = 70.87;

    // Company Branding at top
    doc.fontSize(20).font('Helvetica-Bold').fillColor(brandColor)
       .text('DILMAH CNC MANUFACTURING', leftX, y);
    
    y += 25;
    doc.fontSize(8).font('Helvetica').fillColor(darkGray)
       .text('Confidential – For Internal Engineering, Costing, and Management Review Only', leftX, y);
    
    y += 14;
    doc.fontSize(8).font('Helvetica').fillColor(darkGray)
       .text('Dilmah CNC Manufacturing & Engineering Innovations', leftX, y);

    y += 20;

    // Quote Number box below company info
    const boxY = y;
    const boxWidth = 250;
    const boxHeight = 70;

    // Box with subtle border
    doc.rect(leftX, boxY, boxWidth, boxHeight)
       .fillAndStroke('#FAFAFA', borderGray);

    // Quote number and date in single row layout
    doc.fontSize(9).font('Helvetica').fillColor('#333333')
       .text('Quote Number', leftX + 10, boxY + 10);
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor(brandColor)
       .text(quotation.quote_number, leftX + 10, boxY + 25);

    // Date on same line
    doc.fontSize(9).font('Helvetica').fillColor('#333333')
       .text('Date', leftX + 140, boxY + 10);
    
    doc.fontSize(10).fillColor('#000000')
       .text(new Date(quotation.quotation_date).toLocaleDateString(), leftX + 140, boxY + 25);

    // Status badge at bottom of box
    const statusColors = {
      'Draft': '#6c757d',
      'Submitted': '#0288D1',
      'Approved': '#388E3C',
      'Rejected': '#D32F2F'
    };
    
    doc.fontSize(8).fillColor(statusColors[quotation.quotation_status] || '#6c757d')
       .text(`Status: ${quotation.quotation_status}`, leftX + 10, boxY + 50);

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
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#333333');
        doc.text('Part No', colX[0] + 3, tableTop + 5, { width: colWidths[0] - 6 });
        doc.text('Qty', colX[1] + 3, tableTop + 5, { width: colWidths[1] - 6, align: 'center' });
        doc.text('Unit Material', colX[2] + 3, tableTop + 5, { width: colWidths[2] - 6, align: 'right' });
        doc.text('Unit Operations', colX[3] + 3, tableTop + 5, { width: colWidths[3] - 6, align: 'right' });
        doc.text('Unit Auxiliary', colX[4] + 3, tableTop + 5, { width: colWidths[4] - 6, align: 'right' });
        doc.text('Extended Total', colX[5] + 3, tableTop + 5, { width: colWidths[5] - 6, align: 'right' });

        // Table border
        doc.rect(leftColumn, tableTop, tableWidth, 18)
           .stroke(borderGray);

        y += 18;

        // Calculate all costs
        const unitMaterialCost = parseFloat(part.unit_material_cost || 0);
        const unitOperationsCost = parseFloat(part.unit_operations_cost || 0);
        const unitAuxiliaryCost = parseFloat(part.unit_auxiliary_cost || 0);
        const quantity = parseInt(part.quantity || 1);
        const extendedMaterial = unitMaterialCost * quantity;
        const extendedOperations = unitOperationsCost * quantity;
        const extendedAux = unitAuxiliaryCost * quantity;
        const partSubtotal = parseFloat(part.part_subtotal || 0);

        // Data row
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

        // Operations breakdown (if any)
        if (part.operations && part.operations.length > 0) {
          y += 10;
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#0B5394')
             .text('📼 OPERATIONS BREAKDOWN:', leftColumn + 10, y);
          y += 16;

          // Operations table header
          const opTableY = y;
          doc.rect(leftColumn + 15, opTableY, 438, 15).fill('#F8F9FA');
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#333333');
          doc.text('Machine/Process', leftColumn + 18, opTableY + 4, { width: 150 });
          doc.text('Time (hrs)', leftColumn + 180, opTableY + 4, { width: 60, align: 'center' });
          doc.text('Rate/hr', leftColumn + 260, opTableY + 4, { width: 70, align: 'right' });
          doc.text('Unit Cost', leftColumn + 340, opTableY + 4, { width: 50, align: 'right' });
          doc.text('Extended', leftColumn + 400, opTableY + 4, { width: 50, align: 'right' });
          doc.rect(leftColumn + 15, opTableY, 438, 15).stroke('#D0D0D0');
          y += 15;

          part.operations.forEach((op) => {
            const hours = parseFloat(op.operation_time_hours || 0);
            const rate = parseFloat(op.hourly_rate || 0);
            const unitCost = parseFloat(op.operation_cost || 0);
            const extCost = unitCost * quantity;
            const machineName = op.machine_name || 'Machine';

            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text(machineName, leftColumn + 18, y + 3, { width: 150 });
            doc.text(hours.toFixed(2), leftColumn + 180, y + 3, { width: 60, align: 'center' });
            doc.text(`${quotation.currency} ${rate.toFixed(2)}`, leftColumn + 260, y + 3, { width: 70, align: 'right' });
            doc.text(`${unitCost.toFixed(2)}`, leftColumn + 340, y + 3, { width: 50, align: 'right' });
            doc.font('Helvetica-Bold').text(`${extCost.toFixed(2)}`, leftColumn + 400, y + 3, { width: 50, align: 'right' });
            doc.rect(leftColumn + 15, y, 438, 14).stroke('#E0E0E0');
            y += 14;
          });

          // Operations subtotal
          y += 2;
          doc.rect(leftColumn + 15, y, 438, 16).fill('#E8F4F8');
          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0B5394');
          doc.text('Operations Subtotal:', leftColumn + 250, y + 4, { width: 140, align: 'right' });
          doc.text(`${quotation.currency} ${extendedOperations.toFixed(2)}`, leftColumn + 400, y + 4, { width: 50, align: 'right' });
          doc.rect(leftColumn + 15, y, 438, 16).stroke('#0B5394');
          y += 16;
        }

        // Auxiliary costs breakdown (if any)
        if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
          y += 10;
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#38761D')
             .text('⚙️ AUXILIARY COSTS BREAKDOWN:', leftColumn + 10, y);
          y += 16;

          // Auxiliary table header
          const auxTableY = y;
          doc.rect(leftColumn + 15, auxTableY, 438, 15).fill('#F8F9FA');
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#333333');
          doc.text('Cost Type', leftColumn + 18, auxTableY + 4, { width: 250 });
          doc.text('Unit Cost', leftColumn + 280, auxTableY + 4, { width: 80, align: 'right' });
          doc.text('Extended Cost', leftColumn + 370, auxTableY + 4, { width: 80, align: 'right' });
          doc.rect(leftColumn + 15, auxTableY, 438, 15).stroke('#D0D0D0');
          y += 15;

          part.auxiliary_costs.forEach((aux) => {
            const unitCost = parseFloat(aux.cost || 0);
            const extCost = unitCost * quantity;
            const auxType = aux.aux_type || 'Cost';

            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text(auxType, leftColumn + 18, y + 3, { width: 250 });
            doc.text(`${quotation.currency} ${unitCost.toFixed(2)}`, leftColumn + 280, y + 3, { width: 80, align: 'right' });
            doc.font('Helvetica-Bold').text(`${quotation.currency} ${extCost.toFixed(2)}`, leftColumn + 370, y + 3, { width: 80, align: 'right' });
            doc.rect(leftColumn + 15, y, 438, 14).stroke('#E0E0E0');
            y += 14;
          });

          // Auxiliary subtotal
          y += 2;
          doc.rect(leftColumn + 15, y, 438, 16).fill('#E8F5E9');
          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#38761D');
          doc.text('Auxiliary Subtotal:', leftColumn + 280, y + 4, { width: 80, align: 'right' });
          doc.text(`${quotation.currency} ${extendedAux.toFixed(2)}`, leftColumn + 370, y + 4, { width: 80, align: 'right' });
          doc.rect(leftColumn + 15, y, 438, 16).stroke('#38761D');
          y += 16;
        }

        y += 15;
      });
    }

    doc.moveDown(2);
  }

  // Financial summary - transparent step-by-step cost buildup table
  static addFinancialSummaryEnhanced(doc, quotation, brandColor, accentColor, lightGray, borderGray, leftColumn) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    let y = doc.y + 20;

    // Section header
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor)
       .text('💰 COST BUILDUP & FINANCIAL SUMMARY', leftColumn, y);
    
    y += 22;

    // Calculate component totals from database values
    const subtotal = parseFloat(quotation.subtotal || 0);
    
    // Cost buildup table - full width, professional layout
    const tableX = leftColumn;
    const tableWidth = 453.26;
    const colWidths = [280, 173.26];

    // Table header
    doc.rect(tableX, y, tableWidth, 16).fill('#0B5394');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('COST COMPONENT', tableX + 10, y + 5, { width: colWidths[0] - 20 });
    doc.text('AMOUNT', tableX + colWidths[0] + 10, y + 5, { width: colWidths[1] - 20, align: 'right' });
    doc.rect(tableX, y, tableWidth, 16).stroke('#0B5394');
    y += 16;

    // Base Total row
    doc.rect(tableX, y, tableWidth, 16).fill('#E8F4F8');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0B5394');
    doc.text('BASE TOTAL (All Parts & Costs)', tableX + 10, y + 5, { width: colWidths[0] - 20 });
    doc.text(`${quotation.currency} ${subtotal.toFixed(2)}`, tableX + colWidths[0] + 10, y + 5, { width: colWidths[1] - 20, align: 'right' });
    doc.rect(tableX, y, tableWidth, 16).stroke('#0B5394');
    y += 16;

    // Calculate step-by-step
    const discountPercent = parseFloat(quotation.discount_percent || 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;

    // Discount row
    if (discountPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Less: Discount (${discountPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#CC0000');
      doc.text(`- ${quotation.currency} ${discountAmount.toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;

      // After discount row
      doc.rect(tableX, y, tableWidth, 14).fill('#F8F9FA');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#333333');
      doc.text('= After Discount', tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#000000');
      doc.text(`${quotation.currency} ${afterDiscount.toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#D0D0D0');
      y += 14;
    }

    // Margin row
    const marginPercent = parseFloat(quotation.margin_percent || 0);
    const marginAmount = afterDiscount * (marginPercent / 100);
    const afterMargin = afterDiscount + marginAmount;

    if (marginPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Add: Margin (${marginPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#006600');
      doc.text(`+ ${quotation.currency} ${marginAmount.toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;

      // After margin row
      doc.rect(tableX, y, tableWidth, 14).fill('#F8F9FA');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#333333');
      doc.text('= After Margin', tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#000000');
      doc.text(`${quotation.currency} ${afterMargin.toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#D0D0D0');
      y += 14;
    }

    // VAT row
    const vatPercent = parseFloat(quotation.vat_percent || 0);
    const vatAmount = afterMargin * (vatPercent / 100);
    const finalTotal = afterMargin + vatAmount;

    if (vatPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Add: VAT/Tax (${vatPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#006600');
      doc.text(`+ ${quotation.currency} ${vatAmount.toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;
    }

    // FINAL TOTAL - Emphasized row
    doc.rect(tableX, y, tableWidth, 20).fill('#38761D');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('TOTAL QUOTE VALUE', tableX + 10, y + 6, { width: colWidths[0] - 20 });
    doc.fontSize(12);
    doc.text(`${quotation.currency} ${finalTotal.toFixed(2)}`, tableX + colWidths[0] + 10, y + 6, { width: colWidths[1] - 20, align: 'right' });
    doc.rect(tableX, y, tableWidth, 20).stroke('#38761D');

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
}

module.exports = PDFExportService;
