# Quotation Management System

A robust, scalable, and modular **Quotation Management System** built with **Node.js** (backend) and **React** (frontend) for generating accurate manufacturing and engineering quotations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Features

### Core Functionality
- ✅ **Multi-part quotations** with unlimited parts per quote
- ✅ **Multi-operation costing** per part with machine-based calculations
- ✅ **Dynamic auxiliary costs** (setup, tooling, inspection, etc.)
- ✅ **Real-time cost calculations** with instant UI updates
- ✅ **Professional industrial-grade UI** with responsive design
- ✅ **Secure JWT authentication** with role-based access control
- ✅ **Complete audit trail** for ISO compliance

### User Roles & Permissions
| Role | Permissions |
|------|-------------|
| Admin | Full access to all features |
| Sales/Technician | Create quotation drafts, add parts & operations |
| Engineer | Review & modify costing, approve quotations |
| Management | Final approval, pricing lock, issue quotation |

### Quotation Workflow
```
Draft → Submitted → Engineer Approved → Management Approved → Issued
                ↓                 ↓                    ↓
              Rejected ←——————————←————————————————————←
```

## 🏗 Architecture

```
quotation-system/
├── backend/                    # Node.js REST API
│   ├── src/
│   │   ├── config/            # Database & JWT config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/            # API endpoints
│   │   └── server.js          # Express app entry
│   └── migrations/            # Database schema & seeds
│
└── frontend/                   # React SPA
    ├── public/
    └── src/
        ├── components/        # React components
        │   ├── auth/          # Login, authentication
        │   ├── common/        # Shared UI components
        │   ├── dashboard/     # Dashboard views
        │   ├── masters/       # Customers, Machines, Users
        │   └── quotations/    # Quotation CRUD & workflow
        ├── context/           # React context (Auth)
        └── services/          # API client
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb quotation_db

# Or using psql
psql -U postgres -c "CREATE DATABASE quotation_db;"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Start server
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | john.sales | password123 |
| Engineer | jane.engineer | password123 |
| Management | mike.manager | password123 |

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login           # Login
POST /api/auth/change-password # Change password
GET  /api/auth/profile         # Get current user
```

### Users (Admin only)
```
GET    /api/users              # List users
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Disable user
```

### Customers
```
GET    /api/customers          # List customers
POST   /api/customers          # Create customer
PUT    /api/customers/:id      # Update customer
DELETE /api/customers/:id      # Delete customer
```

### Machines
```
GET    /api/machines           # List machines
GET    /api/machines/types     # Get machine types
POST   /api/machines           # Create machine
PUT    /api/machines/:id       # Update machine
DELETE /api/machines/:id       # Delete machine
```

### Auxiliary Costs
```
GET    /api/auxiliary-costs    # List auxiliary cost types
POST   /api/auxiliary-costs    # Create cost type
PUT    /api/auxiliary-costs/:id # Update cost type
DELETE /api/auxiliary-costs/:id # Delete cost type
```

### Quotations
```
GET    /api/quotations              # List quotations
GET    /api/quotations/statistics   # Get dashboard stats
POST   /api/quotations              # Create quotation
GET    /api/quotations/:id          # Get quotation details
PUT    /api/quotations/:id          # Update quotation
DELETE /api/quotations/:id          # Delete draft quotation

# Workflow
POST   /api/quotations/:id/submit              # Submit for approval
POST   /api/quotations/:id/engineer-approve    # Engineer approval
POST   /api/quotations/:id/management-approve  # Management approval
POST   /api/quotations/:id/reject              # Reject quotation
POST   /api/quotations/:id/issue               # Issue quotation
POST   /api/quotations/:id/revert-draft        # Revert to draft

# Parts & Operations
POST   /api/quotations/:id/parts                              # Add part
PUT    /api/quotations/:id/parts/:partId                      # Update part
DELETE /api/quotations/:id/parts/:partId                      # Delete part
POST   /api/quotations/:id/parts/:partId/operations           # Add operation
PUT    /api/quotations/:id/parts/:partId/operations/:opId     # Update operation
DELETE /api/quotations/:id/parts/:partId/operations/:opId     # Delete operation
POST   /api/quotations/:id/parts/:partId/auxiliary-costs      # Add aux cost
```

## 💰 Pricing Calculation Formula

```
Part Subtotal = (Material Cost + Operations Cost + Auxiliary Cost) × Quantity

Operations Cost = Σ(Machine Hourly Rate × Operation Time)

Other Cost = Σ(Quantity × Rate/Hour) for each cost type
  - Salary Cost_Technician
  - Salary Cost_Admin  
  - Repair and Maintenance
  - Rent
  - Insurance

Subtotal = Part Subtotal + Other Cost

Quotation Total = Subtotal - Discount + Margin + VAT

Where:
- Discount Amount = Subtotal × Discount %
- Margin Amount = (Subtotal - Discount) × Margin %
- VAT Amount = (Subtotal - Discount + Margin) × VAT %
```

## 🗄 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **customers** - Customer master data
- **machines** - Machine types and hourly rates
- **auxiliary_costs** - Standard auxiliary cost types
- **quotations** - Quotation header/summary
- **quotation_parts** - Parts within quotations
- **part_operations** - Machine operations per part
- **part_auxiliary_costs** - Auxiliary costs per part
- **quotation_audit_log** - Change history for compliance

## 🛡 Security Features

- JWT-based authentication with configurable expiry
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)
- Input validation on client and server
- SQL injection protection via parameterized queries
- CORS configuration
- Helmet.js security headers

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quotation_db
DB_USER=postgres
DB_PASSWORD=Dilmah@456

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# App Settings
DEFAULT_CURRENCY=USD
VAT_PERCENT=12
```

## 📦 Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router 6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 🚧 Future Enhancements

- [ ] PDF quotation generation with barcode
- [ ] Excel export functionality
- [ ] Email notifications for workflow events
- [ ] Dashboard analytics and charts
- [ ] Customer portal for quote viewing
- [ ] Multi-currency support with exchange rates
- [ ] File attachments for parts/quotations
- [ ] Revision history comparison

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for manufacturing excellence.
