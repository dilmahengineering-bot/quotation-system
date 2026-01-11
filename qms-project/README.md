# Quotation Management System (QMS)

> A comprehensive, enterprise-ready quotation management system for CNC and manufacturing operations built with Node.js, React, and PostgreSQL.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Backend](https://img.shields.io/badge/Backend-Complete-success)
![License](https://img.shields.io/badge/License-ISC-blue)

## 🎯 Overview

The Quotation Management System (QMS) is a full-stack application designed to streamline the quotation process for manufacturing and CNC machining operations. It provides accurate cost calculations, multi-part quotations, operation-level costing, and a comprehensive approval workflow.

## ✨ Key Features

### Core Functionality
- ✅ **Multi-Part Quotations** - Create quotes with multiple parts
- ✅ **Multi-Operation Costing** - Track costs for each machining operation
- ✅ **Real-Time Calculations** - Automatic cost updates as you input data
- ✅ **Approval Workflow** - Submit → Review → Approve/Reject cycle
- ✅ **3-Level User Access** - Admin, Approver, User roles
- ✅ **Master Data Management** - Machines, Customers, Auxiliary Costs

### Technical Features
- ✅ **RESTful API** - Clean, well-documented endpoints
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **PostgreSQL Database** - Robust relational data model
- ✅ **Auto-Generated Quote Numbers** - 10-digit format with year prefix
- ✅ **Audit Trail** - Track who created/updated records
- ✅ **Soft Deletes** - Maintain data integrity

## 🏗 Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Frontend │◄────►│  Node.js Backend │◄────►│   PostgreSQL    │
│   (Port 3000)   │      │   (Port 5000)    │      │    Database     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js v16+
- Express.js 4.x
- Sequelize ORM
- PostgreSQL 12+
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React 18.x
- React Router v6
- Axios for API calls
- React Hot Toast for notifications
- jsPDF & xlsx for exports

## 📁 Project Structure

```
qms-project/
│
├── backend/                          # Node.js REST API
│   ├── config/
│   │   └── database.js              # PostgreSQL configuration
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── machineController.js
│   │   ├── customerController.js
│   │   ├── auxiliaryCostController.js
│   │   └── quotationController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   └── errorHandler.js
│   ├── models/                      # Sequelize models
│   │   ├── User.js
│   │   ├── Machine.js
│   │   ├── Customer.js
│   │   ├── AuxiliaryCost.js
│   │   ├── Quotation.js
│   │   ├── QuotationPart.js
│   │   ├── PartOperation.js
│   │   ├── PartAuxiliaryCost.js
│   │   └── index.js
│   ├── routes/                      # API endpoints
│   ├── scripts/
│   │   └── initDb.js               # Database initialization
│   ├── server.js                    # Main server file
│   ├── package.json
│   └── README.md
│
├── frontend/                         # React application
│   ├── public/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── context/
│   │   │   └── AuthContext.js      # Authentication state
│   │   ├── App.js                   # Main app with routing
│   │   ├── App.css                  # Global styles
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
└── DEPLOYMENT_GUIDE.md              # Complete deployment instructions
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd qms-project
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
createdb qms_db
node scripts/initDb.js
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env with REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### 4. Login
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin123`

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.**

## 📊 Database Schema

### Core Tables

**users** - User accounts and authentication
```sql
user_id, username, email, password, full_name, user_level, is_active
```

**machines** - CNC machines with hourly rates
```sql
machine_id, machine_name, machine_type, hourly_rate, is_active
```

**customers** - Customer master data
```sql
customer_id, company_name, address, contact_person_name, email, phone, vat_number
```

**quotations** - Quotation headers
```sql
quotation_id, quote_number, customer_id, quote_date, lead_time, 
payment_terms, currency, total_quote_value, status, margin_percent, ...
```

**quotation_parts** - Parts within quotations
```sql
part_id, quotation_id, part_number, part_description, quantity,
unit_material_cost, unit_operations_cost, part_subtotal, ...
```

**part_operations** - Operations on parts
```sql
operation_id, part_id, machine_id, estimated_time_hours, 
machine_hourly_rate, operation_cost
```

## 🔐 User Roles & Permissions

| Feature | Admin | Approver | User |
|---------|-------|----------|------|
| Create Users | ✅ | ❌ | ❌ |
| Manage Machines | ✅ | ✅ | ❌ |
| Create Quotations | ✅ | ✅ | ✅ |
| View All Quotations | ✅ | ✅ | ❌* |
| Approve Quotations | ✅ | ✅ | ❌ |
| Delete Quotations | ✅ | ❌ | ❌ |

*Users can only view their own quotations

## 🧮 Calculation Engine

### Part-Level Calculations
```javascript
unitOperationsCost = sum(machineHourlyRate × operationTime)
unitAuxiliaryCost = sum(auxiliaryCostAmounts)
unitTotalCost = materialCost + operationsCost + auxiliaryCost
partSubtotal = unitTotalCost × quantity
```

### Quote-Level Calculations
```javascript
subtotal = sum(allPartSubtotals)
discountAmount = subtotal × (discount% / 100)
marginAmount = subtotal × (margin% / 100)
subtotalAfterDiscountMargin = subtotal - discount + margin
vatAmount = subtotalAfterDiscountMargin × (vat% / 100)
totalQuoteValue = subtotalAfterDiscountMargin + vat
```

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login           - User login
POST   /api/auth/register        - Create user (Admin)
GET    /api/auth/me              - Get current user
GET    /api/auth/users           - List users (Admin/Approver)
```

### Quotation Endpoints
```
GET    /api/quotations           - List quotations
POST   /api/quotations           - Create quotation
GET    /api/quotations/:id       - Get quotation details
PUT    /api/quotations/:id       - Update quotation
DELETE /api/quotations/:id       - Delete quotation (Admin)
PUT    /api/quotations/:id/submit   - Submit for approval
PUT    /api/quotations/:id/approve  - Approve/Reject (Admin/Approver)
```

**Full API documentation: See [backend/README.md](backend/README.md)**

## 🌐 Deployment

### Render.com (Recommended)

1. **Database**: Create PostgreSQL instance
2. **Backend**: Deploy as Web Service
3. **Frontend**: Deploy as Static Site

**Detailed guide: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL=<postgres-connection-string>
JWT_SECRET=<strong-random-string>
CORS_ORIGIN=<frontend-url>
```

**Frontend (.env):**
```env
REACT_APP_API_URL=<backend-url>/api
```

## 🧪 Testing

### API Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Create Quote:**
```bash
curl -X POST http://localhost:5000/api/quotations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @sample-quote.json
```

## 📈 Roadmap

### Current Status: Backend Complete ✅

### Upcoming Features
- [ ] Complete frontend UI components
- [ ] PDF export with professional template
- [ ] Excel export functionality
- [ ] Email notifications
- [ ] Quote templates
- [ ] Dashboard analytics
- [ ] Advanced search & filters
- [ ] Batch operations
- [ ] Quote versioning
- [ ] Customer portal

## 🤝 Contributing

This is a proprietary system. For internal modifications:
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit for review

## 📞 Support

For technical support or questions:
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Review API documentation
- Check backend logs
- Test endpoints with Postman

## 📄 License

ISC License - Free for commercial and personal use

## 🙏 Acknowledgments

Built with modern web technologies:
- Node.js & Express.js
- React
- PostgreSQL
- Sequelize ORM

---

**Status**: Backend production-ready | Frontend in development

**Version**: 1.0.0

**Last Updated**: January 2026
