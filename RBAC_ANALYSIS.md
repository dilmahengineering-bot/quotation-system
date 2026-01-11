# Role-Based Access Control (RBAC) Analysis

## ⚠️ SPECIFICATION vs IMPLEMENTATION COMPARISON

### User's Specification
```
Role              | Permissions
------------------|------------------------------------------
Admin             | User management, all masters, all quotations
Sales/Technician  | Create quotation drafts, add parts & operations
Engineer          | Review & modify costing, submit for approval
Management        | Final approval, pricing lock, issue quotation
```

---

## 🔍 CURRENT FRONTEND IMPLEMENTATION

### Permission Matrix (from AuthContext.js)

| Permission | Admin | Sales | Technician | Engineer | Management |
|------------|-------|-------|------------|----------|------------|
| **Users** |
| users:read | ✅ | ❌ | ❌ | ❌ | ❌ |
| users:create | ✅ | ❌ | ❌ | ❌ | ❌ |
| users:update | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Customers** |
| customers:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| customers:create | ✅ | ✅ | ❌ | ❌ | ❌ |
| customers:update | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Machines** |
| machines:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| machines:create | ✅ | ❌ | ❌ | ✅ | ❌ |
| machines:update | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Auxiliary Costs** |
| auxiliary:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| auxiliary:create | ✅ | ❌ | ❌ | ✅ | ❌ |
| auxiliary:update | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Quotations** |
| quotations:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| quotations:create | ✅ | ✅ | ✅ | ❌ | ❌ |
| quotations:update | ✅ | ✅ | ✅ | ✅ | ❌ |
| quotations:submit | ✅ | ✅ | ✅ | ❌ | ❌ |
| quotations:engineer_approve | ✅ | ❌ | ❌ | ✅ | ❌ |
| quotations:management_approve | ✅ | ❌ | ❌ | ❌ | ✅ |
| quotations:issue | ✅ | ❌ | ❌ | ❌ | ✅ |
| quotations:reject | ✅ | ❌ | ❌ | ✅ | ✅ |

---

## 🚨 DISCREPANCIES FOUND

### 1. **ENGINEER Role - MAJOR DISCREPANCY**

**Specification says:**
- "Review & modify costing, **submit for approval**"

**Current Implementation:**
- ❌ Engineers **CANNOT** submit quotations (`quotations:submit` = false)
- ✅ Engineers **CAN** approve quotations (`quotations:engineer_approve` = true)
- ✅ Engineers **CAN** update quotations (`quotations:update` = true)

**Issue:** According to spec, Engineers should be able to "submit for approval" but in the current implementation:
- Sales/Technician creates draft → submits for approval
- Engineer reviews → approves (NOT submits)
- Management → final approval → issue

**The workflow is:**
```
Sales creates → Sales submits → Engineer approves → Management approves → Management issues
```

**Specification suggests Engineers should submit, not approve!**

---

### 2. **SALES/TECHNICIAN Role - Status Confusion**

**Specification says:**
- "Create quotation drafts, add parts & operations"

**Current Implementation:**
- ✅ Sales **CAN** create drafts (`quotations:create` = true)
- ✅ Sales **CAN** submit drafts (`quotations:submit` = true)
- ✅ Sales **CAN** update quotations (`quotations:update` = true)

**Clarification Needed:**
- Does "create quotation drafts" mean they can only create but NOT submit?
- Or can they submit for Engineer review?

**Current workflow allows Sales to submit, which seems reasonable.**

---

### 3. **MANAGEMENT Role - Limited Update Access**

**Specification says:**
- "Final approval, pricing lock, issue quotation"

**Current Implementation:**
- ✅ Management **CAN** approve (`quotations:management_approve` = true)
- ✅ Management **CAN** issue (`quotations:issue` = true)
- ❌ Management **CANNOT** update quotations (`quotations:update` = false)

**Clarification Needed:**
- Does "pricing lock" imply Management should be able to modify prices before approving?
- Currently Management can only approve/reject/issue, not modify.

---

### 4. **ENGINEER Role - Create Permission**

**Specification says:**
- "Review & modify costing, submit for approval"

