# User Roles & GUI Access - Engineer and Sales

## Current System Users

| Username | Role | Full Name | Status |
|----------|------|-----------|--------|
| admin | admin | System Administrator | Active |
| admin1 | Admin | Hirusha | Active |
| user | Admin | admin1 | Active |
| john.sales | Sales | John Sales | Active |
| jane.engineer | Engineer | Hirusha | Active |
| mike.manager | Engineer | natheesan | Active |
| tech.support | technician | Tech Support | Active |

---

## SALES Role Permissions & GUI Access

### Login Credentials
- **Username**: `john.sales`
- **Password**: (Set by admin - need to reset if unknown)

### Dashboard Access
✅ **Dashboard**: Full access to overview and statistics

### Sidebar Navigation (What Sales Users See)
1. ✅ **Dashboard** - View quotation statistics
2. ✅ **Quotations** - Full access
3. ✅ **Customers** - Full access
4. ✅ **Machines** - View only (cannot create/edit)
5. ✅ **Auxiliary Costs** - View only (cannot create/edit)
6. ❌ **Users** - Hidden (Admin only)

### Detailed Permissions

#### Quotations Module
- ✅ **Read**: Can view all quotations
- ✅ **Create**: Can create new quotations
- ✅ **Update**: Can edit draft quotations
- ✅ **Submit**: Can submit quotations for approval
- ❌ **Engineer Approve**: Cannot approve (Engineer/Admin only)
- ❌ **Management Approve**: Cannot approve (Management/Admin only)
- ❌ **Issue**: Cannot issue (Management/Admin only)
- ❌ **Delete**: Cannot delete (Admin only)

**What Sales Can Do**:
1. Create quotations for customers
2. Add parts, operations, auxiliary costs
3. Calculate pricing with margin, discount, VAT
4. Submit quotations for approval
5. View submitted quotations status
6. Export PDFs and Excel for customer delivery

**What Sales Cannot Do**:
1. Approve quotations (need Engineer/Management)
2. Delete quotations
3. Change approved quotations
4. Issue final quotations

#### Customers Module
- ✅ **Read**: Can view all customers
- ✅ **Create**: Can add new customers
- ✅ **Update**: Can edit customer details
- ❌ **Delete**: Cannot delete (Admin only)

**What Sales Can Do**:
1. View customer list
2. Add new customers
3. Edit customer information
4. View customer quotation history

#### Machines Module
- ✅ **Read**: Can view machine list and hourly rates
- ❌ **Create**: Cannot add machines (Engineer/Admin only)
- ❌ **Update**: Cannot edit machines (Engineer/Admin only)
- ❌ **Delete**: Cannot delete (Admin only)

**What Sales Can Do**:
1. View machine types and hourly rates
2. Select machines for quotation operations

**What Sales Cannot Do**:
1. Add new machines
2. Change hourly rates
3. Edit machine details

#### Auxiliary Costs Module
- ✅ **Read**: Can view auxiliary cost types
- ❌ **Create**: Cannot add cost types (Engineer/Admin only)
- ❌ **Update**: Cannot edit cost types (Engineer/Admin only)
- ❌ **Delete**: Cannot delete (Admin only)

**What Sales Can Do**:
1. View auxiliary cost types
2. Use auxiliary costs in quotations

**What Sales Cannot Do**:
1. Add new cost types
2. Change default costs
3. Edit cost descriptions

---

## ENGINEER Role Permissions & GUI Access

### Login Credentials
- **Username**: `jane.engineer` or `mike.manager`
- **Password**: (Set by admin - need to reset if unknown)

### Dashboard Access
✅ **Dashboard**: Full access to overview and statistics

### Sidebar Navigation (What Engineer Users See)
1. ✅ **Dashboard** - View quotation statistics
2. ✅ **Quotations** - Full access with approval rights
3. ✅ **Customers** - View only
4. ✅ **Machines** - Full CRUD access
5. ✅ **Auxiliary Costs** - Full CRUD access
6. ❌ **Users** - Hidden (Admin only)

### Detailed Permissions

