const PDFDocument = require('pdfkit');

class PDFGenerator {
  static async generateQuotationPDF(quotation, res) {
    // Create a document
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true 
    });

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add company header
    this.addHeader(doc);

    // Add quotation title and number
    doc.moveDown();
    doc.fontSize(20).fillColor('#1e3c72').text('QUOTATION', { align: 'center' });
    doc.fontSize(12).fillColor('#000').text(`Quote Number: ${quotation.quote_number}`, { align: 'center' });
    doc.moveDown();

    // Add status badge
    const statusColors = {
      'Draft': '#6c757d',
      'Submitted': '#17a2b8',
      'Approved': '#28a745',
      'Rejected': '#dc3545'
    };
    doc.fontSize(10).fillColor(statusColors[quotation.quotation_status] || '#6c757d')
       .text(`Status: ${quotation.quotation_status}`, { align: 'center' });
    doc.fillColor('#000');
    doc.moveDown(2);

    // General Information Section
    this.addSectionTitle(doc, 'CUSTOMER INFORMATION');
    doc.fontSize(10);
    
    const leftColumn = 50;
    const rightColumn = 300;
    let y = doc.y;

    doc.text('Customer:', leftColumn, y, { continued: true, width: 240 });
    doc.font('Helvetica-Bold').text(quotation.company_name || 'N/A');
    doc.font('Helvetica');
    
    doc.text('Email:', leftColumn, doc.y + 5, { continued: true, width: 240 });
    doc.font('Helvetica-Bold').text(quotation.email || 'N/A');
    doc.font('Helvetica');

    doc.text('Contact Person:', leftColumn, doc.y + 5, { continued: true, width: 240 });
    doc.font('Helvetica-Bold').text(quotation.contact_person_name || 'N/A');
    doc.font('Helvetica');

    doc.text('Phone:', leftColumn, doc.y + 5, { continued: true, width: 240 });
    doc.font('Helvetica-Bold').text(quotation.phone || 'N/A');
    doc.font('Helvetica');

    doc.text('Quotation Date:', leftColumn, doc.y + 5, { continued: true, width: 240 });
    doc.font('Helvetica-Bold').text(new Date(quotation.quotation_date).toLocaleDateString());
    doc.font('Helvetica');

    if (quotation.lead_time) {
      doc.text('Lead Time:', leftColumn, doc.y + 5, { continued: true, width: 240 });
      doc.font('Helvetica-Bold').text(quotation.lead_time);
      doc.font('Helvetica');
    }

    if (quotation.payment_terms) {
      doc.text('Payment Terms:', leftColumn, doc.y + 5, { continued: true, width: 240 });
      doc.font('Helvetica-Bold').text(quotation.payment_terms);
      doc.font('Helvetica');
    }

    doc.moveDown(2);

    // Parts Section
    this.addSectionTitle(doc, 'QUOTATION DETAILS');
    
    if (quotation.parts && quotation.parts.length > 0) {
      quotation.parts.forEach((part, index) => {
        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.fontSize(12).fillColor('#2a5298')
           .text(`Part ${index + 1}: ${part.part_name}`, { underline: true });
        doc.fillColor('#000').fontSize(10);
        doc.moveDown(0.5);

        // Part details
        doc.text(`Quantity: ${part.quantity}`);
        doc.text(`Material Cost: ${quotation.currency} ${parseFloat(part.material_cost).toFixed(2)}`);
        doc.moveDown(0.5);

        // Operations
        if (part.operations && part.operations.length > 0) {
          doc.fontSize(10).fillColor('#495057').text('Operations:', { underline: true });
          doc.fillColor('#000');
          
          part.operations.forEach((op, opIndex) => {
            const opCost = (parseFloat(op.hourly_rate) * parseFloat(op.operation_time)).toFixed(2);
            doc.text(`  ${opIndex + 1}. ${op.machine_name} - ${op.operation_time} hrs @ ${quotation.currency} ${parseFloat(op.hourly_rate).toFixed(2)}/hr = ${quotation.currency} ${opCost}`, {
              indent: 20
            });
          });
          doc.moveDown(0.5);
        }

        // Auxiliary Costs
        if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
          doc.fontSize(10).fillColor('#495057').text('Auxiliary Costs:', { underline: true });
          doc.fillColor('#000');
          
          part.auxiliary_costs.forEach((aux, auxIndex) => {
            doc.text(`  ${auxIndex + 1}. ${aux.aux_type}: ${quotation.currency} ${parseFloat(aux.cost).toFixed(2)}`, {
              indent: 20
            });
          });
          doc.moveDown(0.5);
        }

        // Part total
        const unitOperationsCost = part.operations?.reduce((sum, op) => 
          sum + (parseFloat(op.hourly_rate) * parseFloat(op.operation_time)), 0) || 0;
        const unitAuxCost = part.auxiliary_costs?.reduce((sum, aux) => 
          sum + parseFloat(aux.cost), 0) || 0;
        const unitTotalCost = parseFloat(part.material_cost) + unitOperationsCost + unitAuxCost;
        const partSubtotal = unitTotalCost * parseInt(part.quantity);

        doc.fontSize(10).fillColor('#2a5298')
           .text(`Part Subtotal: ${quotation.currency} ${partSubtotal.toFixed(2)}`, { align: 'right' });
        doc.fillColor('#000');
        doc.moveDown(1.5);
      });
    }

    // Cost Summary
    if (doc.y > 550) {
      doc.addPage();
    }

    this.addSectionTitle(doc, 'COST SUMMARY');
    doc.moveDown(0.5);

    // Draw cost summary box
    const summaryY = doc.y;
    const summaryHeight = 180;
    doc.rect(leftColumn, summaryY, 495, summaryHeight).fillAndStroke('#f8f9fa', '#dee2e6');

    // Cost rows
    doc.fillColor('#000');
    let currentY = summaryY + 15;
    const labelX = leftColumn + 20;
    const valueX = leftColumn + 400;

    const costRows = [
      ['Total Parts Cost:', quotation.total_parts_cost],
      ['Subtotal:', quotation.subtotal],
      [`Discount (${quotation.discount_percentage}%):`, `-${quotation.discount_amount}`],
      ['After Discount:', quotation.after_discount],
      [`Margin (${quotation.margin_percentage}%):`, quotation.margin_amount],
      ['After Margin:', quotation.after_margin],
      [`VAT (${quotation.vat_percentage}%):`, quotation.vat_amount]
    ];

    doc.fontSize(10).font('Helvetica');
    costRows.forEach(([label, value]) => {
      doc.text(label, labelX, currentY);
      doc.text(`${quotation.currency} ${parseFloat(value).toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 20;
    });

    // Total line
    doc.strokeColor('#2a5298').lineWidth(2)
       .moveTo(labelX, currentY)
       .lineTo(leftColumn + 475, currentY)
       .stroke();
    currentY += 10;

    // Total
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3c72');
    doc.text('TOTAL QUOTE VALUE:', labelX, currentY);
    doc.text(`${quotation.currency} ${parseFloat(quotation.total_quote_value).toFixed(2)}`, valueX, currentY, { align: 'right' });

    // Approval & Signature Section
    this.addSignatureSection(doc, leftColumn);

    // Footer
    doc.fontSize(8).fillColor('#6c757d').font('Helvetica');
    doc.text(
      'This quotation is valid for 30 days from the date of issue.',
      50,
      doc.page.height - 80,
      { align: 'center', width: doc.page.width - 100 }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 60,
      { align: 'center', width: doc.page.width - 100 }
    );

    // Finalize PDF
    doc.end();
  }

  static addHeader(doc) {
    doc.fontSize(24).fillColor('#1e3c72').text('Quotation Management System', { align: 'center' });
    doc.fontSize(10).fillColor('#6c757d').text('Professional Manufacturing Quotations', { align: 'center' });
    doc.strokeColor('#2a5298').lineWidth(2)
       .moveTo(50, 100)
       .lineTo(doc.page.width - 50, 100)
       .stroke();
  }

  static addSectionTitle(doc, title) {
    doc.fontSize(14).fillColor('#1e3c72').font('Helvetica-Bold')
       .text(title);
    doc.font('Helvetica').fillColor('#000');
    doc.moveDown(0.5);
  }

  static addSignatureSection(doc, leftColumn) {
    // Check if we need a new page for signatures
    if (doc.y > 550) {
      doc.addPage();
    } else {
      doc.moveDown(3);
    }

    this.addSectionTitle(doc, 'APPROVAL & AUTHORIZATION');
    doc.moveDown(1);

    const signatureY = doc.y;
    const columnWidth = 165;
    const spacing = 165;

    // Define three signature blocks
    const approvers = [
      { title: 'Workshop Manager', name: '' },
      { title: 'Head of Engineering', name: '' },
      { title: 'Finance Approval', name: '' }
    ];

    approvers.forEach((approver, index) => {
      const xPos = leftColumn + (index * spacing);
      const yPos = signatureY;

      // Designation title
      doc.fontSize(10).fillColor('#1e3c72').font('Helvetica-Bold')
         .text(approver.title, xPos, yPos, { width: columnWidth - 10, align: 'left' });
      
      doc.fillColor('#000').font('Helvetica');

      // Name field (optional)
      if (approver.name) {
        doc.fontSize(9).text(`Name: ${approver.name}`, xPos, yPos + 20, { width: columnWidth - 10 });
      }

      // Signature line
      doc.fontSize(9).text('Signature:', xPos, yPos + 40);
      doc.moveTo(xPos, yPos + 65)
         .lineTo(xPos + columnWidth - 10, yPos + 65)
         .stroke('#000000');

      // Date line
      doc.fontSize(9).text('Date:', xPos, yPos + 75);
      doc.moveTo(xPos, yPos + 100)
         .lineTo(xPos + columnWidth - 10, yPos + 100)
         .stroke('#000000');
    });

    doc.moveDown(8);
  }
}

module.exports = PDFGenerator;
