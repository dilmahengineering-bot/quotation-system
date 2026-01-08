# Export Feature Documentation

## Overview

The Quotation Management System now includes PDF and Excel export functionality, allowing you to generate professional documents from your quotations.

## Features

### PDF Export
- ✅ Professional formatted PDF documents
- ✅ Company header with branding
- ✅ Customer information section
- ✅ Complete parts breakdown
- ✅ Operations details with machine info
- ✅ Auxiliary costs listing
- ✅ Financial summary with calculations
- ✅ Terms and conditions footer
- ✅ Automatic pagination for long quotations

### Excel Export
- ✅ Multi-sheet workbook
- ✅ Summary sheet with all quotation details
- ✅ Parts breakdown sheet
- ✅ Operations breakdown sheet
- ✅ Auxiliary costs breakdown sheet
- ✅ Properly formatted columns
- ✅ Ready for further analysis

## Installation

The export feature requires two additional packages that are already included in package.json:

```bash
cd backend
npm install
```

This will install:
- `pdfkit` - PDF generation library
- `xlsx` - Excel file generation library

## Usage

### From the UI

1. Navigate to any quotation view page
2. Click the **"📄 Export PDF"** button to download PDF
3. Click the **"📊 Export Excel"** button to download Excel

### API Endpoints

#### Export PDF
```
GET /api/quotations/:id/export/pdf
```

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/pdf --output quotation.pdf
```

**Response:**
- Downloads PDF file directly
- Filename format: `Quotation_QT00000001_timestamp.pdf`

#### Export Excel
```
GET /api/quotations/:id/export/excel
```

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/excel --output quotation.xlsx
```

**Response:**
- Downloads Excel file directly
- Filename format: `Quotation_QT00000001_timestamp.xlsx`

## PDF Document Structure

### Page 1: Header & Summary
1. **Company Header**
   - Company name and logo area
   - Contact information
   - Quote number box with date

2. **Customer Information**
   - Company name
   - Contact person
   - Email and phone
   - Address

3. **Quotation Details**
   - Currency
   - Lead time
   - Payment terms
   - Shipment type

### Page 2+: Parts & Operations
4. **Parts Breakdown**
   For each part:
   - Part number and description
   - Quantity and costs
   - Operations listing with:
     - Machine name and type
     - Time and hourly rate
     - Operation cost
   - Auxiliary costs listing
   - Part subtotal

### Final Page: Financial Summary
5. **Financial Summary**
   - Subtotal
   - Discount (with percentage)
   - Margin (with percentage)
   - VAT (with percentage)
   - **Total Quote Value** (highlighted)

6. **Footer**
   - Validity period
   - Terms and conditions note
   - Generation timestamp

## Excel Workbook Structure

### Sheet 1: Summary
Complete quotation overview including:
- Quote number and date
- Customer information
- Quotation details
- Financial breakdown
- Total quote value

### Sheet 2: Parts
Detailed parts table with columns:
- Part #
- Part Number
- Description
- Quantity
- Unit Material Cost
- Unit Operations Cost
- Unit Auxiliary Cost
- Part Subtotal

### Sheet 3: Operations
All operations across all parts:
- Part # and Part Number
- Operation #
- Machine Name and Type
- Hourly Rate
- Time (hours)
- Operation Cost

### Sheet 4: Auxiliary Costs
All auxiliary costs across all parts:
- Part # and Part Number
- Aux Cost #
- Cost Type
- Description
- Cost

## Customization

### Customizing PDF Header

Edit `/backend/services/pdfExportService.js` in the `addHeader` method:

```javascript
static addHeader(doc, quotation) {
  // Change company name
  doc.text('YOUR COMPANY NAME HERE', 50, 80, { align: 'center' });
  
  // Change address
  doc.text('Your Address Here', 50, 95, { align: 'center' });
  
  // Change contact info
  doc.text('Phone: YOUR-PHONE | Email: YOUR-EMAIL', 50, 110, { align: 'center' });
  
  // ... rest of the code
}
```

### Customizing PDF Footer

Edit the `addFooter` method:

```javascript
static addFooter(doc, quotation) {
  // Change validity period
  doc.text('This quotation is valid for 60 days...', ...);
  
  // Change terms text
  doc.text('Your custom terms here...', ...);
}
```

### Adding Company Logo to PDF

To add a logo, modify the `addHeader` method:

```javascript
static addHeader(doc, quotation) {
  // Add logo (place logo.png in backend directory)
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 100 });
  }
  
  // ... rest of header code
}
```

### Customizing Excel Sheets

Edit `/backend/services/excelExportService.js`:

