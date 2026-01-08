# Quick Reference: PDF Generation

## 🚀 Quick Start

### Download PDF from Quotation View:
1. Open any quotation
2. Click **"📄 Download PDF"** button
3. Done! PDF downloads automatically

### Download PDF from List:
1. Go to Quotations page
2. Click **"📄 PDF"** button next to any quotation
3. Done! PDF downloads immediately

## 📍 File Locations

```
Backend:
├── utils/pdfGenerator.js          (PDF generation logic)
├── controllers/quotationController.js (generatePDF method)
└── routes/index.js                (GET /api/quotations/:id/pdf)

Frontend:
├── services/api.js                (downloadPDF method)
├── components/Quotations/QuotationView.js (Download button)
└── components/Quotations/QuotationList.js (PDF button)

Documentation:
├── PDF_FEATURE.md                 (Complete feature docs)
├── PDF_TESTING.md                 (Testing guide)
└── PDF_IMPLEMENTATION_SUMMARY.md  (Implementation details)
```

## 🔗 API Endpoint

```
GET /api/quotations/:id/pdf
```

**Example:**
```
http://localhost:5000/api/quotations/1/pdf
```

## 🎨 What's in the PDF?

✅ Company header with branding  
✅ Quote number and status  
✅ Customer details  
✅ All parts with quantities  
✅ Material costs  
✅ Operations breakdown (machine, time, cost)  
✅ Auxiliary costs  
✅ Complete financial summary  
✅ Discount, margin, VAT calculations  
✅ Total quote value  
✅ Footer with validity and timestamp  

## ⚙️ Customization

### Add Logo:
Edit `backend/utils/pdfGenerator.js`, `addHeader()` method:
```javascript
doc.image('path/to/logo.png', 50, 30, { width: 100 });
```

### Change Colors:
Find and replace color codes:
- `#1e3c72` - Primary blue
- `#2a5298` - Secondary blue
- `#6c757d` - Gray

### Modify Layout:
Edit `generateQuotationPDF()` method in `pdfGenerator.js`

## 🐛 Troubleshooting

**PDF not downloading?**
- Check browser pop-up blocker
- Verify backend is running (port 5000)
- Check browser console (F12) for errors

**PDF is blank?**
- Ensure quotation has complete data
- Check backend console for errors
- Verify quotation ID exists

**Formatting issues?**
- Check numeric values are valid
- Ensure all required fields have data
- Verify currency symbols display correctly

## 💡 Tips

- PDFs work for ALL quotations (Draft, Submitted, Approved, Rejected)
- Generated on-demand (not stored)
- File name: `quotation-Q0000XXX.pdf`
- Average size: 50-200KB
- Opens in new browser tab
- Immediately downloadable

## 📚 More Information

- Full documentation: `PDF_FEATURE.md`
- Testing guide: `PDF_TESTING.md`
- Implementation details: `PDF_IMPLEMENTATION_SUMMARY.md`

---

**Feature Status**: ✅ Production Ready
