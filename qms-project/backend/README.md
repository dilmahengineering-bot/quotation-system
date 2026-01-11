# Quotation Management System - Backend API

A robust RESTful API for managing manufacturing quotations built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Authentication & Authorization** (3-level access control)
- **Master Data Management** (Machines, Customers, Auxiliary Costs)
- **Quotation Management** with multi-part, multi-operation support
- **Real-time Cost Calculations**
- **Approval Workflow**
- **Comprehensive Validation**

## 📋 Prerequisites

- Node.js v16 or higher
- PostgreSQL v12 or higher
- npm or yarn

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=qms_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   ```

3. **Create PostgreSQL database:**
   ```bash
   createdb qms_db
   ```

4. **Initialize database with seed data:**
   ```bash
   node scripts/initDb.js
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 🗄️ Database Schema

### Users Table
- Stores user accounts with role-based access (admin, approver, user)

### Machines Table
- Master data for CNC machines and equipment with hourly rates

### Customers Table
- Customer information for quotation management

### Auxiliary_Costs Table
- Standardized non-machine costs (setup, inspection, etc.)

### Quotations Table
- Quotation header with totals and status

### Quotation_Parts Table
- Individual parts within quotations

### Part_Operations Table
- Operations performed on each part

### Part_Auxiliary_Costs Table
- Auxiliary costs applied to parts

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "admin",
    "full_name": "System Administrator",
    "user_level": "admin"
  }
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - Create new user (Admin only)
- `GET /me` - Get current user info
- `GET /users` - Get all users (Admin/Approver)
- `PUT /users/:id` - Update user (Admin only)

### Machines (`/api/machines`)
- `GET /` - Get all machines
- `GET /:id` - Get single machine
- `POST /` - Create machine (Admin/Approver)
- `PUT /:id` - Update machine (Admin/Approver)
- `DELETE /:id` - Disable machine (Admin/Approver)

### Customers (`/api/customers`)
- `GET /` - Get all customers
- `GET /:id` - Get single customer
- `POST /` - Create customer
- `PUT /:id` - Update customer
- `DELETE /:id` - Disable customer (Admin)

### Auxiliary Costs (`/api/auxiliary-costs`)
- `GET /` - Get all auxiliary costs
- `GET /:id` - Get single auxiliary cost
- `POST /` - Create auxiliary cost (Admin/Approver)
- `PUT /:id` - Update auxiliary cost (Admin/Approver)
- `DELETE /:id` - Disable auxiliary cost (Admin/Approver)

### Quotations (`/api/quotations`)
- `GET /` - Get all quotations (filtered by user level)
- `GET /:id` - Get quotation with full details
- `POST /` - Create new quotation
- `PUT /:id` - Update quotation
- `PUT /:id/submit` - Submit quotation for approval
- `PUT /:id/approve` - Approve/reject quotation (Admin/Approver)
- `DELETE /:id` - Delete quotation (Admin)

## 📝 Create Quotation Example

```http
POST /api/quotations
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "lead_time": "2 weeks",
  "payment_terms": "Net 30",
  "currency": "USD",
  "shipment_type": "Air Freight",
  "margin_percent": 20,
  "discount_percent": 5,
  "vat_percent": 0,
  "parts": [
    {
      "part_number": "PART-001",
      "part_description": "Custom CNC Machined Component",
      "quantity": 10,
      "unit_material_cost": 50.00,
      "operations": [
        {
          "machine_id": 1,
          "operation_name": "Milling",
          "estimated_time_hours": 2.5
        },
        {
          "machine_id": 2,
          "operation_name": "Turning",
          "estimated_time_hours": 1.0
        }
      ],
      "auxiliaryCosts": [
        {
          "aux_type_id": 1,
          "cost_amount": 50.00
        },
        {
          "aux_type_id": 2,
          "cost_amount": 30.00
        }
      ]
    }
  ]
}
```

## 🧮 Calculation Logic

### Part-Level Calculations
```
Unit Operations Cost = Sum of (Machine Hourly Rate × Operation Time)
Unit Auxiliary Cost = Sum of Auxiliary Costs
Unit Total Cost = Material Cost + Operations Cost + Auxiliary Cost
Part Subtotal = Unit Total Cost × Quantity
```

### Quotation-Level Calculations
```
Subtotal = Sum of All Part Subtotals
Discount Amount = Subtotal × Discount %
Margin Amount = Subtotal × Margin %
After Discount/Margin = Subtotal - Discount + Margin
VAT Amount = After Discount/Margin × VAT %
Total Quote Value = After Discount/Margin + VAT
```

## 👥 User Levels & Permissions

### Level 1: Admin
- Full system access
- Create/manage all users
- Create/edit/delete all data
- Approve quotations

### Level 2: Approver
- Approve/reject quotations
- Manage machine masters
- View all quotations
- Cannot create admin users

### Level 3: User
- Create quotations
- View own quotations
- Submit quotations for approval
- Limited edit rights

## 🚢 Deployment to Render

1. **Push code to GitHub**

2. **Create PostgreSQL database on Render:**
   - Go to Render Dashboard
   - New → PostgreSQL
   - Note the internal/external database URLs

3. **Create Web Service on Render:**
   - New → Web Service
   - Connect your repository
   - Settings:
     - Build Command: `npm install`
     - Start Command: `node server.js`
   - Environment Variables:
     - `DATABASE_URL` (from PostgreSQL service)
     - `JWT_SECRET` (generate secure key)
     - `NODE_ENV=production`
     - `PORT=5000`

4. **Initialize database:**
   ```bash
   # Run from Render shell or locally with production DB URL
   node scripts/initDb.js
   ```

## 🔒 Security Best Practices

1. **Change default admin password immediately**
2. **Use strong JWT_SECRET in production**
3. **Enable HTTPS (automatic on Render)**
4. **Regularly update dependencies**
5. **Implement rate limiting for production**
6. **Use environment variables for all secrets**

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:5000/health
```

## 📖 Additional Documentation

- [Database Schema Diagram](docs/database-schema.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Support

For issues or questions, please contact the development team.

## 📄 License

ISC
