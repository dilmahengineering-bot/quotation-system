# Export Features Guide

## Overview

The Quotation Management System now includes comprehensive export functionality for PDF and Excel formats.

## 📄 PDF Export

### Features

The PDF export generates a professional, print-ready quotation document with:

✅ **Complete Quotation Information**
- Quote number with status badge
- Date and customer details
- Contact information
- Terms and conditions

✅ **Detailed Parts Breakdown**
- Part number and description
- Quantity and costs breakdown
- Operations with machine details
- Auxiliary costs itemized
- Part subtotals

✅ **Financial Summary**
- Subtotal calculations
- Discount application
- Margin calculation
- VAT calculation
- Total quote value (highlighted)

✅ **Professional Formatting**
- Company branding ready
- Clean, structured layout
- Page numbers
- Footer with validity period
- Multiple pages supported

### How to Use

#### From Quotation View Page

1. Open any quotation
2. Click **"📄 Export PDF"** button in the header
3. PDF downloads automatically
4. Filename: `Quotation_QT00000001.pdf`

#### Programmatically

```bash
# Direct download via API
curl http://localhost:5000/api/quotations/1/export/pdf --output quotation.pdf

# Or visit in browser
http://localhost:5000/api/quotations/1/export/pdf
```

### PDF Structure

```
Page 1:
├─ QUOTATION (Header)
│  ├─ Quote Number: QT00000001
│  ├─ Date: 01/08/2024
│  └─ Status: Approved
│
├─ CUSTOMER INFORMATION
│  ├─ Company Name
│  ├─ Address
│  ├─ Contact Person
│  ├─ Email
│  └─ Phone
│
├─ QUOTATION DETAILS
│  ├─ Currency
│  ├─ Lead Time
│  ├─ Payment Terms
│  └─ Shipment Type
│
├─ PARTS BREAKDOWN
│  ├─ Part 1
│  │  ├─ Details Box
│  │  ├─ Operations List
│  │  ├─ Auxiliary Costs
│  │  └─ Part Subtotal
│  │
│  └─ Part 2 (if any)
│     └─ ...
│
└─ FINANCIAL SUMMARY
   ├─ Subtotal
   ├─ Discount
   ├─ Margin
   ├─ VAT
   └─ TOTAL (highlighted)

Footer:
├─ Validity Statement
└─ Page Numbers
```

### Customization

To customize the PDF appearance, edit:
`/backend/services/pdfExportService.js`

**Common customizations:**
- Add company logo
- Change colors (currently blue theme)
- Modify header/footer text
- Add additional fields
- Change fonts

**Example - Add Company Logo:**
```javascript
// In addHeader function
doc.image('path/to/logo.png', 50, 50, { width: 100 });
doc.fontSize(24)
   .text('QUOTATION', 50, 80);
```

## 📊 Excel Export

### Features

#### Individual Quotation Export

Generates a multi-sheet Excel workbook with:

**Sheet 1: Quotation Summary**
- Complete quotation details
- Customer information
- Financial breakdown

**Sheet 2: Parts Breakdown**
- All parts in table format
- Costs itemized
- Totals calculated

**Sheet 3: Operations Detail**
- Each operation listed
- Machine details
- Time and cost breakdown
- Auxiliary costs included

#### Quotations List Export

Generates a single-sheet Excel with all quotations:
- Quote numbers
- Customers
- Dates
- Currencies
- Total values
- Status

### How to Use

#### Export Individual Quotation

1. Open any quotation
2. Click **"📊 Export Excel"** button
3. Excel file downloads automatically
4. Filename: `Quotation_QT00000001.xlsx`

#### Export All Quotations List

1. Go to Quotations page
2. Click **"📊 Export List"** button
3. Excel file downloads with all quotations
4. Filename: `Quotations_List_2024-01-08.xlsx`

#### Programmatically

```bash
# Export single quotation
curl http://localhost:5000/api/quotations/1/export/excel --output quotation.xlsx

# Export all quotations list
curl http://localhost:5000/api/quotations/export/excel/list --output quotations_list.xlsx
```

### Excel Structure

#### Individual Quotation

**Sheet 1: Quotation Summary**
```
QUOTATION SUMMARY
─────────────────
Quote Number:    QT00000001
Date:            01/08/2024
Status:          Approved
Currency:        USD

CUSTOMER INFORMATION
────────────────────
Company:         ABC Manufacturing Ltd
Contact Person:  John Smith
Email:           john@abc.com
...

FINANCIAL SUMMARY
─────────────────
Description          Amount
Subtotal            3,375.00
Discount (5%)         168.75
After Discount      3,206.25
...
```

**Sheet 2: Parts Breakdown**
```
Part Number | Description | Quantity | Material | Operations | Auxiliary | Subtotal
─────────────────────────────────────────────────────────────────────────────────
PART-001   | Sample Part |   10     |  100.00  |   187.50   |   50.00   | 3,375.00
```

**Sheet 3: Operations Detail**
```
Part Number | Machine      | Type    | Rate  | Time | Cost
──────────────────────────────────────────────────────────
PART-001   | CNC Mill 1   | Milling | 75.00 | 2.50 | 187.50
PART-001   | Setup Cost   | Aux Cost|   -   |  -   |  50.00
```

#### Quotations List

```
QUOTATIONS LIST
───────────────
Quote Number | Customer           | Date       | Currency | Total    | Status
────────────────────────────────────────────────────────────────────────────
QT00000001  | ABC Manufacturing  | 01/08/2024 | USD      | 4,232.25 | Approved
QT00000002  | XYZ Engineering    | 01/09/2024 | USD      | 2,156.80 | Draft
```

### Customization

To customize Excel output, edit:
`/backend/services/excelExportService.js`

