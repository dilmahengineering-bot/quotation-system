# Complete File Structure

This document describes every file in the Quotation Management System.

## 📁 Project Root

```
quotation-system/
├── backend/                 # Node.js backend application
├── frontend/                # React frontend application
├── Documentation files      # 11 comprehensive guides
├── Installation scripts     # 4 automation scripts
└── Configuration files      # Git and environment configs
```

**Total Files:** 45 production-ready files

---

## 📚 Documentation Files (11 files)

### README.md
**Purpose:** Main project documentation  
**Contains:**
- Feature overview
- Installation instructions
- Architecture description
- API endpoint list
- Setup procedures
- Sample data information
- Troubleshooting basics

### QUICKSTART.md
**Purpose:** 5-minute getting started guide  
**Contains:**
- Rapid setup steps
- Quick installation commands
- Common issues and fixes
- First steps with the system

### API_DOCUMENTATION.md
**Purpose:** Complete API reference  
**Contains:**
- All endpoints documented
- Request/response examples
- Error codes
- Calculation formulas
- Usage examples with cURL

### DEPLOYMENT.md
**Purpose:** Production deployment guide  
**Contains:**
- Traditional server setup
- Docker deployment
- Database configuration
- Security best practices
- Monitoring setup
- Backup strategies
- Update procedures

### TESTING.md
**Purpose:** Comprehensive testing guide  
**Contains:**
- API testing procedures
- Frontend testing checklist
- Database verification
- Test scenarios
- Performance testing
- Acceptance criteria

### TROUBLESHOOTING.md
**Purpose:** Problem-solving guide  
**Contains:**
- Common issues and solutions
- Installation problems
- Backend issues
- Frontend issues
- Database problems
- Performance issues
- Debugging tips

### PROJECT_SUMMARY.md
**Purpose:** High-level project overview  
**Contains:**
- Feature summary
- Technical specifications
- Use cases
- Business value
- File summary
- Key highlights

### CHANGELOG.md
**Purpose:** Version history and changes  
**Contains:**
- Release notes
- Feature additions
- Bug fixes
- Future roadmap
- Known issues

### CONTRIBUTING.md
**Purpose:** Contribution guidelines  
**Contains:**
- Code of conduct
- Development workflow
- Coding standards
- Commit conventions
- Pull request process
- Testing requirements

### LICENSE
**Purpose:** MIT License  
**Contains:**
- Software license terms
- Usage rights
- Copyright information

### .gitignore (Root)
**Purpose:** Git ignore rules  
**Contains:**
- Node modules exclusion
- Environment files
- Build directories
- IDE files
- OS files

---

## 🔧 Backend Files (17 files)

### Directory Structure
```
backend/
├── config/              # Configuration
├── controllers/         # Request handlers
├── models/             # Business logic
├── routes/             # API routing
├── database/           # SQL schema
├── server.js           # Main entry point
├── package.json        # Dependencies
└── .env files          # Environment config
```

### Configuration Files

#### backend/package.json
**Purpose:** Node.js project configuration  
**Contains:**
- Dependencies list
- Scripts (start, dev)
- Project metadata

#### backend/.env
**Purpose:** Environment variables (development)  
**Contains:**
- Database credentials
- Server port
- Environment type

#### backend/.env.example
**Purpose:** Environment template  
**Contains:**
- Required variables
- Example values
- Comments

#### backend/.gitignore
**Purpose:** Backend-specific git rules  
**Contains:**
- node_modules
- .env files
- Logs
- Build artifacts

### Core Application Files

#### backend/server.js
**Purpose:** Main application entry point  
**Contains:**
- Express server setup
- Middleware configuration
- Route mounting
- Error handling
- Server startup

**Key Features:**
- CORS enabled
- Body parser configured
- Health check endpoint
- Global error handler

#### backend/config/database.js
**Purpose:** Database connection configuration  
**Contains:**
- PostgreSQL connection pool
- Database credentials from env
- Connection settings

**Key Features:**
- Environment-based configuration
- Connection pooling
- Error handling

#### backend/routes/index.js
**Purpose:** API route definitions  
**Contains:**
- All REST endpoints
- Route to controller mapping
- HTTP method definitions

**Endpoints:**
- /api/machines (6 endpoints)
- /api/customers (6 endpoints)
- /api/auxiliary-costs (6 endpoints)
- /api/quotations (6 endpoints)

### Model Files (4 files)

#### backend/models/Machine.js
**Purpose:** Machine business logic  
**Contains:**
- CRUD operations
- Database queries
- Data validation

