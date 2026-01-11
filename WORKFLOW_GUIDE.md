# Quotation Management System - Complete Workflow Guide

## System Overview
**Manufacturing Costing Sheets Management System**
- Backend: Node.js + Express + PostgreSQL (Port 5000)
- Frontend: React 18 (Port 3000)
- Database: PostgreSQL 12.22 (quotation_db)
- Authentication: JWT with bcrypt password hashing

---

## 1. LOGIN FLOW

### Access the System
- URL: http://localhost:3000
- Default Admin Credentials:
  - Username: `admin`
  - Password: `admin123`

### Available User Roles
1. **Admin** - Full system access including user management
2. **Sales** - Create and manage quotations
3. **Engineer** - Review and approve technical aspects
4. **Management** - Final approval authority
5. **Technician** - View and assist with quotations

### Current Active Users (7)
- admin (Admin) - System Administrator
- admin1 (Admin)
- Hirusha (Technician)
- Hirusha (Engineer)
- John Sales (Sales)
- natheesan (Engineer)
- Tech Support (Technician)

---

## 2. DASHBOARD

### Overview Statistics
- **Total Quotations**: 4
- **Draft Quotations**: 2
- **Status Distribution**: Real-time tracking
- **Recent Activities**: Last updated quotations

### Quick Access
- Create New Quotation
- View Pending Approvals
- Access Master Data
- User Management (Admin only)

---

## 3. MASTER DATA MANAGEMENT

### A. Customers (7 Records)
**Path**: Customers → List/Add/Edit

**Fields**:
- Company Name (required)
- Contact Person Name
- Email (required, unique)
- Phone
- Address
- VAT Number
- Status (Active/Disabled)

**Actions**:
- ✓ Add new customer
- ✓ Edit customer details
- ✓ Disable/Enable customer
- ✓ View customer quotations

---

### B. Machines (14 Records)
**Path**: Machines → List/Add/Edit

**Fields**:
- Machine Name (required, unique)
- Machine Type (required)
- Hourly Rate (required)
- Status (Active/Disabled)

**Purpose**: Used for operation cost calculations in quotations

**Actions**:
- ✓ Add new machine
- ✓ Edit machine details
- ✓ Update hourly rates
- ✓ Disable/Enable machine

---

### C. Auxiliary Costs (11 Records)
**Path**: Auxiliary Costs → List/Add/Edit

**Fields**:
- Cost Type (required, unique)
- Description
- Default Cost (required)
- Status (Active/Disabled)

**Purpose**: Additional costs like packaging, inspection, testing, etc.

**Actions**:
- ✓ Add new auxiliary cost type
- ✓ Edit cost details
- ✓ Update default costs
- ✓ Disable/Enable cost type

---

### D. Users (Admin Only - 7 Users)
**Path**: Users → List/Add/Edit

**Fields**:
- Full Name (required)
- Username (required, unique)
- Email (required, unique)
- Password (min 8 characters, only on create)
- Role (required)
- Status (Active/Disabled)

**Actions**:
- ✓ Add new user
- ✓ Edit user details (name, email, role)
- ✓ Reset user password (admin only)
- ✓ Disable user (prevents login)
- ✓ Enable disabled user
- ✗ Cannot disable own account

**Security**:
- Passwords are hashed with bcrypt
- Only Admin can access user management
- Disabled users cannot login
- Login validates active status

---

## 4. QUOTATION WORKFLOW

### A. Create New Quotation
**Path**: Quotations → New Quotation

#### Step 1: Header Information
- **Customer**: Select from dropdown (required)
- **Quotation Date**: Auto-filled with current date
- **Valid Until**: Optional expiry date
- **Lead Time**: Delivery timeframe
- **Payment Terms**: Payment conditions
- **Currency**: USD/EUR/GBP/LKR
- **Shipment Type**: Air/Sea/Land

#### Step 2: Add Parts
Click "Add Part" button for each component:

**Part Details**:
- Part Number (required)
- Part Description
- Unit Material Cost (required)
- Quantity (required)

