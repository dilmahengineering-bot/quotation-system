# Testing Guide

## Quick Test Checklist

Use this guide to verify that all system features are working correctly.

## 🧪 Backend API Testing

### Using cURL (Command Line)

#### 1. Health Check
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"OK", ...}`

#### 2. Get All Machines
```bash
curl http://localhost:5000/api/machines
```
**Expected:** Array of 5 machines

#### 3. Get All Customers
```bash
curl http://localhost:5000/api/customers
```
**Expected:** Array of 2 customers

#### 4. Get All Auxiliary Costs
```bash
curl http://localhost:5000/api/auxiliary-costs
```
**Expected:** Array of 5 auxiliary cost types

#### 5. Create a Simple Quotation
```bash
curl -X POST http://localhost:5000/api/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "quotation_date": "2024-01-15",
    "currency": "USD",
    "discount_percent": 5,
    "margin_percent": 15,
    "vat_percent": 10,
    "parts": [
      {
        "part_number": "TEST-001",
        "part_description": "Test Part",
        "unit_material_cost": 50,
        "quantity": 10,
        "operations": [
          {
            "machine_id": 1,
            "operation_time_hours": 2
          }
        ],
        "auxiliary_costs": [
          {
            "aux_type_id": 1,
            "cost": 50
          }
        ]
      }
    ]
  }'
```
**Expected:** Complete quotation object with calculated values

#### 6. Get Quotation by ID
```bash
curl http://localhost:5000/api/quotations/1
```
**Expected:** Full quotation details

### Using Browser/Postman

Import these endpoints into Postman or test in browser:

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/machines` | List all machines |
| POST | `/machines` | Create machine |
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/auxiliary-costs` | List auxiliary costs |
| GET | `/quotations` | List all quotations |
| POST | `/quotations` | Create quotation |
| GET | `/quotations/:id` | Get quotation details |

## 🎨 Frontend Testing

### Manual Testing Checklist

#### Dashboard (/)
- [ ] Statistics display correctly
- [ ] Recent quotations show up
- [ ] Quick action buttons work
- [ ] Navigation links work

#### Machines (/machines)
- [ ] List shows 5 sample machines
- [ ] "Add New Machine" button opens modal
- [ ] Can create new machine
- [ ] Can edit existing machine
- [ ] Can disable machine
- [ ] Form validation works
- [ ] Modal closes properly

#### Customers (/customers)
- [ ] List shows 2 sample customers
- [ ] "Add New Customer" opens modal
- [ ] Can create new customer
- [ ] Can edit existing customer
- [ ] Email validation works
- [ ] Duplicate prevention works

#### Auxiliary Costs (/auxiliary-costs)
- [ ] List shows 5 cost types
- [ ] Can create new cost type
- [ ] Can edit existing cost
- [ ] Default cost is editable

#### Quotations (/quotations)
- [ ] List view works
- [ ] Filter by status works
- [ ] "Create New Quotation" navigates to form
- [ ] Can view quotation details
- [ ] Can delete draft quotations

#### Create Quotation (/quotations/new)
- [ ] Customer dropdown populated
- [ ] Date defaults to today
- [ ] Can add multiple parts
- [ ] Can remove parts
- [ ] Can add operations to parts
- [ ] Can remove operations
- [ ] Machine dropdown shows rates
- [ ] Can add auxiliary costs
- [ ] Auxiliary cost auto-fills default
- [ ] Real-time calculations work
- [ ] Part subtotal calculates correctly
- [ ] Quotation total calculates correctly
- [ ] Discount applies correctly
- [ ] Margin applies correctly
- [ ] VAT applies correctly
- [ ] Can save quotation
- [ ] Validation prevents empty quotations

#### View Quotation (/quotations/:id)
- [ ] Shows all quotation details
- [ ] Customer information displays
- [ ] Parts list displays
- [ ] Operations show with machine details
- [ ] Auxiliary costs show
- [ ] Financial summary is correct
- [ ] Status badge shows
- [ ] Edit button works (for drafts)
- [ ] Status change buttons work
- [ ] Can approve/reject quotations

### Test Scenarios

#### Scenario 1: Create Simple Quotation
1. Go to "Create New Quotation"
2. Select "ABC Manufacturing Ltd"
3. Set date to today
4. Click "Add Part"
5. Enter part number: "PART-001"
6. Set material cost: $100
7. Set quantity: 5
8. Click "Add Operation"
9. Select "CNC Mill 1"
10. Set time: 2 hours
11. Click "Add Auxiliary Cost"
12. Select "Setup Cost"
13. Keep default cost
14. Set margin to 20%
15. Click "Create Quotation"
16. Verify quotation is created
17. Check calculations are correct

**Expected Result:**
- Unit Operations Cost: $150 (75 × 2)
- Unit Auxiliary Cost: $50
- Unit Total: $300 (100 + 150 + 50)
- Part Subtotal: $1,500 (300 × 5)
- With 20% margin: $1,800
- Total displays correctly

#### Scenario 2: Multi-Part Quotation
1. Create new quotation
2. Add 3 different parts
3. Add 2 operations to first part
4. Add 1 operation to second part
5. Add auxiliary costs to all parts
6. Set 10% discount
7. Set 15% margin
8. Set 10% VAT
9. Verify all calculations
10. Submit quotation
11. Verify status changes

#### Scenario 3: Edit and Update
1. Create draft quotation
2. View quotation
3. Click "Edit"
4. Add another part
5. Change margin percentage
6. Update quotation
7. Verify changes saved
8. Check recalculations

#### Scenario 4: Status Workflow
1. Create draft quotation
2. Submit quotation
3. Verify status changes to "Submitted"
4. Verify can't edit anymore
5. Approve quotation
6. Verify status changes to "Approved"

## 🔍 Database Testing

### Verify Data Integrity

```sql
-- Connect to database
psql -U postgres -d quotation_db