#### Quotations Module
- ✅ **Read**: Can view all quotations
- ❌ **Create**: Cannot create (Sales/Technician role)
- ✅ **Update**: Can edit quotations
- ❌ **Submit**: Cannot submit (Sales/Technician role)
- ✅ **Engineer Approve**: **Can approve technical aspects**
- ❌ **Management Approve**: Cannot management approve
- ✅ **Reject**: Can reject quotations with comments
- ❌ **Issue**: Cannot issue (Management/Admin only)
- ❌ **Delete**: Cannot delete (Admin only)

**What Engineers Can Do**:
1. **Review submitted quotations**
2. **Approve quotations** from engineering perspective
3. **Reject quotations** if technical issues found
4. Edit quotations for corrections
5. View all quotation details
6. Export PDFs and Excel

**What Engineers Cannot Do**:
1. Create new quotations (Sales role)
2. Submit quotations
3. Give management approval
4. Issue final quotations
5. Delete quotations

**Engineer Workflow**:
```
Sales submits quotation (Status: Submitted)
         ↓
Engineer reviews technical details
         ↓
[Option A] Engineer Approves → Status: Engineer Approved
[Option B] Engineer Rejects → Status: Rejected (with comments)
         ↓
Management reviews (if approved)
         ↓
Management Approves → Status: Management Approved
         ↓
Management Issues → Status: Issued
```

#### Customers Module
- ✅ **Read**: Can view all customers
- ❌ **Create**: Cannot add customers (Sales/Admin only)
- ❌ **Update**: Cannot edit customers (Sales/Admin only)
- ❌ **Delete**: Cannot delete (Admin only)

**What Engineers Can Do**:
1. View customer list
2. View customer details
3. View customer quotation history

#### Machines Module
- ✅ **Read**: Can view all machines
- ✅ **Create**: **Can add new machines**
- ✅ **Update**: **Can edit machine details and hourly rates**
- ❌ **Delete**: Cannot delete (Admin only)

**What Engineers Can Do**:
1. Add new machine types
2. Set hourly rates
3. Update machine specifications
4. Manage machine catalog
5. Disable/enable machines

**Why Engineers Have This Access**:
Engineers understand:
- Machine capabilities
- Production costs
- Operation time requirements
- Technical specifications

#### Auxiliary Costs Module
- ✅ **Read**: Can view all auxiliary costs
- ✅ **Create**: **Can add new cost types**
- ✅ **Update**: **Can edit cost details**
- ❌ **Delete**: Cannot delete (Admin only)

**What Engineers Can Do**:
1. Add new auxiliary cost types (packaging, testing, inspection, etc.)
2. Set default costs
3. Update cost descriptions
4. Manage cost catalog
5. Disable/enable cost types

**Why Engineers Have This Access**:
Engineers determine:
- Manufacturing overhead costs
- Quality control costs
- Testing and inspection requirements
- Technical support costs

---

## Role Comparison Table

| Feature | Admin | Sales | Engineer | Management | Technician |
|---------|-------|-------|----------|------------|------------|
| **Dashboard** | ✅ Full | ✅ View | ✅ View | ✅ View | ✅ View |
| **Create Quotations** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Edit Quotations** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Submit Quotations** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Engineer Approve** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Management Approve** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Reject Quotations** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Issue Quotations** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Add Customers** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Customers** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Add Machines** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Edit Machines** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Add Auxiliary Costs** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Edit Auxiliary Costs** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Export PDF/Excel** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## GUI Features by Role

### Sales User GUI
**Visible Menu Items**:
- Dashboard (with statistics)
- Quotations (with Create, Edit, Submit buttons)
- Customers (with Create, Edit buttons)
- Machines (view only, no action buttons)
- Auxiliary Costs (view only, no action buttons)

**Hidden/Disabled**:
- Users menu (not visible)
- Approve buttons on quotations (disabled)
- Delete buttons (disabled)
- Machine add/edit buttons (disabled)
- Auxiliary cost add/edit buttons (disabled)