**Operations** (Click "Add Operation"):
- Machine: Select from active machines
- Operation Time (hours): Required
- Cost: Auto-calculated from machine hourly rate

**Auxiliary Costs** (Click "Add Auxiliary Cost"):
- Cost Type: Select from active auxiliary costs
- Cost Amount: Required
- Notes: Optional

#### Step 3: Financial Calculations
**Auto-calculated**:
- Part Subtotal = (Material + Operations + Auxiliary) × Quantity
- Total Parts Cost = Sum of all part subtotals

**Adjustments**:
- Discount %: Percentage off subtotal
- Margin %: Profit margin addition
- VAT %: Tax percentage

**Final Calculation**:
```
Subtotal = Total Parts Cost
- Discount Amount = Subtotal × (Discount % / 100)
+ Margin Amount = Subtotal × (Margin % / 100)
After Discount/Margin = Subtotal - Discount + Margin
+ VAT Amount = After Discount/Margin × (VAT % / 100)
= Total Quote Value
```

#### Step 4: Save
- **Save as Draft**: Stores quotation in draft status
- Auto-generates Quote Number: QT00000001, QT00000002, etc.

---

### B. Edit Existing Quotation
**Path**: Quotations → Select Quote → Edit

**Capabilities**:
- ✓ Update all header information
- ✓ Modify parts, operations, auxiliary costs
- ✓ Recalculate totals automatically
- ✓ Changes are tracked with updated_at timestamp

**Data Transformation**: 
- Backend returns snake_case (e.g., part_number)
- Frontend converts to camelCase (e.g., partNumber)
- On save, converts back to snake_case for backend

---

### C. Submit Quotation
**Path**: Quotations → Select Quote → Submit

**Status Change**: Draft → Submitted

**Purpose**: Moves quotation into approval workflow

**Restrictions**:
- Cannot edit submitted quotations (must revert to draft first)
- Requires approval from Engineer and Management

---

### D. Approval Workflow

#### Engineer Approval
**Path**: Quotations → Select Quote → Engineer Approve

**Requirements**:
- User must have Engineer or Admin role
- Quotation must be in "Submitted" status

**Actions**:
- Approve: Status → "Engineer Approved"
- Reject: Status → "Rejected" (with comments)

#### Management Approval
**Path**: Quotations → Select Quote → Management Approve

**Requirements**:
- User must have Management or Admin role
- Quotation must be in "Engineer Approved" status

**Actions**:
- Approve: Status → "Management Approved"
- Reject: Status → "Rejected" (with comments)

#### Issue Quotation
**Path**: Quotations → Select Quote → Issue

**Requirements**:
- Quotation must be in "Management Approved" status

**Action**:
- Issue: Status → "Issued"
- Finalizes quotation for customer delivery

#### Revert to Draft
**Path**: Quotations → Select Quote → Revert to Draft

**Purpose**: Return quotation to draft for modifications

**Available when**:
- Quotation is in Submitted, Approved, or Rejected status

---

### E. Quotation Status Flow
```
Draft 
  ↓ [Submit]
Submitted 
  ↓ [Engineer Approve]
Engineer Approved 
  ↓ [Management Approve]
Management Approved 
  ↓ [Issue]
Issued ✓

Any status → [Revert to Draft] → Draft
Any approval stage → [Reject] → Rejected
```

---

## 5. EXPORT FEATURES

### A. PDF Export
**Path**: Quotations → Select Quote → Export PDF

**Document Title**: "MANUFACTURING COSTING SHEETS"

**Content Includes**:
- Company header with contact information
- Quote number and date
- Customer information (company, contact, email, phone, address)
- Quotation details (currency, lead time, payment terms, shipment)
- Parts & Operations table:
  - Part number and description
  - Quantity
  - Unit costs (material, operations, auxiliary)
  - Operations breakdown with machine and time
  - Auxiliary costs breakdown
- Financial summary:
  - Subtotal
  - Discount amount
  - Margin amount
  - VAT amount
  - Total quote value
- Footer with terms and conditions

**Format**: Professional PDF with formatting and company branding

---

### B. Excel Export
**Path**: Quotations → Select Quote → Export Excel