**Methods:**
- `getAll()` - Fetch all active machines
- `getById(id)` - Get specific machine
- `create(data)` - Create new machine
- `update(id, data)` - Update machine
- `disable(id)` - Soft delete
- `enable(id)` - Reactivate

#### backend/models/Customer.js
**Purpose:** Customer business logic  
**Contains:**
- CRUD operations
- Duplicate prevention
- Contact management

**Methods:**
- `getAll()` - Fetch all active customers
- `getById(id)` - Get specific customer
- `create(data)` - Create new customer
- `update(id, data)` - Update customer
- `disable(id)` - Soft delete
- `enable(id)` - Reactivate

#### backend/models/AuxiliaryCost.js
**Purpose:** Auxiliary cost business logic  
**Contains:**
- CRUD operations
- Default cost management
- Cost type definitions

**Methods:**
- `getAll()` - Fetch all active costs
- `getById(id)` - Get specific cost
- `create(data)` - Create new cost type
- `update(id, data)` - Update cost
- `disable(id)` - Soft delete
- `enable(id)` - Reactivate

#### backend/models/Quotation.js
**Purpose:** Quotation business logic (COMPLEX)  
**Contains:**
- Quote number generation
- Multi-part quotation handling
- Operation cost calculations
- Auxiliary cost management
- Financial calculations
- Transaction support

**Methods:**
- `generateQuoteNumber()` - Auto-generate QT number
- `create(data)` - Create full quotation with parts/operations
- `getById(id)` - Get complete quotation details
- `getAll()` - List all quotations
- `update(id, data)` - Update quotation
- `updateStatus(id, status)` - Change quotation status
- `delete(id)` - Hard delete quotation
- `calculateTotals(client, id)` - Recalculate all costs

**Calculation Logic:**
```javascript
// Part level
unit_operations_cost = Σ(machine_rate × time)
unit_auxiliary_cost = Σ(auxiliary_costs)
unit_total = material + operations + auxiliary
part_subtotal = unit_total × quantity

// Quotation level
subtotal = Σ(part_subtotals)
discount_amount = subtotal × discount%
after_discount = subtotal - discount_amount
margin_amount = after_discount × margin%
after_margin = after_discount + margin_amount
vat_amount = after_margin × vat%
total = after_margin + vat_amount
```

### Controller Files (4 files)

#### backend/controllers/machineController.js
**Purpose:** Handle machine HTTP requests  
**Contains:**
- Request validation
- Response formatting
- Error handling

**Endpoints:**
- GET /machines
- GET /machines/:id
- POST /machines
- PUT /machines/:id
- PATCH /machines/:id/disable
- PATCH /machines/:id/enable

#### backend/controllers/customerController.js
**Purpose:** Handle customer HTTP requests  
**Contains:**
- Request validation
- Duplicate checking
- Error handling

**Endpoints:**
- GET /customers
- GET /customers/:id
- POST /customers
- PUT /customers/:id
- PATCH /customers/:id/disable
- PATCH /customers/:id/enable

#### backend/controllers/auxiliaryCostController.js
**Purpose:** Handle auxiliary cost HTTP requests  
**Contains:**
- Request validation
- Response formatting
- Error handling

**Endpoints:**
- GET /auxiliary-costs
- GET /auxiliary-costs/:id
- POST /auxiliary-costs
- PUT /auxiliary-costs/:id
- PATCH /auxiliary-costs/:id/disable
- PATCH /auxiliary-costs/:id/enable

#### backend/controllers/quotationController.js
**Purpose:** Handle quotation HTTP requests  
**Contains:**
- Complex data validation
- Transaction handling
- Error management

**Endpoints:**
- GET /quotations
- GET /quotations/:id
- POST /quotations
- PUT /quotations/:id
- PATCH /quotations/:id/status
- DELETE /quotations/:id

### Database Files

#### backend/database/schema.sql
**Purpose:** Complete database schema  
**Contains:**
- Table definitions (7 tables)
- Relationships and constraints
- Indexes for performance
- Auto-increment sequences
- Sample data (INSERT statements)
- Helper functions

**Tables Created:**
1. machines
2. customers
3. auxiliary_costs
4. quotations
5. quotation_parts
6. part_operations
7. part_auxiliary_costs

**Sample Data:**
- 5 Machines
- 2 Customers
- 5 Auxiliary Cost Types

---

## 🎨 Frontend Files (13 files)

