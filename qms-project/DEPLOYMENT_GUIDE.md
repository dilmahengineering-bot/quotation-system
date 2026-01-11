# Quotation Management System - Complete Deployment Guide

## 📦 Project Overview

A full-stack Quotation Management System for manufacturing/CNC operations with:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React (to be completed with UI components)
- **Features**: Multi-part quotations, operation costing, approval workflow, 3-level user access

## 🏗 System Architecture

```
qms-project/
├── backend/                  # Node.js REST API
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & error handling
│   ├── models/              # Sequelize ORM models
│   ├── routes/              # API endpoints
│   ├── scripts/             # Database initialization
│   ├── server.js            # Main server file
│   └── package.json
│
└── frontend/                # React application
    ├── public/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # Global state (Auth)
    │   ├── App.js          # Main app with routing
    │   └── App.css         # Styling
    └── package.json
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v16+ 
- PostgreSQL v12+
- Git

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd qms-project/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=qms_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_key_change_in_production
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create database:**
   ```bash
   # Using PostgreSQL command line
   createdb qms_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE qms_db;
   \q
   ```

5. **Initialize database with seed data:**
   ```bash
   node scripts/initDb.js
   ```
   
   This creates:
   - Database schema (all tables)
   - Admin user (username: admin, password: admin123)
   - Sample machines
   - Sample customers
   - Sample auxiliary costs

6. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd qms-project/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm start
   ```
   
   Frontend will run on `http://localhost:3000`

## 🔐 Default Login Credentials

After running `initDb.js`:
- **Username**: admin
- **Password**: admin123

⚠️ **IMPORTANT**: Change this password immediately after first login in production!

## 📊 Database Schema

### Core Tables

1. **users** - User authentication and authorization
   - Levels: admin, approver, user
   
2. **machines** - CNC machines with hourly rates
   
3. **customers** - Customer master data
   
4. **auxiliary_costs** - Standard auxiliary cost types
   
5. **quotations** - Quotation headers with totals
   
6. **quotation_parts** - Parts within quotations
   
7. **part_operations** - Operations performed on parts
   
8. **part_auxiliary_costs** - Auxiliary costs for parts

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register (Admin only)
GET    /api/auth/me
GET    /api/auth/users (Admin/Approver)
PUT    /api/auth/users/:id (Admin)
```

### Machines
```
GET    /api/machines
GET    /api/machines/:id
POST   /api/machines (Admin/Approver)
PUT    /api/machines/:id (Admin/Approver)
DELETE /api/machines/:id (Admin/Approver)
```

### Customers
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id (Admin)
```

### Auxiliary Costs
```
GET    /api/auxiliary-costs
GET    /api/auxiliary-costs/:id
POST   /api/auxiliary-costs (Admin/Approver)
PUT    /api/auxiliary-costs/:id (Admin/Approver)
DELETE /api/auxiliary-costs/:id (Admin/Approver)
```

### Quotations
```
GET    /api/quotations
GET    /api/quotations/:id
POST   /api/quotations
PUT    /api/quotations/:id
PUT    /api/quotations/:id/submit
PUT    /api/quotations/:id/approve (Admin/Approver)
DELETE /api/quotations/:id (Admin)
```

## 🚢 Production Deployment (Render.com)

### Step 1: Prepare Repository

1. **Initialize Git (if not already):**
   ```bash
   cd qms-project
   git init
   git add .
   git commit -m "Initial commit - QMS"
   ```

2. **Push to GitHub:**
   ```bash
   # Create repository on GitHub first
   git remote add origin https://github.com/yourusername/qms.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - Name: `qms-database`
   - Database: `qms_db`
   - User: (auto-generated)
   - Region: Choose closest to you
   - Plan: Free or paid
4. Click **Create Database**
5. **Save the credentials** shown after creation:
   - Internal Database URL
   - External Database URL
   - PSQL Command

### Step 3: Deploy Backend on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qms-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free or paid

4. **Environment Variables** (click Advanced):
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<paste-internal-database-url-from-step-2>
   JWT_SECRET=<generate-strong-random-string>
   CORS_ORIGIN=<your-frontend-url-will-add-later>
   ```

5. Click **Create Web Service**

6. **Initialize Database** (after service is live):
   - Go to Shell tab in Render dashboard
   - Run: `node scripts/initDb.js`

