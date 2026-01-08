# Getting Started Guide

Welcome to the Quotation Management System! This guide will help you get up and running quickly.

## 🎯 What You'll Build

By following this guide, you'll have a fully functional quotation management system that can:
- Manage CNC machines and their hourly rates
- Maintain customer database
- Create multi-part quotations
- Calculate costs automatically
- Track quotation status
- Generate professional quotes

## 📋 What You Need

Before starting, ensure you have:

- [ ] Computer with Windows, Mac, or Linux
- [ ] Internet connection
- [ ] 2GB free disk space
- [ ] Administrator/sudo access (for installation)
- [ ] 30 minutes of time

## 🚀 Installation Methods

Choose the method that works best for you:

### Method 1: Automated Installation (Recommended)

**For Mac/Linux:**
```bash
cd quotation-system
chmod +x install.sh
./install.sh
```

**For Windows:**
```cmd
cd quotation-system
install.bat
```

The script will:
1. Check prerequisites
2. Create database
3. Install dependencies
4. Configure environment
5. Initialize sample data

### Method 2: Manual Installation

If you prefer to understand each step:

#### Step 1: Install Prerequisites

**Install Node.js:**
1. Visit https://nodejs.org/
2. Download LTS version
3. Run installer
4. Verify: `node --version`

**Install PostgreSQL:**

*Mac:*
```bash
brew install postgresql@15
brew services start postgresql@15
```

*Ubuntu/Debian:*
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

*Windows:*
1. Download from https://www.postgresql.org/download/
2. Run installer
3. Remember your password!

#### Step 2: Create Database

```bash
# Create database
createdb quotation_db

# Or using psql
psql -U postgres
CREATE DATABASE quotation_db;
\q
```

#### Step 3: Initialize Database

```bash
cd quotation-system
psql -U postgres -d quotation_db -f backend/database/schema.sql
```

This creates:
- 7 tables
- 5 sample machines
- 2 sample customers
- 5 auxiliary cost types

#### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=postgres
DB_PORT=5432
NODE_ENV=development
EOF

# Test backend
npm start
```

You should see:
```
Server is running on port 5000
```

Open browser: http://localhost:5000/health
Should show: `{"status":"OK",...}`

#### Step 5: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm start
```

Browser should automatically open to: http://localhost:3000

## ✅ Verify Installation

### 1. Check Backend

```bash
# In backend terminal, you should see:
Server is running on port 5000
```

### 2. Check Frontend

```bash
# In frontend terminal, you should see:
Compiled successfully!
webpack compiled successfully
```

### 3. Test in Browser

1. Open http://localhost:3000
2. You should see the Dashboard
3. Check statistics show "5" for total quotations (if sample data loaded)

### 4. Test Database

```bash
psql -U postgres -d quotation_db -c "SELECT COUNT(*) FROM machines;"
```

Should show: 5

### 5. Test API

```bash
curl http://localhost:5000/api/machines
```

Should return JSON with 5 machines.

## 🎮 First Steps

### 1. Explore the Dashboard

1. Navigate to http://localhost:3000
2. See the dashboard with:
   - Statistics cards
   - Recent quotations
   - Quick action buttons

### 2. View Sample Machines

1. Click "Machines" in navigation
2. See 5 pre-configured machines:
   - CNC Mill 1 ($75/hr)
   - CNC Lathe 1 ($65/hr)
   - EDM Machine 1 ($90/hr)
   - WEDM Machine 1 ($85/hr)
   - Grinder 1 ($55/hr)

### 3. View Sample Customers

1. Click "Customers" in navigation
2. See 2 sample customers:
   - ABC Manufacturing Ltd
   - XYZ Engineering Corp

### 4. View Auxiliary Costs

1. Click "Auxiliary Costs" in navigation
2. See 5 cost types:
   - Setup Cost ($50)
   - Inspection ($30)
   - Tooling ($100)
   - Transport ($25)
   - Packaging ($20)

## 📝 Create Your First Quotation

Let's create a simple quotation step by step:

### Step 1: Start New Quotation

1. Click "Quotations" in navigation
2. Click "Create New Quotation" button

### Step 2: Enter General Information