**Sheets Included**:
1. **Quotation Summary**: Header and totals
2. **Parts Details**: All parts with costs
3. **Operations**: Machine operations for each part
4. **Auxiliary Costs**: Additional costs per part

**Format**: Multi-sheet Excel workbook (.xlsx)

---

## 6. SEARCH & FILTERS

### Quotations List
- Search by quote number, customer name, status
- Filter by status: All, Draft, Submitted, Approved, Issued, Rejected
- Sort by date, quote number, customer

### Master Data
- Search across all master data tables
- Filter by active/disabled status
- Sort alphabetically or by creation date

---

## 7. SYSTEM FEATURES

### Authentication & Security
- ✓ JWT token-based authentication
- ✓ Password hashing with bcrypt (salt rounds: 10)
- ✓ Role-based access control (RBAC)
- ✓ Protected API routes with middleware
- ✓ Session management with token refresh
- ✓ Secure password storage (never plain text)

### Permissions System
**Admin**:
- Full access to all features
- User management (add, edit, disable, reset passwords)
- Approve quotations at any level

**Sales**:
- Create and edit quotations
- View customers and master data
- Submit quotations for approval

**Engineer**:
- Review quotations
- Engineer-level approval
- View all quotations

**Management**:
- Final approval authority
- View financial reports
- Management-level approval

**Technician**:
- View quotations
- Assist with technical details
- Limited edit permissions

### Data Validation
- ✓ Required field validation
- ✓ Unique constraints (username, email, customer email, machine name)
- ✓ Email format validation
- ✓ Numeric value validation
- ✓ Date range validation
- ✓ Password strength (minimum 8 characters)

### Error Handling
- ✓ User-friendly error messages
- ✓ Toast notifications for actions
- ✓ Form validation feedback
- ✓ API error logging (backend console)
- ✓ Graceful error recovery

---

## 8. CURRENT SYSTEM STATUS

### Database Statistics
- **Customers**: 7 active records
- **Machines**: 14 active records
- **Auxiliary Costs**: 11 active types
- **Users**: 7 active users
- **Quotations**: 4 records (2 draft, 2 others)

### Sample Quotation
- **Quote Number**: QT00000004
- **Customer**: Global Manufacturing Inc
- **Status**: Draft
- **Parts**: 1 part with operations and auxiliary costs
- **Total Value**: USD 226.37

### Working Features ✓
1. ✓ User authentication and login
2. ✓ Dashboard with statistics
3. ✓ Master data CRUD (Customers, Machines, Auxiliary Costs)
4. ✓ Quotation creation and editing
5. ✓ Parts, operations, and auxiliary costs management
6. ✓ Financial calculations (discount, margin, VAT)
7. ✓ Quotation submission workflow
8. ✓ Multi-level approval system
9. ✓ PDF export with professional formatting
10. ✓ Excel export with multiple sheets
11. ✓ User management (admin only)
12. ✓ Password reset functionality
13. ✓ User disable/enable
14. ✓ Role-based permissions
15. ✓ Search and filter functionality

---

## 9. QUICK START GUIDE

### For First-Time Users:

1. **Login**: Access http://localhost:3000
   - Username: `admin`
   - Password: `admin123`

2. **Add Master Data** (if not already present):
   - Navigate to Customers → Add your customers
   - Navigate to Machines → Add production machines
   - Navigate to Auxiliary Costs → Add cost types

3. **Create Your First Quotation**:
   - Go to Quotations → New Quotation
   - Select customer
   - Add parts with operations
   - Set margin and VAT
   - Save as Draft

4. **Submit for Approval**:
   - Open the saved quotation
   - Click "Submit" button
   - Status changes to "Submitted"