### Step 4: Deploy Frontend on Render

1. Click **New +** → **Static Site**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `qms-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=<your-backend-url>/api
   ```
   (e.g., `https://qms-backend.onrender.com/api`)

5. Click **Create Static Site**

### Step 5: Update CORS Settings

After frontend is deployed:
1. Go to backend service in Render
2. Update environment variable:
   ```
   CORS_ORIGIN=<your-frontend-url>
   ```
   (e.g., `https://qms-frontend.onrender.com`)
3. Service will auto-redeploy

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set proper CORS_ORIGIN
- [ ] Review user permissions
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor error logs

## 📝 User Level Permissions

### Level 1: Admin
- ✅ Full system access
- ✅ Create/manage all users
- ✅ Manage all master data
- ✅ Create/edit/delete quotations
- ✅ Approve/reject quotations
- ✅ View all quotations

### Level 2: Approver
- ✅ Approve/reject quotations
- ✅ Manage machines & auxiliary costs
- ✅ View all quotations
- ✅ Create quotations
- ❌ Cannot create admin users
- ❌ Cannot delete quotations

### Level 3: User
- ✅ Create quotations
- ✅ Edit own quotations (if not approved)
- ✅ View own quotations
- ✅ Submit quotations for approval
- ❌ Cannot approve quotations
- ❌ Cannot manage master data
- ❌ Cannot see other users' quotations

## 🧮 Quotation Calculation Logic

### Part Level
```
Unit Operations Cost = Σ (Machine Hourly Rate × Operation Time)
Unit Auxiliary Cost = Σ (Auxiliary Cost Amounts)
Unit Total Cost = Material Cost + Operations Cost + Auxiliary Cost
Part Subtotal = Unit Total Cost × Quantity
```

### Quotation Level
```
Subtotal = Σ (All Part Subtotals)
Discount Amount = Subtotal × (Discount % / 100)
Margin Amount = Subtotal × (Margin % / 100)
Subtotal After Discount/Margin = Subtotal - Discount + Margin
VAT Amount = Subtotal After Discount/Margin × (VAT % / 100)
Total Quote Value = Subtotal After Discount/Margin + VAT
```

## 🧪 Testing the API

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Create Quotation Test
```bash
curl -X POST http://localhost:5000/api/quotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "customer_id": 1,
    "lead_time": "2 weeks",
    "payment_terms": "Net 30",
    "currency": "USD",
    "margin_percent": 20,
    "parts": [
      {
        "part_number": "TEST-001",
        "part_description": "Test Part",
        "quantity": 10,
        "unit_material_cost": 50,
        "operations": [
          {
            "machine_id": 1,
            "estimated_time_hours": 2.5
          }
        ]
      }
    ]
  }'
```

## 📚 Additional Features to Implement

The current backend is complete. For frontend, you need to create:

1. **Components to Create:**
   - Login component ✓ (referenced)
   - Dashboard with statistics
   - Machine CRUD forms
   - Customer CRUD forms
   - Auxiliary Cost CRUD forms
   - User management (Admin)
   - **Quotation Form** (most complex - multi-part, multi-operation)
   - Quotation list with filters
   - Quotation view with PDF export
   - Approval interface

2. **Advanced Features:**
   - PDF generation (using jsPDF)
   - Excel export (using xlsx)
   - Quote number barcode generation
   - Dashboard charts (using recharts)
   - Real-time cost updates in UI
   - Quote templates
   - Email notifications

## 🐛 Troubleshooting

### Database Connection Fails
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql postgresql://user:password@localhost:5432/qms_db
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
- Ensure CORS_ORIGIN matches your frontend URL
- Check browser console for exact error
- Verify Authorization header is being sent

## 📞 Support

For issues:
1. Check logs in Render dashboard
2. Verify environment variables
3. Test API endpoints with Postman/curl
4. Check database connection

## 📄 License

ISC License - Free for commercial and personal use

---

## 🎯 Next Steps

1. ✅ Backend is complete and production-ready
2. ⏳ Complete frontend React components
3. ⏳ Implement PDF/Excel export
4. ⏳ Add email notifications
5. ⏳ Create user documentation
6. ⏳ Set up automated testing

**Backend is fully functional and can be tested via API calls. Frontend requires component implementation to match the professional UI design.**
