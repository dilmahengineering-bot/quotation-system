# Changelog

All notable changes to the Quotation Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-08

### Added - PDF and Excel Export Features

#### Backend Export Services
- **PDF Export Service** (`pdfExportService.js`)
  - Professional multi-page PDF generation
  - Complete quotation details with formatting
  - Parts breakdown with operations
  - Financial summary with highlighting
  - Header with quote number and status
  - Footer with page numbers
  - Customizable branding ready

- **Excel Export Service** (`excelExportService.js`)
  - Multi-sheet Excel workbook generation
  - Sheet 1: Quotation Summary
  - Sheet 2: Parts Breakdown
  - Sheet 3: Operations Detail
  - List export for all quotations
  - Formatted columns and headers

#### New API Endpoints
- `GET /api/quotations/:id/export/pdf` - Export single quotation as PDF
- `GET /api/quotations/:id/export/excel` - Export single quotation as Excel
- `GET /api/quotations/export/excel/list` - Export all quotations as Excel

#### Frontend Export Features
- Export buttons in QuotationView component
- Export list button in QuotationList component
- One-click PDF download
- One-click Excel download
- Professional file naming

#### Documentation
- **EXPORT_FEATURES.md** - Complete export guide
- API documentation updated with export endpoints
- Usage examples and customization guide

#### Dependencies Added
- `pdfkit@0.13.0` - PDF generation library
- `xlsx@0.18.5` - Excel generation library

### Features
- Export individual quotations as PDF
- Export individual quotations as Excel (3 sheets)
- Export all quotations list as Excel
- Professional PDF formatting with colors
- Multi-page PDF support
- Structured Excel workbooks
- Download buttons in UI
- Automatic file naming

## [1.0.0] - 2024-01-08

### Added - Complete Initial Release

#### Backend Features
- RESTful API with Express.js
- PostgreSQL database integration
- Complete CRUD operations for all entities
- Auto-generated quote numbers (10 digits with QT prefix)
- Real-time cost calculation engine
- Transaction support for data integrity
- Machine Master management
- Customer Master management
- Auxiliary Cost Master management
- Comprehensive quotation creation and management
- Multi-part quotation support
- Multi-operation per part support
- Status workflow (Draft, Submitted, Approved, Rejected)
- Financial calculations (discount, margin, VAT)
- Multiple currency support (USD, LKR, EUR, GBP)
- **PDF Export**: Professional PDF generation with PDFKit
- **Excel Export**: Multi-sheet Excel workbooks with detailed breakdowns

#### Frontend Features
- React 18 application with React Router
- Professional industrial UI design
- Card-based layout system
- Dashboard with statistics and recent quotations
- Machine management interface with modal forms
- Customer management interface with validation
- Auxiliary cost management interface
- Comprehensive quotation creation form
- Dynamic part and operation management
- Real-time cost calculations in UI
- Quotation list with filtering by status
- Detailed quotation view
- Status management interface
- Responsive design for desktop and tablet
- **PDF Export Button**: One-click PDF download
- **Excel Export Button**: One-click Excel download

#### Database Schema
- Normalized relational database design
- 7 core tables with proper relationships
- Foreign key constraints
- Cascade delete rules
- Soft delete for master data
- Auto-generated IDs for all entities
- Sample data (5 machines, 2 customers, 5 auxiliary costs)
- Optimized indexes for performance

#### Documentation
- Comprehensive README with setup instructions
- Complete API documentation with examples
- Production deployment guide
- Quick start guide (5-minute setup)
- Testing guide with test scenarios
- Troubleshooting guide
- Project summary

#### Developer Tools
- Installation scripts (Unix and Windows)
- Startup scripts for easy launch
- Environment configuration files
- .gitignore files
- Package configuration files

### Technical Specifications
- Node.js backend
- React frontend
- PostgreSQL database
- RESTful API architecture
- Real-time calculations
- Form validation (client and server)
- Error handling
- CORS configuration
- Connection pooling ready
- Production-ready code structure

### Calculation Logic Implemented
- Part-level calculations
  - Unit Operations Cost = Σ(Machine Rate × Time)
  - Unit Auxiliary Cost = Σ(Auxiliary Costs)
  - Unit Total Cost = Material + Operations + Auxiliary
  - Part Subtotal = Unit Total × Quantity
- Quotation-level calculations
  - Subtotal = Σ(Part Subtotals)
  - Discount Amount = Subtotal × Discount%
  - After Discount = Subtotal - Discount Amount
  - Margin Amount = After Discount × Margin%
  - After Margin = After Discount + Margin Amount
  - VAT Amount = After Margin × VAT%
  - Total Quote Value = After Margin + VAT Amount

### Sample Data Included
- 5 Pre-configured Machines
  - CNC Mill 1 ($75/hr)
  - CNC Lathe 1 ($65/hr)
  - EDM Machine 1 ($90/hr)
  - WEDM Machine 1 ($85/hr)
  - Grinder 1 ($55/hr)
- 5 Auxiliary Cost Types
  - Setup Cost ($50)
  - Inspection ($30)
  - Tooling ($100)
  - Transport ($25)
  - Packaging ($20)
- 2 Sample Customers
  - ABC Manufacturing Ltd
  - XYZ Engineering Corp

## Future Enhancements (Roadmap)

### Version 1.2.0 (Planned)
- [ ] Email quotations to customers with PDF attachment
- [ ] Batch export multiple quotations
- [ ] Custom PDF templates and branding
- [ ] Export to other formats (Word, HTML)
- [ ] User authentication and authorization
- [ ] Multi-user support with roles
- [ ] Approval workflow system
- [ ] Comments and notes on quotations
- [ ] Quotation history tracking

### Version 1.3.0 (Planned)
- [ ] Advanced dashboard with charts
- [ ] Quotation analytics
- [ ] Revenue reporting
- [ ] Win/loss rate tracking
- [ ] Customer analytics

### Version 2.0.0 (Planned)
- [ ] Quotation templates
- [ ] Duplicate quotation feature
- [ ] Bulk operations
- [ ] Advanced search and filtering
- [ ] Custom fields support
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Multi-language support

## Known Issues

None at this time. Please report issues via GitHub.

## Support

For support, please refer to:
- README.md for general documentation
- TROUBLESHOOTING.md for common issues
- TESTING.md for testing procedures
- API_DOCUMENTATION.md for API details

---

## Version History

- **1.0.0** (2024-01-08) - Initial release with complete features