5. **Approve** (if you're Engineer/Management):
   - Engineer approves → "Engineer Approved"
   - Management approves → "Management Approved"
   - Final "Issue" → "Issued"

6. **Export**:
   - Click "Export PDF" for customer delivery
   - Click "Export Excel" for internal records

### For Admins:

7. **Manage Users**:
   - Go to Users menu
   - Add new users with appropriate roles
   - Reset passwords as needed
   - Disable users who should not access system

---

## 10. TROUBLESHOOTING

### Common Issues:

**Cannot Login**
- Check username and password are correct
- Verify user account is Active (not Disabled)
- Check backend server is running on port 5000

**Quotation Not Updating**
- Ensure all required fields are filled
- Check that parts have valid operations
- Verify backend console for specific errors

**PDF/Excel Export Not Working**
- Confirm quotation has been saved
- Check backend has write permissions to exports folder
- Verify all dependencies are installed (pdfkit, exceljs)

**Dashboard Statistics Not Loading**
- Refresh the page
- Check authentication token is valid
- Verify database connection

---

## 11. API ENDPOINTS SUMMARY

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/change-password` - Change own password
- POST `/api/auth/logout` - Logout

### Users (Admin Only)
- GET `/api/users` - List all users
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- PATCH `/api/users/:id/disable` - Disable user
- PATCH `/api/users/:id/enable` - Enable user
- POST `/api/users/:id/reset-password` - Reset password

### Customers
- GET `/api/customers` - List customers
- POST `/api/customers` - Create customer
- PUT `/api/customers/:id` - Update customer
- PATCH `/api/customers/:id/disable` - Disable customer

### Machines
- GET `/api/machines` - List machines
- POST `/api/machines` - Create machine
- PUT `/api/machines/:id` - Update machine
- PATCH `/api/machines/:id/disable` - Disable machine

### Auxiliary Costs
- GET `/api/auxiliary-costs` - List auxiliary costs
- POST `/api/auxiliary-costs` - Create auxiliary cost
- PUT `/api/auxiliary-costs/:id` - Update auxiliary cost
- PATCH `/api/auxiliary-costs/:id/disable` - Disable auxiliary cost

### Quotations
- GET `/api/quotations` - List quotations
- POST `/api/quotations` - Create quotation
- GET `/api/quotations/:id` - Get quotation details
- PUT `/api/quotations/:id` - Update quotation
- POST `/api/quotations/:id/submit` - Submit quotation
- POST `/api/quotations/:id/engineer-approve` - Engineer approval
- POST `/api/quotations/:id/management-approve` - Management approval
- POST `/api/quotations/:id/reject` - Reject quotation
- POST `/api/quotations/:id/issue` - Issue quotation
- POST `/api/quotations/:id/revert-draft` - Revert to draft
- GET `/api/quotations/statistics` - Dashboard statistics
- GET `/api/quotations/:id/export/pdf` - Export PDF
- GET `/api/quotations/:id/export/excel` - Export Excel

---

## 12. TECHNICAL NOTES

### Database Schema
- **users**: User accounts with roles and authentication
- **customers**: Customer master data
- **machines**: Machine master with hourly rates
- **auxiliary_costs**: Additional cost types
- **quotations**: Quotation headers with financial totals
- **quotation_parts**: Parts within quotations
- **part_operations**: Machine operations for parts
- **part_auxiliary_costs**: Auxiliary costs for parts

### Key Features
- Soft delete (is_active flag instead of hard delete)
- Timestamps (created_at, updated_at) on all records
- Auto-increment IDs
- Foreign key relationships with CASCADE delete
- Unique constraints on business keys

### Security Best Practices
- Never store plain text passwords
- Use parameterized queries (prevents SQL injection)
- JWT tokens expire after session
- CORS configured for allowed origins
- Input validation on both frontend and backend

---

## System Ready ✓

All features tested and working:
- ✓ Login & Authentication
- ✓ Dashboard Statistics
- ✓ Master Data Management (7 customers, 14 machines, 11 auxiliary costs)
- ✓ Quotation CRUD Operations
- ✓ Quotation Approval Workflow
- ✓ PDF Export (Manufacturing Costing Sheets)
- ✓ Excel Export (Multi-sheet)
- ✓ User Management (7 active users)
- ✓ Role-based Access Control
- ✓ Password Reset & User Disable

**System URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: PostgreSQL on localhost:5432 (quotation_db)

**Last Verified**: January 10, 2026