### Engineer User GUI
**Visible Menu Items**:
- Dashboard (with statistics)
- Quotations (with Approve, Reject buttons visible)
- Customers (view only)
- Machines (with Create, Edit buttons)
- Auxiliary Costs (with Create, Edit buttons)

**Action Buttons Available**:
- ✅ "Engineer Approve" button on submitted quotations
- ✅ "Reject" button on quotations
- ✅ "Add Machine" button in Machines list
- ✅ "Edit Machine" button in Machines list
- ✅ "Add Auxiliary Cost" button
- ✅ "Edit Auxiliary Cost" button

**Hidden/Disabled**:
- Users menu (not visible)
- Create Quotation button (disabled for engineers)
- Submit button (not their workflow)
- Management Approve button (disabled)
- Issue button (disabled)
- Customer add/edit buttons (disabled)

---

## Testing the GUI

### To Test Sales Role:
1. Login as: `john.sales`
2. Password: (Need admin to reset if unknown)
3. **Expected to see**:
   - Dashboard with statistics
   - Quotations menu with "New Quotation" button
   - Customers menu with "Add Customer" button
   - Machines menu (no add/edit buttons)
   - Auxiliary Costs menu (no add/edit buttons)
   - NO Users menu
4. **In Quotations**:
   - Can click "New Quotation"
   - Can edit draft quotations
   - Can submit quotations
   - CANNOT see "Engineer Approve" button
   - CANNOT see "Management Approve" button

### To Test Engineer Role:
1. Login as: `jane.engineer` or `mike.manager`
2. Password: (Need admin to reset if unknown)
3. **Expected to see**:
   - Dashboard with statistics
   - Quotations menu (can view, no create button)
   - Customers menu (view only)
   - Machines menu with "Add Machine" button
   - Auxiliary Costs menu with "Add Auxiliary Cost" button
   - NO Users menu
4. **In Quotations**:
   - CANNOT click "New Quotation" (button hidden/disabled)
   - CAN see "Engineer Approve" button on submitted quotes
   - CAN see "Reject" button
   - CANNOT see "Management Approve" button
   - CANNOT see "Issue" button
5. **In Machines**:
   - CAN click "Add Machine"
   - CAN edit existing machines
   - CAN update hourly rates
6. **In Auxiliary Costs**:
   - CAN click "Add Auxiliary Cost"
   - CAN edit cost types
   - CAN update default costs

---

## How to Reset User Passwords (Admin Only)

1. Login as admin
2. Go to **Users** menu
3. Find the user (john.sales, jane.engineer, mike.manager)
4. Click the **🔑 Key icon** next to the user
5. Enter new password (minimum 8 characters)
6. Click "Reset Password"
7. Provide new credentials to the user

**Suggested Passwords**:
- Sales: `sales123` or `Sales@2026`
- Engineer: `engineer123` or `Eng@2026`

---

## Summary

### Sales Role 🛒
**Focus**: Customer-facing operations
- Create and manage quotations
- Manage customer database
- Submit quotes for technical review
- Cannot approve or modify technical settings

### Engineer Role 🔧
**Focus**: Technical review and infrastructure
- Approve quotations from technical perspective
- Manage machine catalog and hourly rates
- Manage auxiliary cost types
- Cannot create quotations or manage customers
- Acts as technical gatekeeper in approval workflow

### Key Differences
| Aspect | Sales | Engineer |
|--------|-------|----------|
| Create Quotations | ✅ Yes | ❌ No |
| Approve Quotations | ❌ No | ✅ Yes (Engineer level) |
| Manage Customers | ✅ Yes | ❌ No |
| Manage Machines | ❌ No | ✅ Yes |
| Manage Auxiliary Costs | ❌ No | ✅ Yes |
| Role in Workflow | Initiator | Reviewer/Approver |

---

## Current System Status
- ✅ Permissions system implemented
- ✅ Role-based menu visibility
- ✅ Action button visibility control
- ✅ API-level permission enforcement
- ✅ Frontend permission checks (AuthContext)
- ✅ Backend middleware protection (isAdmin)

**To fully test**: Need to reset passwords for john.sales and jane.engineer users.