```javascript
// Add new sheet
static addCustomSheet(workbook, quotation) {
  const data = [
    ['Custom Data'],
    // ... your data
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Custom Sheet');
}

// Call in generateQuotationExcel
static async generateQuotationExcel(quotation, outputPath) {
  // ... existing code
  this.addCustomSheet(workbook, quotation);
  // ... write file
}
```

## File Storage

### Temporary Storage
- Exported files are stored temporarily in `/backend/exports/`
- Files are automatically deleted after 5 seconds of sending
- This prevents disk space buildup

### Persistent Storage (Optional)

If you want to keep exports permanently:

1. Remove the auto-delete code in `exportController.js`:

```javascript
// Comment out or remove this section:
setTimeout(() => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}, 5000);
```

2. Add backup/cleanup scripts:

```bash
# Daily cleanup of old exports
find backend/exports -name "*.pdf" -mtime +30 -delete
find backend/exports -name "*.xlsx" -mtime +30 -delete
```

## Troubleshooting

### PDF Generation Fails

**Issue:** "Failed to export PDF"

**Solutions:**

1. Check pdfkit is installed:
```bash
cd backend
npm list pdfkit
```

2. Verify exports directory exists:
```bash
mkdir -p backend/exports
chmod 755 backend/exports
```

3. Check for special characters in quotation data
4. Verify all quotation data is present

### Excel Generation Fails

**Issue:** "Failed to export Excel"

**Solutions:**

1. Check xlsx is installed:
```bash
cd backend
npm list xlsx
```

2. Verify data types are correct (no undefined values)

3. Check console for specific errors

### Download Doesn't Start

**Issue:** Browser doesn't download file

**Solutions:**

1. Check browser console for errors
2. Verify API URL is correct in frontend .env:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Check popup blocker settings
4. Try different browser

### File is Corrupted

**Issue:** Downloaded file won't open

**Solutions:**

1. Ensure file download completed fully
2. Check backend logs for errors during generation
3. Try generating again
4. Verify quotation has all required data

## Performance Considerations

### Large Quotations

For quotations with many parts (50+):
- PDF generation may take 2-3 seconds
- Excel generation is typically faster
- Consider adding a loading indicator in the UI

### Concurrent Exports

The system can handle multiple simultaneous exports:
- Each export creates a unique filename
- Temporary files are automatically cleaned up
- No file conflicts

## Security Considerations

### File Access

- Exports are only accessible during download
- Files are deleted after sending
- No permanent storage of exported files
- API endpoints require valid quotation ID

### Data Privacy

- Exported files contain all quotation data
- Ensure proper access controls on quotation endpoints
- Consider adding authentication for production use

## Future Enhancements

Potential additions:
- [ ] Email PDF directly to customer
- [ ] Custom branding per customer
- [ ] Batch export multiple quotations
- [ ] PDF digital signatures
- [ ] Export templates
- [ ] Watermarks for draft quotations
- [ ] Multi-language support
- [ ] Custom cover pages

## API Integration

### Using in External Systems

```javascript
// Node.js example
const axios = require('axios');
const fs = require('fs');

async function downloadQuotationPDF(quotationId) {
  const response = await axios({
    method: 'get',
    url: `http://localhost:5000/api/quotations/${quotationId}/export/pdf`,
    responseType: 'stream'
  });
  
  const writer = fs.createWriteStream('quotation.pdf');
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
```

### Python Example

```python
import requests

def download_quotation_excel(quotation_id):
    url = f'http://localhost:5000/api/quotations/{quotation_id}/export/excel'
    response = requests.get(url)
    
    with open('quotation.xlsx', 'wb') as f:
        f.write(response.content)
```

## Testing

### Manual Testing

1. Create a test quotation with multiple parts
2. Add various operations and auxiliary costs
3. Export as PDF and verify:
   - All sections present
   - Calculations correct
   - Formatting professional
4. Export as Excel and verify:
   - All sheets present
   - Data accurate
   - Formulas work (if added)

### Automated Testing

```javascript
// Test export endpoints
describe('Export API', () => {
  it('should export PDF', async () => {
    const response = await request(app)
      .get('/api/quotations/1/export/pdf')
      .expect(200)
      .expect('Content-Type', /pdf/);
  });
  
  it('should export Excel', async () => {
    const response = await request(app)
      .get('/api/quotations/1/export/excel')
      .expect(200)
      .expect('Content-Type', /spreadsheet/);
  });
});
```

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Check browser console
4. Verify all dependencies installed
5. Test with simple quotation first

---

**Export feature is ready to use!** 🎉

Generate professional quotations in PDF or Excel format with one click.