### Directory Structure
```
frontend/
├── public/             # Static files
├── src/
│   ├── components/    # React components
│   ├── services/      # API integration
│   ├── App.js        # Main component
│   ├── App.css       # Global styles
│   └── index.js      # Entry point
├── package.json       # Dependencies
└── .env files        # Environment config
```

### Configuration Files

#### frontend/package.json
**Purpose:** React project configuration  
**Contains:**
- Dependencies (React, React Router, Axios)
- Scripts (start, build, test)
- Build configuration

#### frontend/.env
**Purpose:** Environment variables (development)  
**Contains:**
- API URL configuration

#### frontend/.env.example
**Purpose:** Environment template  
**Contains:**
- API URL example

#### frontend/.gitignore
**Purpose:** Frontend-specific git rules  
**Contains:**
- node_modules
- build/
- .env files

#### frontend/public/index.html
**Purpose:** HTML template  
**Contains:**
- Root div element
- Page metadata
- Title

### Core Application Files

#### frontend/src/index.js
**Purpose:** React application entry point  
**Contains:**
- React DOM rendering
- Root component mounting
- Strict mode wrapper

#### frontend/src/App.js
**Purpose:** Main application component  
**Contains:**
- React Router setup
- Navigation bar
- Route definitions
- Layout structure

**Routes:**
- / → Dashboard
- /machines → MachineList
- /customers → CustomerList
- /auxiliary-costs → AuxiliaryCostList
- /quotations → QuotationList
- /quotations/new → QuotationForm
- /quotations/:id → QuotationView
- /quotations/:id/edit → QuotationForm

#### frontend/src/App.css
**Purpose:** Global styles (COMPREHENSIVE)  
**Contains:**
- Reset and base styles
- Navbar styling
- Card layouts
- Button variants
- Form styles
- Table styles
- Grid systems
- Status badges
- Modal/overlay styles
- Loading animations
- Alert messages
- Cost summary styling
- Responsive breakpoints

**CSS Classes:**
- Layout: navbar, main-content, card
- Components: btn, form-control, table, badge
- Grid: grid-2, grid-3, grid-4
- Status: badge-draft, badge-approved, etc.
- Special: part-section, operation-row, cost-summary

#### frontend/src/services/api.js
**Purpose:** API integration layer  
**Contains:**
- Axios configuration
- API endpoint functions
- Request/response handling

**API Functions:**
- machineAPI (6 methods)
- customerAPI (6 methods)
- auxiliaryCostAPI (6 methods)
- quotationAPI (6 methods)

### Component Files (7 files)

#### frontend/src/components/Dashboard.js
**Purpose:** Dashboard overview page  
**Contains:**
- Statistics cards
- Recent quotations
- Quick action buttons
- Loading states

**Features:**
- Total quotations count
- Status breakdown (Draft, Submitted, Approved)
- Recent quotations table
- Navigation links

#### frontend/src/components/Machines/MachineList.js
**Purpose:** Machine management interface  
**Contains:**
- Machine list display
- CRUD modal forms
- Inline editing
- Status management

**Features:**
- Table view of all machines
- Add new machine modal
- Edit machine modal
- Disable/enable machines
- Form validation
- Real-time updates

#### frontend/src/components/Customers/CustomerList.js
**Purpose:** Customer management interface  
**Contains:**
- Customer list display
- CRUD modal forms
- Contact information
- Address management

**Features:**
- Table view of all customers
- Add new customer modal
- Edit customer modal
- Disable/enable customers
- Email validation
- Duplicate prevention

#### frontend/src/components/AuxiliaryCosts/AuxiliaryCostList.js
**Purpose:** Auxiliary cost management  
**Contains:**
- Cost type list
- CRUD modal forms
- Default cost management

**Features:**
- Table view of all cost types
- Add new cost type modal
- Edit cost modal
- Disable/enable costs
- Default cost configuration

#### frontend/src/components/Quotations/QuotationList.js
**Purpose:** Quotation listing and filtering  
**Contains:**
- Quotation table
- Status filtering
- Action buttons
- Navigation

**Features:**
- All quotations display
- Filter by status dropdown
- View/Edit/Delete actions
- Status badges
- Currency display

#### frontend/src/components/Quotations/QuotationForm.js (COMPLEX - 500+ lines)
**Purpose:** Create/Edit quotation interface  
**Contains:**
- Multi-section form
- Dynamic part management
- Operation management
- Cost calculations
- Real-time updates