1. **Customer:** Select "ABC Manufacturing Ltd"
2. **Date:** Leave as today's date
3. **Currency:** Leave as "USD"
4. **Lead Time:** Enter "4-6 weeks"
5. **Payment Terms:** Enter "Net 30"
6. **Shipment Type:** Enter "Air Freight"

### Step 3: Add a Part

1. Click "Add Part" button
2. **Part Number:** Enter "SAMPLE-001"
3. **Description:** Enter "Sample CNC Part"
4. **Material Cost:** Enter "100"
5. **Quantity:** Enter "10"

### Step 4: Add an Operation

1. Click "Add Operation" (under the part)
2. **Machine:** Select "CNC Mill 1"
3. **Time:** Enter "2.5" (hours)

Notice the operation cost automatically calculates:
- Cost = $75/hr × 2.5 hrs = $187.50

### Step 5: Add Auxiliary Cost

1. Click "Add Auxiliary Cost"
2. **Type:** Select "Setup Cost"
3. **Cost:** Auto-fills to $50 (you can change this)

### Step 6: Review Part Summary

The part summary should show:
- **Unit Material Cost:** $100.00
- **Unit Operations Cost:** $187.50
- **Unit Auxiliary Cost:** $50.00
- **Unit Total Cost:** $337.50
- **Part Subtotal (Qty: 10):** $3,375.00

### Step 7: Set Financial Terms

1. **Discount %:** Enter "5"
2. **Margin %:** Enter "20"
3. **VAT %:** Enter "10"

### Step 8: Review Financial Summary

The system automatically calculates:
- **Subtotal:** $3,375.00
- **Discount (5%):** -$168.75
- **After Discount:** $3,206.25
- **Margin (20%):** +$641.25
- **After Margin:** $3,847.50
- **VAT (10%):** +$384.75
- **Total Quote Value:** $4,232.25

### Step 9: Create Quotation

1. Click "Create Quotation" button
2. Success! You'll be redirected to the quotation list
3. Your new quotation appears with status "Draft"

### Step 10: View Quotation

1. Click "View" button on your quotation
2. See complete details:
   - Customer information
   - Part breakdown
   - Operations with machine details
   - Auxiliary costs
   - Financial summary

### Step 11: Submit Quotation

1. Click "Submit" button
2. Confirm the action
3. Status changes to "Submitted"
4. Edit button disappears (submitted quotes are locked)

### Step 12: Approve Quotation

1. Click "Approve" button
2. Confirm the action
3. Status changes to "Approved"

Congratulations! You've created your first quotation! 🎉

## 🎯 Try More Features

### Add Your Own Machine

1. Go to Machines
2. Click "Add New Machine"
3. Enter:
   - **Name:** "CNC Mill 2"
   - **Type:** "Milling"
   - **Hourly Rate:** "85.00"
4. Click "Create"
5. Your new machine is available in quotations!

### Add Your Own Customer

1. Go to Customers
2. Click "Add New Customer"
3. Enter company details
4. Click "Create"
5. Select this customer in new quotations

### Create Multi-Part Quotation

1. Create new quotation
2. Click "Add Part" multiple times
3. Each part can have different:
   - Material costs
   - Quantities
   - Operations
   - Auxiliary costs
4. Total calculates across all parts

### Create Complex Operations

1. Add a part
2. Click "Add Operation" multiple times
3. Each operation:
   - Different machine
   - Different time
   - Calculated automatically
4. Total operations cost = sum of all operations

## 🔍 Understanding Calculations

### Part Level

For each part:
```
Unit Operations Cost = Sum of (Machine Rate × Time) for all operations
Unit Auxiliary Cost = Sum of all auxiliary costs
Unit Total Cost = Material + Operations + Auxiliary
Part Subtotal = Unit Total × Quantity
```

**Example:**
- Material: $100
- Operation 1: CNC Mill ($75/hr × 2hr) = $150
- Operation 2: Grinder ($55/hr × 1hr) = $55
- Setup Cost: $50
- Quantity: 10

Calculation:
- Unit Operations: $150 + $55 = $205
- Unit Auxiliary: $50
- Unit Total: $100 + $205 + $50 = $355
- Part Subtotal: $355 × 10 = $3,550

### Quotation Level

