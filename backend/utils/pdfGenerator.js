const PDFDocument = require('pdfkit');

class PDFGenerator {
  /**
   * Format number with ISO pattern (thousand separators, 2 decimals)
   */
  static formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num || 0);
  }

  /**
   * Format currency with ISO 4217 pattern (Currency Code + formatted number)
   */
  static formatCurrency(amount, currencyCode = 'LKR') {
    return `${currencyCode} ${this.formatNumber(amount)}`;
  }

  static async generateQuotationPDF(quotation, res) {
    // Create a document with proper A4 margins (20-25mm)
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 70.87, // 25mm margins
      bufferPages: true 
    });

    // Pipe the PDF to the response
    doc.pipe(res);

    // Brand colors - Dilmah theme
    const brandBlue = '#0B5394';
    const accentGreen = '#38761D';
    const lightGray = '#F3F3F3';
    const darkGray = '#666666';
    const borderGray = '#D0D0D0';

    // Add two-column header
    this.addEnhancedHeader(doc, quotation, brandBlue, darkGray, borderGray);

    // Customer Information Section (bordered box)
    this.addCustomerInfoBox(doc, quotation, brandBlue, lightGray, borderGray);

    // Quotation Details (2x2 grid)
    this.addQuotationDetailsGrid(doc, quotation, brandBlue, borderGray);

    const leftColumn = 70.87;

    // Parts Section - Professional Table Layout
    this.addPartsTableStructured(doc, quotation, brandBlue, lightGray, borderGray, leftColumn);

    // Financial Summary - Right-aligned box with hierarchy
    this.addFinancialSummaryEnhanced(doc, quotation, brandBlue, accentGreen, lightGray, borderGray, leftColumn);

    // Approval & Signature Section
    this.addSignatureSectionEnhanced(doc, leftColumn, brandBlue, borderGray);

    // Finalize PDF
    doc.end();
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
  static addCustomerInfoBox(doc, quotation, brandColor, lightGray, borderGray) {
    let y = 200;
    const leftX = 70.87;
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
  static addQuotationDetailsGrid(doc, quotation, brandColor, borderGray) {
    let y = 345;
    const leftX = 70.87;

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
           .text(`Part ${index + 1}: ${part.part_name}`, leftColumn, y);
        
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
        const unitMaterialCost = parseFloat(part.material_cost) || 0;
        const unitOperationsCost = part.operations?.reduce((sum, op) => 
          sum + (parseFloat(op.hourly_rate) * parseFloat(op.operation_time)), 0) || 0;
        const unitAuxCost = part.auxiliary_costs?.reduce((sum, aux) => 
          sum + parseFloat(aux.cost), 0) || 0;
        const quantity = parseInt(part.quantity) || 1;
        const extendedMaterial = unitMaterialCost * quantity;
        const extendedOperations = unitOperationsCost * quantity;
        const extendedAux = unitAuxCost * quantity;
        const partSubtotal = extendedMaterial + extendedOperations + extendedAux;

        // Data row
        doc.fontSize(9).font('Helvetica').fillColor('#000000');
        doc.text(part.part_name.substring(0, 12), colX[0] + 3, y + 5, { width: colWidths[0] - 6 });
        doc.text(quantity.toString(), colX[1] + 3, y + 5, { width: colWidths[1] - 6, align: 'center' });
        doc.text(this.formatNumber(unitMaterialCost), colX[2] + 3, y + 5, { width: colWidths[2] - 6, align: 'right' });
        doc.text(this.formatNumber(unitOperationsCost), colX[3] + 3, y + 5, { width: colWidths[3] - 6, align: 'right' });
        doc.text(`${unitAuxCost.toFixed(2)}`, colX[4] + 3, y + 5, { width: colWidths[4] - 6, align: 'right' });
        doc.font('Helvetica-Bold').text(this.formatNumber(partSubtotal), colX[5] + 3, y + 5, { width: colWidths[5] - 6, align: 'right' });

        // Row border
        doc.rect(leftColumn, y, tableWidth, 20)
           .stroke(borderGray);

        y += 20;

        // Operations breakdown (if any)
        if (part.operations && part.operations.length > 0) {
          y += 10;
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#0B5394')
             .text('💼 OPERATIONS BREAKDOWN:', leftColumn + 10, y);
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
            const hours = parseFloat(op.operation_time) || 0;
            const rate = parseFloat(op.hourly_rate) || 0;
            const unitCost = hours * rate;
            const extCost = unitCost * quantity;

            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text(op.machine_name, leftColumn + 18, y + 3, { width: 150 });
            doc.text(this.formatNumber(hours), leftColumn + 180, y + 3, { width: 60, align: 'center' });
            doc.text(this.formatCurrency(rate, quotation.currency), leftColumn + 260, y + 3, { width: 70, align: 'right' });
            doc.text(this.formatNumber(unitCost), leftColumn + 340, y + 3, { width: 50, align: 'right' });
            doc.font('Helvetica-Bold').text(this.formatNumber(extCost), leftColumn + 400, y + 3, { width: 50, align: 'right' });
            doc.rect(leftColumn + 15, y, 438, 14).stroke('#E0E0E0');
            y += 14;
          });

          // Operations subtotal
          y += 2;
          doc.rect(leftColumn + 15, y, 438, 16).fill('#E8F4F8');
          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0B5394');
          doc.text('Operations Subtotal:', leftColumn + 250, y + 4, { width: 140, align: 'right' });
          doc.text(this.formatCurrency(extendedOperations, quotation.currency), leftColumn + 400, y + 4, { width: 50, align: 'right' });
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
          doc.text('Cost Type', leftColumn + 18, auxTableY + 4, { width: 180 });
          doc.text('Default Cost', leftColumn + 210, auxTableY + 4, { width: 70, align: 'right' });
          doc.text('Qty', leftColumn + 290, auxTableY + 4, { width: 40, align: 'center' });
          doc.text('Total', leftColumn + 370, auxTableY + 4, { width: 80, align: 'right' });
          doc.rect(leftColumn + 15, auxTableY, 438, 15).stroke('#D0D0D0');
          y += 15;

          part.auxiliary_costs.forEach((aux) => {
            const defaultCost = parseFloat(aux.default_cost || aux.cost || 0);
            const auxQty = parseInt(aux.quantity) || 1;
            const totalCost = defaultCost * auxQty;

            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text(aux.aux_type, leftColumn + 18, y + 3, { width: 180 });
            doc.text(this.formatCurrency(defaultCost, quotation.currency), leftColumn + 210, y + 3, { width: 70, align: 'right' });
            doc.text(auxQty.toString(), leftColumn + 290, y + 3, { width: 40, align: 'center' });
            doc.font('Helvetica-Bold').text(this.formatCurrency(totalCost, quotation.currency), leftColumn + 370, y + 3, { width: 80, align: 'right' });
            doc.rect(leftColumn + 15, y, 438, 14).stroke('#E0E0E0');
            y += 14;
          });

          // Auxiliary subtotal
          y += 2;
          doc.rect(leftColumn + 15, y, 438, 16).fill('#E8F5E9');
          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#38761D');
          doc.text('Auxiliary Subtotal:', leftColumn + 280, y + 4, { width: 80, align: 'right' });
          doc.text(this.formatCurrency(extendedAux, quotation.currency), leftColumn + 370, y + 4, { width: 80, align: 'right' });
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

    // Calculate component totals
    let totalMaterial = 0;
    let totalOperations = 0;
    let totalAuxiliary = 0;

    if (quotation.parts) {
      quotation.parts.forEach(part => {
        const qty = parseInt(part.quantity) || 1;
        const unitMaterial = parseFloat(part.material_cost) || 0;
        const unitOps = part.operations?.reduce((sum, op) => 
          sum + (parseFloat(op.hourly_rate) * parseFloat(op.operation_time)), 0) || 0;
        const unitAux = part.auxiliary_costs?.reduce((sum, aux) => 
          sum + parseFloat(aux.cost), 0) || 0;
        
        totalMaterial += unitMaterial * qty;
        totalOperations += unitOps * qty;
        totalAuxiliary += unitAux * qty;
      });
    }

    const baseTotal = totalMaterial + totalOperations + totalAuxiliary;

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

    // Section 1: Component Breakdown
    const componentRows = [
      ['Material Costs (All Parts)', totalMaterial, false],
      ['Operations Costs (All Parts)', totalOperations, false],
      ['Auxiliary Costs (All Parts)', totalAuxiliary, false],
    ];

    componentRows.forEach(([label, value, isBold]) => {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#333333');
      doc.text(label, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.font('Helvetica').fillColor('#000000');
      doc.text(`${quotation.currency} ${parseFloat(value).toFixed(2)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;
    });

    // Subtotal row (Base Total)
    doc.rect(tableX, y, tableWidth, 16).fill('#E8F4F8');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0B5394');
    doc.text('BASE TOTAL (Before Adjustments)', tableX + 10, y + 5, { width: colWidths[0] - 20 });
    doc.text(`${quotation.currency} ${baseTotal.toFixed(2)}`, tableX + colWidths[0] + 10, y + 5, { width: colWidths[1] - 20, align: 'right' });
    doc.rect(tableX, y, tableWidth, 16).stroke('#0B5394');
    y += 16;

    // Section 2: Adjustments
    const discountPercent = parseFloat(quotation.discount_percentage) || 0;
    const discountAmount = baseTotal * (discountPercent / 100);
    const afterDiscount = baseTotal - discountAmount;

    // Discount row
    if (discountPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Less: Discount (${discountPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#CC0000');
      doc.text(`- ${this.formatCurrency(discountAmount, quotation.currency)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;

      // After discount row
      doc.rect(tableX, y, tableWidth, 14).fill('#F8F9FA');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#333333');
      doc.text('After Discount', tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#000000');
      doc.text(this.formatCurrency(afterDiscount, quotation.currency), tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#D0D0D0');
      y += 14;
    }

    // Margin row
    const marginPercent = parseFloat(quotation.margin_percentage) || 0;
    const marginAmount = afterDiscount * (marginPercent / 100);
    const afterMargin = afterDiscount + marginAmount;

    if (marginPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Add: Margin (${marginPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#006600');
      doc.text(`+ ${this.formatCurrency(marginAmount, quotation.currency)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;

      // After margin row
      doc.rect(tableX, y, tableWidth, 14).fill('#F8F9FA');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#333333');
      doc.text('After Margin', tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#000000');
      doc.text(this.formatCurrency(afterMargin, quotation.currency), tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#D0D0D0');
      y += 14;
    }

    // VAT row
    const vatPercent = parseFloat(quotation.vat_percentage) || 0;
    const vatAmount = afterMargin * (vatPercent / 100);
    const finalTotal = afterMargin + vatAmount;

    if (vatPercent > 0) {
      doc.rect(tableX, y, tableWidth, 14).fill('#FFFFFF');
      doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
      doc.text(`Add: VAT/Tax (${vatPercent.toFixed(1)}%)`, tableX + 10, y + 4, { width: colWidths[0] - 20 });
      doc.fillColor('#006600');
      doc.text(`+ ${this.formatCurrency(vatAmount, quotation.currency)}`, tableX + colWidths[0] + 10, y + 4, { width: colWidths[1] - 20, align: 'right' });
      doc.rect(tableX, y, tableWidth, 14).stroke('#E0E0E0');
      y += 14;
    }

    // FINAL TOTAL - Emphasized row
    doc.rect(tableX, y, tableWidth, 20).fill('#38761D');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('TOTAL QUOTE VALUE', tableX + 10, y + 6, { width: colWidths[0] - 20 });
    doc.fontSize(12);
    doc.text(this.formatCurrency(finalTotal, quotation.currency), tableX + colWidths[0] + 10, y + 6, { width: colWidths[1] - 20, align: 'right' });
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

module.exports = PDFGenerator;