-- Check all tables have data
SELECT 'machines' as table_name, COUNT(*) as count FROM machines
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'auxiliary_costs', COUNT(*) FROM auxiliary_costs;

-- Check quotation calculations
SELECT 
    quotation_id,
    total_parts_cost,
    discount_amount,
    margin_amount,
    vat_amount,
    total_quote_value
FROM quotations;

-- Verify operations are linked to parts
SELECT 
    q.quote_number,
    p.part_number,
    COUNT(po.operation_id) as operation_count
FROM quotations q
JOIN quotation_parts p ON q.quotation_id = p.quotation_id
LEFT JOIN part_operations po ON p.part_id = po.part_id
GROUP BY q.quote_number, p.part_number;

-- Check referential integrity
SELECT 
    'Operations without parts' as check_type,
    COUNT(*) as count
FROM part_operations po
LEFT JOIN quotation_parts p ON po.part_id = p.part_id
WHERE p.part_id IS NULL;
```

## ⚡ Performance Testing

### Load Test (Basic)

Create 10 quotations rapidly:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/quotations \
    -H "Content-Type: application/json" \
    -d '{
      "customer_id": 1,
      "quotation_date": "2024-01-15",
      "currency": "USD",
      "parts": [{
        "part_number": "LOAD-TEST-'$i'",
        "unit_material_cost": 50,
        "quantity": 1,
        "operations": [{"machine_id": 1, "operation_time_hours": 1}],
        "auxiliary_costs": [{"aux_type_id": 1, "cost": 50}]
      }]
    }'
  echo ""
done
```

### Calculation Accuracy Test

```javascript
// Test in browser console on quotation form
const testCalculations = () => {
  console.log('Testing calculation accuracy...');
  
  // Test 1: Simple part
  const materialCost = 100;
  const operationsCost = 150;
  const auxCost = 50;
  const quantity = 5;
  const expected = (materialCost + operationsCost + auxCost) * quantity;
  console.log(`Test 1: ${expected === 1500 ? '✓' : '✗'} Simple calculation`);
  
  // Test 2: With discount
  const subtotal = 1500;
  const discount = 0.10; // 10%
  const afterDiscount = subtotal * (1 - discount);
  console.log(`Test 2: ${afterDiscount === 1350 ? '✓' : '✗'} Discount calculation`);
  
  // Test 3: With margin
  const margin = 0.15; // 15%
  const afterMargin = afterDiscount * (1 + margin);
  console.log(`Test 3: ${afterMargin === 1552.50 ? '✓' : '✗'} Margin calculation`);
  
  console.log('Tests complete!');
};

testCalculations();
```

## 🐛 Common Issues and Solutions

### Issue: Database connection fails
**Solution:** 
- Check PostgreSQL is running: `systemctl status postgresql` (Linux) or `brew services list` (Mac)
- Verify credentials in `backend/.env`
- Check database exists: `psql -l`

### Issue: Port already in use
**Solution:**
- Backend: Change PORT in `backend/.env`
- Frontend: Update REACT_APP_API_URL in `frontend/.env`

### Issue: Frontend can't connect to backend
**Solution:**
- Verify backend is running at http://localhost:5000
- Check browser console for CORS errors
- Verify REACT_APP_API_URL is correct

### Issue: Calculations are wrong
**Solution:**
- Check machine hourly rates
- Verify operation times are in hours
- Check discount/margin/VAT percentages
- Look for JavaScript number precision issues

### Issue: Sample data not loaded
**Solution:**
```bash
psql -U postgres -d quotation_db -f backend/database/schema.sql
```

## ✅ Acceptance Criteria

System is ready for production when:

- [ ] All API endpoints return correct data
- [ ] All CRUD operations work
- [ ] All calculations are accurate
- [ ] Frontend displays all data correctly
- [ ] Forms validate input properly
- [ ] Status workflow works
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Database constraints prevent invalid data
- [ ] Sample data loads successfully
- [ ] Multi-part quotations work
- [ ] Multi-operation parts work
- [ ] Real-time calculations update
- [ ] Can create, edit, view, delete quotations
- [ ] Can manage machines, customers, auxiliary costs

## 📊 Test Results Template

```
Test Date: _______________
Tested By: _______________

Backend API Tests:     [PASS / FAIL]
Frontend UI Tests:     [PASS / FAIL]
Database Tests:        [PASS / FAIL]
Calculation Tests:     [PASS / FAIL]
Integration Tests:     [PASS / FAIL]

Issues Found: _________________
_______________________________
_______________________________

Notes: ________________________
_______________________________
_______________________________
```

---

**Remember:** Test thoroughly before deploying to production!