**Current Implementation:**
- ❌ Engineers **CANNOT** create quotations (`quotations:create` = false)
- ✅ Engineers **CAN** update quotations (`quotations:update` = true)

**Analysis:**
- Spec implies Engineers only review/modify existing quotations
- Current implementation matches this (no create permission)
- **However**, "submit for approval" is missing - they have "approve" instead!

---

## 📊 WORKFLOW ANALYSIS

### Current Workflow (As Implemented)

```
1. Sales/Technician creates draft
   ↓
2. Sales/Technician submits for approval (status: Submitted)
   ↓
3. Engineer reviews & approves (status: Engineer Approved)
   ↓
4. Management approves (status: Management Approved)
   ↓
5. Management issues (status: Issued)
```

### Workflow According to Specification

```
1. Sales/Technician creates draft & adds parts/operations
   ↓
2. Engineer reviews, modifies costing, SUBMITS for approval (?)
   ↓
3. Management does final approval, pricing lock, issues quotation
```

**The spec suggests a 3-stage process but current implementation has 4 stages.**

---

## 🔧 RECOMMENDED ACTIONS

### Option A: Match Implementation to Spec (Simplified Workflow)

**Changes Required:**

1. **Engineer Role:**
   - Remove: `quotations:engineer_approve`
   - Add: `quotations:submit`
   - Keep: `quotations:update`

2. **Sales/Technician Role:**
   - Remove: `quotations:submit`
   - Keep: `quotations:create`, `quotations:update`

3. **Workflow:**
   ```
   Sales creates draft → Engineer modifies & submits → Management approves & issues
   ```

### Option B: Update Spec to Match Implementation (Current System)

**No code changes needed - just clarify the specification:**

```
Role              | Permissions
------------------|--------------------------------------------------
Admin             | User management, all masters, all quotations, all approvals
Sales/Technician  | Create quotation drafts, add parts & operations, submit for approval
Engineer          | Review & modify costing, engineer approval
Management        | Final approval, issue quotation
```

---

## 🎯 CRITICAL QUESTION

**Which workflow is correct?**

**A) Simple 3-stage (Matches original spec):**
- Sales creates → Engineer submits → Management issues

**B) Current 4-stage (Current implementation):**
- Sales creates & submits → Engineer approves → Management approves → Management issues

**Please confirm which workflow you want, and I will update the code accordingly.**

---

## 📁 Files Requiring Changes (if updating to match spec)

### Frontend Files
1. `frontend/src/context/AuthContext.js` - Update PERMISSIONS object
2. `frontend/src/components/Quotations/QuotationDetail.js` - Update button visibility logic

### Backend Files
3. `backend/middleware/authMiddleware.js` - Update permission checks
4. `backend/routes/index.js` - Update route permissions

### Database
5. `backend/database/schema.sql` - Workflow status definitions (if changing stages)

---

## 🧪 TESTING CHECKLIST

### Admin User (admin / admin123)
- [x] Access all menus (Users, Customers, Machines, Aux Costs, Quotations)
- [x] Create/Edit all master data
- [x] Full quotation CRUD
- [x] All approval buttons visible

### Sales User (john.sales / sales123)
- [x] Can create quotations
- [x] Can add parts & operations
- [ ] **VERIFY:** Should they submit or only create drafts?

### Engineer User (jane.engineer / engineer123)
- [x] Can view quotations
- [x] Can modify costing (update quotations)
- [ ] **VERIFY:** Should they SUBMIT or APPROVE?
- [x] Cannot create new quotations

### Management User (mike.manager / ???)
- [x] Can approve quotations
- [x] Can issue quotations
- [ ] **VERIFY:** Should they modify prices before approving?

---

## 💡 CURRENT STATUS

✅ **System is functional** with the current 4-stage workflow
⚠️ **Specification mismatch** regarding Engineer's role (submit vs approve)
📝 **Awaiting clarification** on preferred workflow

**System URLs:**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

**Test Users:**
- Admin: admin / admin123
- Sales: john.sales / sales123
- Engineer: jane.engineer / engineer123
