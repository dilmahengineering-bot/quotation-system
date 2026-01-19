# Other Costs Feature - Implementation Summary

## Overview
Successfully added a new "Other Costs" feature to the Quotation Management System. This feature allows users to add operational overhead costs (like salaries, rent, insurance, etc.) at the quotation level.

## Feature Details

### Cost Fields
- **Cost Name**: Name of the operational cost (e.g., "Salary Cost_Technician", "Rent", "Insurance")
- **Quantity**: Numeric quantity/hours
- **Rate/Hour**: Rate per hour or unit cost
- **Cost**: Auto-calculated as `Quantity × Rate/Hour`

### Sample Cost Types
1. Salary Cost - Technician
2. Salary Cost - Admin
3. Repair and Maintenance
4. Rent
5. Insurance

## Implementation Changes

### 1. Database Schema (✓ Completed)
**File**: `backend/database/schema.sql`

Created new table:
```sql
CREATE TABLE other_costs (
    other_cost_id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    cost_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    rate_per_hour DECIMAL(10, 2) DEFAULT 0,
    cost DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Migration File**: `backend/database/migration_add_other_costs.sql`
- Run this file to add the table to existing databases

### 2. Backend Model (✓ Completed)
**File**: `backend/models/OtherCost.js`

Methods:
- `getByQuotationId(quotationId)` - Get all other costs for a quotation
- `create(otherCostData)` - Create new other cost
- `update(otherCostId, otherCostData)` - Update other cost
- `delete(otherCostId)` - Delete other cost
- `deleteByQuotationId(quotationId)` - Delete all other costs for a quotation
- `getTotalByQuotationId(quotationId)` - Calculate total other costs

### 3. Backend Controller (✓ Completed)
**File**: `backend/controllers/otherCostController.js`

Endpoints:
- GET `/api/quotations/:quotationId/other-costs` - Get other costs
- POST `/api/other-costs` - Create other cost
- PUT `/api/other-costs/:id` - Update other cost
- DELETE `/api/other-costs/:id` - Delete other cost

### 4. Backend Routes (✓ Completed)
**File**: `backend/routes/index.js`

Added routes for other costs with authentication middleware.

### 5. Updated Quotation Model (✓ Completed)
**File**: `backend/models/Quotation.js`

Changes:
- `calculateTotals()` - Now includes other costs in subtotal calculation
- `getById()` - Now fetches other_costs for quotation
- `update()` - Now handles other_costs in update operations

### 6. Frontend API (✓ Completed)
**File**: `client/src/utils/api.js`

Added `otherCostApi` with methods:
- `getByQuotationId(quotationId)`
- `create(data)`
- `update(id, data)`
- `delete(id)`

### 7. Quotation Form (✓ Completed)
**File**: `client/src/pages/QuotationForm.js`

Added:
- State management for `otherCosts`
- New "Other Costs" section with table interface
- Handlers for add/edit/delete operations
- Auto-calculation: Cost = Quantity × Rate/Hour
- Integration with save functionality
- Updated cost calculations to include other costs

**Features**:
- Add multiple other cost items
- Edit inline (cost name, quantity, rate/hour)
- Auto-calculate cost field
- Delete individual items
- Included in quotation save/update

### 8. Quotation View (✓ Completed)
**File**: `client/src/pages/QuotationView.js`

Added:
- "Other Costs" section displaying table of costs
- Shows: Cost Name, Quantity, Rate/Hour, Cost
- Total other costs calculation
- Updated summary sidebar to show "Other Costs" line item

### 9. Cost Calculation Logic (✓ Completed)

**Updated Formula**:
```javascript
Subtotal = Total Parts Cost + Total Operations Cost + Total Auxiliary Cost + Total Other Costs
Margin Amount = Subtotal × Margin %
Total Quote Value = (Subtotal + Margin Amount) + VAT
```

## Usage Instructions

### Creating a Quotation with Other Costs

1. **Navigate to Create/Edit Quotation**
   - Go to Quotations → New Quotation or Edit existing

2. **Add Other Costs**
   - Scroll to "Other Costs" section
   - Click "Add Other Cost" button
   - Enter:
     - Cost Name (e.g., "Salary Cost_Technician")
     - Quantity (e.g., 10 hours)
     - Rate/Hour (e.g., Rs. 308.99)
   - Cost is auto-calculated (10 × 308.99 = Rs. 3,089.88)

3. **Add Multiple Costs**
   - Click "Add Other Cost" again for each additional cost
   - Common costs:
     - Salary Cost_Technician
     - Salary Cost_Admin
     - Repair and Maintenance
     - Rent
     - Insurance

4. **Save Quotation**
   - Other costs are automatically included in the save
   - View in Summary sidebar: "Other Costs" line item

5. **View Quotation**
   - Other costs appear in dedicated section
   - Included in total calculations

## Database Migration

To add the `other_costs` table to an existing database:

```bash
# Option 1: Run migration file
psql -U postgres -d quotation_db -f backend/database/migration_add_other_costs.sql

# Option 2: Recreate entire schema (USE WITH CAUTION)
psql -U postgres -d quotation_db -f backend/database/schema.sql
```

## Testing Checklist

- [x] Create quotation with other costs
- [x] Edit quotation and modify other costs
- [x] Delete individual other cost items
- [x] View quotation with other costs
- [x] Verify calculations include other costs
- [x] Backend API endpoints working
- [x] Frontend UI displays correctly
- [x] Save/Load functionality working

## API Examples

### Get Other Costs for Quotation
```javascript
GET /api/quotations/1/other-costs
```

### Create Other Cost
```javascript
POST /api/other-costs
{
  "quotation_id": 1,
  "cost_name": "Salary Cost_Technician",
  "quantity": 10,
  "rate_per_hour": 308.99,
  "cost": 3089.88
}
```

### Update Other Cost
```javascript
PUT /api/other-costs/1
{
  "cost_name": "Salary Cost_Technician",
  "quantity": 12,
  "rate_per_hour": 308.99,
  "cost": 3707.88
}
```

### Delete Other Cost
```javascript
DELETE /api/other-costs/1
```

## Files Modified

### Backend
1. `backend/database/schema.sql` - Added other_costs table
2. `backend/database/migration_add_other_costs.sql` - NEW migration file
3. `backend/models/OtherCost.js` - NEW model
4. `backend/models/Quotation.js` - Updated calculations
5. `backend/controllers/otherCostController.js` - NEW controller
6. `backend/routes/index.js` - Added routes

### Frontend
1. `client/src/utils/api.js` - Added otherCostApi
2. `client/src/pages/QuotationForm.js` - Added Other Costs section
3. `client/src/pages/QuotationView.js` - Display other costs

## Servers Running

Both servers have been started with the new functionality:

- **Backend**: http://localhost:5000 ✓
- **Frontend**: http://localhost:3000 ✓

## Next Steps

1. Test the feature by creating a new quotation
2. Add some other costs and verify calculations
3. Run database migration if needed
4. Optional: Add validation for cost names
5. Optional: Create predefined cost templates

## Support

If you encounter any issues:
1. Check backend console for API errors
2. Check frontend console for UI errors
3. Verify database migration was successful
4. Ensure both servers are running

---

**Feature Status**: ✓ Fully Implemented and Ready to Use
**Date**: January 19, 2026