**Common customizations:**
- Add/remove columns
- Change sheet names
- Add formulas
- Format cells
- Add charts

**Example - Add Formula:**
```javascript
// In createPartsSheet
data.push([
  'TOTAL',
  '',
  { f: 'SUM(D4:D' + (quotation.parts.length + 3) + ')' }, // Formula
  '',
  '',
  '',
  parseFloat(quotation.total_parts_cost).toFixed(2)
]);
```

## 🔧 API Endpoints

### PDF Export
```
GET /api/quotations/:id/export/pdf
```

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment
- File download

### Excel Export (Single)
```
GET /api/quotations/:id/export/excel
```

**Response:**
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment
- File download

### Excel Export (List)
```
GET /api/quotations/export/excel/list
```

**Response:**
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment
- File download

## 🎨 Branding & Customization

### Add Company Logo to PDF

1. Place logo image in `/backend/assets/logo.png`
2. Edit `/backend/services/pdfExportService.js`:

```javascript
static addHeader(doc, quotation) {
  // Add logo
  doc.image('assets/logo.png', 50, 40, { width: 80 });
  
  // Adjust text positions
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('QUOTATION', 150, 50);
  // ... rest of header
}
```

### Change Color Scheme

Edit color constants in `pdfExportService.js`:

```javascript
// Current blue theme
const PRIMARY_COLOR = '#1e3c72';
const SECONDARY_COLOR = '#2a5298';

// Change to green theme
const PRIMARY_COLOR = '#28a745';
const SECONDARY_COLOR = '#218838';
```

### Add Company Information Footer

```javascript
static addFooter(doc) {
  // ... existing code ...
  
  // Add company info
  doc.fontSize(8)
     .text('Your Company Name', 50, 780)
     .text('123 Business St, City, Country', 50, 790)
     .text('Phone: +1-555-0100 | Email: info@company.com', 50, 800);
}
```

## 📦 Installation

The export features are now included in the system. To install dependencies:

```bash
cd backend
npm install
```

New dependencies added:
- `pdfkit` - PDF generation
- `xlsx` - Excel generation

## 🧪 Testing

### Test PDF Export

```bash
# Using curl
curl http://localhost:5000/api/quotations/1/export/pdf -o test.pdf

# Open the file
open test.pdf  # Mac
xdg-open test.pdf  # Linux
start test.pdf  # Windows
```

### Test Excel Export

```bash
# Single quotation
curl http://localhost:5000/api/quotations/1/export/excel -o test.xlsx

# List export
curl http://localhost:5000/api/quotations/export/excel/list -o list.xlsx
```

### Verify Export Quality

**PDF Checklist:**
- [ ] All data appears correctly
- [ ] Multi-page handling works
- [ ] Formatting is professional
- [ ] Colors display properly
- [ ] Text is readable

**Excel Checklist:**
- [ ] All sheets created
- [ ] Data is accurate
- [ ] Columns are properly sized
- [ ] Formulas work (if any)
- [ ] Can open in Excel/LibreOffice

## 🐛 Troubleshooting

### Issue: PDF generation fails

**Solution:**
```bash
# Reinstall pdfkit
cd backend
npm uninstall pdfkit
npm install pdfkit
```

### Issue: Excel export shows corrupted file

**Solution:**
```bash
# Reinstall xlsx
cd backend
npm uninstall xlsx
npm install xlsx
```

### Issue: Fonts missing in PDF

**Solution:**
```javascript
// Use standard fonts only
doc.font('Helvetica')  // ✓ Works
doc.font('Arial')      // ✗ May not work
```

### Issue: Large quotations slow to export

**Solution:**
- PDF generation is synchronous, may take 2-3 seconds for large quotations
- Add loading indicator in frontend
- Consider background job processing for very large exports

## 🚀 Advanced Features

### Email Integration (Future)

Combine with email service to send exports:

```javascript
const nodemailer = require('nodemailer');

async function emailQuotation(quotationId, recipientEmail) {
  const quotation = await Quotation.getById(quotationId);
  const pdfBuffer = await PDFExportService.generateQuotationPDF(quotation);
  
  const transporter = nodemailer.createTransport({...});
  
  await transporter.sendMail({
    to: recipientEmail,
    subject: `Quotation ${quotation.quote_number}`,
    text: 'Please find attached quotation.',
    attachments: [{
      filename: `Quotation_${quotation.quote_number}.pdf`,
      content: pdfBuffer
    }]
  });
}
```

### Batch Export

Export multiple quotations at once:

```javascript
// In backend controller
async exportBatch(req, res) {
  const { quotationIds } = req.body;
  const zip = new JSZip();
  
  for (const id of quotationIds) {
    const quotation = await Quotation.getById(id);
    const pdf = await PDFExportService.generateQuotationPDF(quotation);
    zip.file(`Quotation_${quotation.quote_number}.pdf`, pdf);
  }
  
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  res.send(zipBuffer);
}
```

## 📊 Export Analytics

Track export usage:

```javascript
// In backend
const exportLog = {
  quotation_id: id,
  export_type: 'pdf',
  exported_by: userId,
  exported_at: new Date()
};

await pool.query(
  'INSERT INTO export_logs (quotation_id, export_type, exported_by, exported_at) VALUES ($1, $2, $3, $4)',
  [exportLog.quotation_id, exportLog.export_type, exportLog.exported_by, exportLog.exported_at]
);
```

## ✅ Summary

Export features are now fully functional:

✅ PDF export with professional formatting  
✅ Excel export with multiple sheets  
✅ List export for all quotations  
✅ Easy-to-use buttons in UI  
✅ API endpoints available  
✅ Customizable appearance  
✅ Production-ready  

**Start exporting quotations now!** 📄📊
