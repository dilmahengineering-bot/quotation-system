# PDF Generation Testing Guide

## How to Test the PDF Feature

### Method 1: Using the Web Interface (Recommended)

1. **Open the application** in your browser:
   - URL: http://localhost:3000

2. **Create a test quotation**:
   - Click "Create New Quotation" from the dashboard
   - Fill in the following sample data:
     - Customer: Select any customer (e.g., ABC Manufacturing Ltd)
     - Date: Today's date
     - Lead Time: 2 weeks
     - Payment Terms: Net 30
     - Currency: USD
   
3. **Add a sample part**:
   - Part Name: Test Bracket
   - Quantity: 10
   - Material Cost: 50
   
4. **Add an operation**:
   - Machine: CNC Mill 1
   - Operation Time: 2 hours
   
5. **Add auxiliary cost**:
   - Select "Setup Cost"
   
6. **Set financial details**:
   - Discount: 5%
   - Margin: 20%
   - VAT: 15%

7. **Submit the quotation**:
   - Click "Submit" to create the quotation

8. **Download PDF**:
   - Click "📄 Download PDF" button
   - The PDF will download automatically

### Method 2: Test with Existing Quotations

If there are existing quotations in the system:

1. Go to http://localhost:3000/quotations
2. Find any quotation in the list
3. Click the "📄 PDF" button to download immediately, OR
4. Click "View" to see details and then click "📄 Download PDF"

### Method 3: Direct API Test

You can test the API endpoint directly:

```bash
# Replace {id} with an actual quotation ID
http://localhost:5000/api/quotations/1/pdf
```

Open this URL in your browser to download the PDF directly.

### Verification Checklist

After downloading a PDF, verify it contains:

- ✅ Professional header with system title
- ✅ Quote number and status badge
- ✅ Customer information (name, email, contact, phone)
- ✅ Quotation date and terms
- ✅ All parts with names and quantities
- ✅ Material costs for each part
- ✅ Operations breakdown with machine, time, and costs
- ✅ Auxiliary costs itemized
- ✅ Part subtotals
- ✅ Complete cost summary with:
  - Total parts cost
  - Discount calculation
  - Margin calculation
  - VAT calculation
  - Final total
- ✅ Footer with validity period and generation date

### Troubleshooting

**PDF doesn't download:**
- Check browser's pop-up blocker
- Check browser console for errors (F12)
- Verify backend server is running (http://localhost:5000)

**PDF is blank or incomplete:**
- Ensure the quotation has complete data
- Check backend console for errors
- Verify all parts have operations and costs

**PDF formatting issues:**
- Check that numeric values are properly formatted
- Ensure currency symbols are displaying correctly
- Verify all text fields have data

## Sample Data for Testing

Use these values to create a comprehensive test quotation:

**Customer**: ABC Manufacturing Ltd

**Part 1**: "Aluminum Housing"
- Quantity: 25
- Material Cost: 150
- Operation: CNC Mill 1, 3 hours
- Auxiliary: Setup Cost + Inspection

**Part 2**: "Steel Shaft"
- Quantity: 50
- Material Cost: 75
- Operation: CNC Lathe 1, 1.5 hours
- Auxiliary: Tooling + Transport

**Financial Settings**:
- Discount: 10%
- Margin: 25%
- VAT: 15%

This will generate a comprehensive PDF showing multiple parts with different operations and costs.

## Expected Results

The generated PDF should be:
- **File size**: ~50-200KB
- **Format**: Standard A4 size
- **Quality**: Professional, print-ready
- **File name**: quotation-Q0000XXX.pdf (where XXX is the quote number)

## Next Steps After Testing

Once PDF generation is working:
1. Test with different data combinations
2. Verify calculations are accurate
3. Check formatting on different PDF viewers
4. Test with quotations containing many parts (pagination)
5. Consider adding company logo (see PDF_FEATURE.md for instructions)