For the entire quotation:
```
Subtotal = Sum of all part subtotals
Discount Amount = Subtotal × (Discount% ÷ 100)
After Discount = Subtotal - Discount Amount
Margin Amount = After Discount × (Margin% ÷ 100)
After Margin = After Discount + Margin Amount
VAT Amount = After Margin × (VAT% ÷ 100)
Total = After Margin + VAT Amount
```

**Example:**
- Subtotal: $3,550
- Discount: 10%
- Margin: 15%
- VAT: 10%

Calculation:
- After Discount: $3,550 - $355 = $3,195
- After Margin: $3,195 + $479.25 = $3,674.25
- Total: $3,674.25 + $367.43 = $4,041.68

## 🛠️ Common Tasks

### Edit a Machine Rate

1. Go to Machines
2. Click "Edit" on a machine
3. Change hourly rate
4. Click "Update"
5. New rate applies to future quotations

### Disable a Machine

1. Go to Machines
2. Click "Disable"
3. Machine removed from dropdown in new quotations
4. Existing quotations still show the machine

### Delete a Draft Quotation

1. Go to Quotations
2. Find draft quotation
3. Click "Delete"
4. Confirm
5. Quotation removed from system

### Filter Quotations

1. Go to Quotations
2. Use "Filter by Status" dropdown
3. Select: Draft, Submitted, Approved, or All
4. List updates automatically

## 📱 Keyboard Shortcuts

While using the system:
- **Ctrl+Click** on navigation links: Open in new tab
- **Tab**: Navigate through form fields
- **Enter**: Submit forms (when in input fields)
- **Esc**: Close modals

## 💡 Pro Tips

1. **Start Simple:** Create basic one-part quotations first
2. **Use Sample Data:** Explore with sample machines and customers
3. **Check Calculations:** Verify math is correct for your process
4. **Save as Draft:** Create drafts and review before submitting
5. **Consistent Naming:** Use clear part numbers and descriptions
6. **Regular Backup:** Export quotations regularly (future feature)

## 🆘 Getting Help

### If Something Doesn't Work:

1. **Check Console:**
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors

2. **Verify Services:**
   ```bash
   # Backend should be running on port 5000
   curl http://localhost:5000/health
   
   # Frontend should be running on port 3000
   # Browser shows the application
   ```

3. **Check Database:**
   ```bash
   psql -U postgres -d quotation_db -c "\dt"
   # Should list 7 tables
   ```

4. **Restart Everything:**
   ```bash
   # Stop both terminals (Ctrl+C)
   # Restart backend
   cd backend && npm start
   # Restart frontend (new terminal)
   cd frontend && npm start
   ```

5. **Consult Documentation:**
   - README.md - General information
   - TROUBLESHOOTING.md - Common issues
   - API_DOCUMENTATION.md - API details

## 🎓 Learning Path

### Day 1: Basics
- [ ] Install system
- [ ] Explore dashboard
- [ ] View sample data
- [ ] Create simple quotation
- [ ] Submit and approve

### Day 2: Management
- [ ] Add your own machines
- [ ] Add your own customers
- [ ] Create custom auxiliary costs
- [ ] Edit and update data

### Day 3: Advanced
- [ ] Create multi-part quotations
- [ ] Add multiple operations per part
- [ ] Test different financial scenarios
- [ ] Explore status workflow

### Day 4: Production
- [ ] Add real company machines
- [ ] Import customer database
- [ ] Configure standard auxiliary costs
- [ ] Create actual quotations

## 🚀 Next Steps

Once comfortable with basics:

1. **Customize Sample Data:**
   - Update machine rates to match your shop
   - Add your actual customers
   - Configure your auxiliary costs

2. **Develop Workflow:**
   - Define your quotation process
   - Set standard margins and discounts
   - Establish approval procedures

3. **Train Your Team:**
   - Share this guide
   - Create training quotations
   - Document your specific processes

4. **Plan Enhancements:**
   - PDF export (future)
   - Email integration (future)
   - Custom reporting (future)

## 📞 Support

Need more help?

- 📖 **Read Docs:** Start with README.md
- 🔍 **Search Issues:** Check TROUBLESHOOTING.md
- 💬 **Ask Questions:** Create GitHub issue
- 📧 **Contact:** Reach out to maintainers

---

**You're now ready to create professional manufacturing quotations! Happy quoting! 🎯**