**Sections:**
1. General Information
   - Customer selection
   - Date, currency
   - Terms and conditions

2. Parts Section (Dynamic)
   - Add/remove parts
   - Part details
   - Material costs
   - Quantity

3. Operations (Per Part)
   - Add/remove operations
   - Machine selection
   - Time entry
   - Cost display

4. Auxiliary Costs (Per Part)
   - Add/remove costs
   - Cost type selection
   - Amount entry
   - Default auto-fill

5. Financial Summary
   - Discount percentage
   - Margin percentage
   - VAT percentage
   - Total calculations

**Calculations:**
- Part-level totals
- Real-time updates
- Quotation-level totals
- Visual cost breakdown

**Features:**
- Unlimited parts
- Unlimited operations per part
- Unlimited auxiliary costs per part
- Real-time calculation display
- Form validation
- Save draft or submit
- Edit existing quotations

#### frontend/src/components/Quotations/QuotationView.js
**Purpose:** View quotation details  
**Contains:**
- Complete quotation display
- Customer information
- Parts breakdown
- Operations details
- Financial summary
- Status management

**Sections:**
1. Header
   - Quote number
   - Status badge
   - Action buttons

2. General Information
   - Customer details
   - Contact information
   - Terms

3. Parts Breakdown
   - Part details
   - Operations table
   - Auxiliary costs table
   - Part subtotal

4. Financial Summary
   - All calculations
   - Line-by-line breakdown
   - Total quote value

**Actions:**
- Edit (for drafts)
- Submit (draft to submitted)
- Approve/Reject (for submitted)
- Delete (for drafts)
- Back to list

---

## 🚀 Installation Scripts (4 files)

### install.sh (Unix/Linux/Mac)
**Purpose:** Automated installation  
**Contains:**
- Prerequisite checking
- Database creation
- Schema initialization
- Dependency installation
- Environment setup

**Steps:**
1. Check Node.js and PostgreSQL
2. Create database
3. Initialize schema
4. Install backend dependencies
5. Install frontend dependencies
6. Configure environment files

### install.bat (Windows)
**Purpose:** Automated installation for Windows  
**Contains:**
- Same functionality as install.sh
- Windows-specific commands
- Batch script syntax

### start.sh (Unix/Linux/Mac)
**Purpose:** Start both servers  
**Contains:**
- Backend startup
- Frontend startup
- Process management
- Graceful shutdown

**Features:**
- Starts both servers simultaneously
- Shows status messages
- Handles Ctrl+C cleanup

### start.bat (Windows)
**Purpose:** Start both servers on Windows  
**Contains:**
- Same functionality as start.sh
- Opens separate command windows
- Windows-specific commands

---

## 📊 Complete Statistics

### By Type
- **Documentation:** 11 files
- **Backend Code:** 11 files
- **Frontend Code:** 10 files
- **Configuration:** 9 files
- **Scripts:** 4 files
- **Total:** 45 files

### By Language
- **JavaScript:** 22 files
- **Markdown:** 11 files
- **SQL:** 1 file
- **CSS:** 1 file
- **HTML:** 1 file
- **JSON:** 2 files
- **Shell Script:** 2 files
- **Batch:** 2 files
- **Config:** 3 files

### Lines of Code (Approximate)
- **Backend JavaScript:** ~1,500 lines
- **Frontend JavaScript:** ~2,000 lines
- **SQL:** ~200 lines
- **CSS:** ~700 lines
- **Documentation:** ~5,000 lines
- **Total:** ~9,400 lines

---

## 🎯 Key Features by File

### Most Complex Files
1. **QuotationForm.js** (~500 lines) - Dynamic form with calculations
2. **Quotation.js** (~350 lines) - Complex business logic
3. **QuotationView.js** (~300 lines) - Comprehensive display
4. **App.css** (~700 lines) - Complete styling system
5. **schema.sql** (~200 lines) - Full database schema

### Most Important Files
1. **server.js** - Backend entry point
2. **App.js** - Frontend routing
3. **Quotation.js** - Core business logic
4. **schema.sql** - Database structure
5. **README.md** - Project documentation

---

## 🔍 File Dependencies

### Backend Dependencies
```
server.js
├── routes/index.js
│   ├── controllers/*.js
│   │   └── models/*.js
│   │       └── config/database.js
```

### Frontend Dependencies
```
index.js
├── App.js
│   ├── components/**/*.js
│   │   └── services/api.js
│   └── App.css
```

---

**This file structure is production-ready, well-documented, and easy to extend!**
