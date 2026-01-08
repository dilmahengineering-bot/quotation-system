const XLSX = require('xlsx');

class ExcelExportService {
  /**
   * Generate Excel for quotation
   * @param {Object} quotation - Complete quotation data
   * @param {String} outputPath - Path to save Excel file
   */
  static async generateQuotationExcel(quotation, outputPath) {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add sheets
      this.addSummarySheet(workbook, quotation);
      this.addPartsSheet(workbook, quotation);
      this.addOperationsSheet(workbook, quotation);
      this.addAuxiliaryCostsSheet(workbook, quotation);

      // Write file
      XLSX.writeFile(workbook, outputPath);

      return outputPath;
    } catch (error) {
      throw error;
    }
  }

  static addSummarySheet(workbook, quotation) {
    const data = [
      ['QUOTATION SUMMARY'],
      [],
      ['Quote Number:', quotation.quote_number],
      ['Date:', new Date(quotation.quotation_date).toLocaleDateString()],
      ['Status:', quotation.quotation_status],
      ['Currency:', quotation.currency],
      [],
      ['CUSTOMER INFORMATION'],
      [],
      ['Company:', quotation.company_name],
      ['Contact Person:', quotation.contact_person_name || ''],
      ['Email:', quotation.email || ''],
      ['Phone:', quotation.phone || ''],
      ['Address:', quotation.address || ''],
      [],
      ['QUOTATION DETAILS'],
      [],
      ['Lead Time:', quotation.lead_time || ''],
      ['Payment Terms:', quotation.payment_terms || ''],
      ['Shipment Type:', quotation.shipment_type || ''],
      [],
      ['FINANCIAL SUMMARY'],
      [],
      ['Total Parts Cost:', parseFloat(quotation.total_parts_cost).toFixed(2)],
      ['Subtotal:', parseFloat(quotation.subtotal).toFixed(2)],
      ['Discount (' + parseFloat(quotation.discount_percent).toFixed(1) + '%):', parseFloat(quotation.discount_amount).toFixed(2)],
      ['After Discount:', (parseFloat(quotation.subtotal) - parseFloat(quotation.discount_amount)).toFixed(2)],
      ['Margin (' + parseFloat(quotation.margin_percent).toFixed(1) + '%):', parseFloat(quotation.margin_amount).toFixed(2)],
      ['After Margin:', (parseFloat(quotation.subtotal) - parseFloat(quotation.discount_amount) + parseFloat(quotation.margin_amount)).toFixed(2)],
      ['VAT (' + parseFloat(quotation.vat_percent).toFixed(1) + '%):', parseFloat(quotation.vat_amount).toFixed(2)],
      [],
      ['TOTAL QUOTE VALUE:', parseFloat(quotation.total_quote_value).toFixed(2)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];

    // Add to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }

  static addPartsSheet(workbook, quotation) {
    const data = [
      ['PARTS BREAKDOWN'],
      [],
      ['Part #', 'Part Number', 'Description', 'Quantity', 'Unit Material Cost', 'Unit Operations Cost', 'Unit Auxiliary Cost', 'Part Subtotal']
    ];

    quotation.parts.forEach((part, index) => {
      data.push([
        index + 1,
        part.part_number,
        part.part_description || '',
        part.quantity,
        parseFloat(part.unit_material_cost).toFixed(2),
        parseFloat(part.unit_operations_cost).toFixed(2),
        parseFloat(part.unit_auxiliary_cost).toFixed(2),
        parseFloat(part.part_subtotal).toFixed(2)
      ]);
    });

    // Add totals
    data.push([]);
    data.push([
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL:',
      parseFloat(quotation.total_parts_cost).toFixed(2)
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 30 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parts');
  }

  static addOperationsSheet(workbook, quotation) {
    const data = [
      ['OPERATIONS BREAKDOWN'],
      [],
      ['Part #', 'Part Number', 'Operation #', 'Machine Name', 'Machine Type', 'Hourly Rate', 'Time (hrs)', 'Operation Cost']
    ];

    quotation.parts.forEach((part, partIndex) => {
      if (part.operations && part.operations.length > 0) {
        part.operations.forEach((op, opIndex) => {
          data.push([
            partIndex + 1,
            part.part_number,
            opIndex + 1,
            op.machine_name,
            op.machine_type,
            parseFloat(op.hourly_rate).toFixed(2),
            parseFloat(op.operation_time_hours).toFixed(2),
            parseFloat(op.operation_cost).toFixed(2)
          ]);
        });
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Operations');
  }

  static addAuxiliaryCostsSheet(workbook, quotation) {
    const data = [
      ['AUXILIARY COSTS BREAKDOWN'],
      [],
      ['Part #', 'Part Number', 'Aux Cost #', 'Cost Type', 'Description', 'Cost']
    ];

    quotation.parts.forEach((part, partIndex) => {
      if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
        part.auxiliary_costs.forEach((aux, auxIndex) => {
          data.push([
            partIndex + 1,
            part.part_number,
            auxIndex + 1,
            aux.aux_type,
            aux.description || '',
            parseFloat(aux.cost).toFixed(2)
          ]);
        });
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 35 },
      { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auxiliary Costs');
  }
}

module.exports = ExcelExportService;
