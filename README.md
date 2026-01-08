# Quotation Management System

A comprehensive, enterprise-grade Quotation Management System built with Node.js (backend) and React (frontend) for accurate manufacturing and engineering quotations.

## 🎯 Features

- **Multi-part Quotations**: Create quotations with multiple parts
- **Multi-operation Costing**: Each part can have multiple CNC/manufacturing operations
- **Dynamic Cost Calculation**: Real-time cost updates as you enter data
- **Machine Master**: Manage machines with hourly rates
- **Customer Master**: Maintain customer database
- **Auxiliary Cost Master**: Standardize non-machine costs (setup, inspection, tooling, etc.)
- **Professional UI**: Clean, card-based industrial interface
- **Status Management**: Draft → Submitted → Approved/Rejected workflow
- **Comprehensive Calculations**: Material + Operations + Auxiliary costs with margin, discount, and VAT
- **PDF Export**: Generate professional PDF quotations
- **Excel Export**: Export detailed quotations to Excel spreadsheets
- **PDF Export**: Generate professional PDF quotations with one click
- **Excel Export**: Export quotations to Excel with detailed breakdowns (3 sheets)
- **List Export**: Export all quotations to Excel for analysis

## 🏗 Architecture

- **Frontend**: React 18 with React Router
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **API**: RESTful architecture
- **Auto-generated IDs**: All system IDs are auto-generated
- **Real-time Calculations**: All costs recalculate automatically

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quotation-system
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE quotation_db;

# Exit psql
\q
```

#### Initialize Database Schema

```bash
# Navigate to backend directory
cd backend

# Run the schema file
psql -U postgres -d quotation_db -f database/schema.sql
```

This will create all tables and insert sample data for machines, customers, and auxiliary costs.

### 3. Backend Setup

```bash
# Navigate to backend directory (if not already there)
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials
# nano .env or use your preferred editor
```

Edit the `.env` file:
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

The `.env` file should contain:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎮 Running the Application

### Start Backend Server

```bash
# From the backend directory
cd backend
npm start

# For development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend Application

```bash
# From the frontend directory (in a new terminal)
cd frontend
npm start
```

The React application will open automatically at `http://localhost:3000`

## 📊 Database Schema

### Core Tables

1. **machines**: Machine master data with hourly rates
2. **customers**: Customer information
3. **auxiliary_costs**: Auxiliary cost types (setup, inspection, etc.)
4. **quotations**: Quotation headers with financial summary
5. **quotation_parts**: Individual parts in each quotation
6. **part_operations**: Operations for each part
7. **part_auxiliary_costs**: Auxiliary costs for each part

### Key Relationships

- Quotations → Customer (Many-to-One)
- Quotations → Parts (One-to-Many)
- Parts → Operations (One-to-Many)
- Parts → Auxiliary Costs (One-to-Many)
- Operations → Machine (Many-to-One)

## 🎨 User Interface

### Main Sections

1. **Dashboard**: Overview with statistics and recent quotations
2. **Quotations**: List, create, edit, and view quotations
3. **Machines**: Manage CNC machines and hourly rates
4. **Customers**: Manage customer database
5. **Auxiliary Costs**: Manage auxiliary cost types

### Quotation Creation Workflow

1. Enter general information (customer, date, terms)
2. Add parts with material costs and quantities
3. Add operations (machine + time) for each part
4. Add auxiliary costs for each part
5. Set discount, margin, and VAT percentages
6. Review real-time calculations
7. Submit quotation

## 📐 Cost Calculation Logic

### Part-Level Calculation

```
Unit Operations Cost = Σ (Machine Hourly Rate × Operation Time)
Unit Auxiliary Cost = Σ Auxiliary Costs
Unit Total Cost = Material Cost + Operations Cost + Auxiliary Cost
Part Subtotal = Unit Total Cost × Quantity
```

### Quotation-Level Calculation

```
Total Parts Cost = Σ All Part Subtotals
Subtotal = Total Parts Cost
Discount Amount = Subtotal × Discount %
After Discount = Subtotal - Discount Amount
Margin Amount = After Discount × Margin %
After Margin = After Discount + Margin Amount
VAT Amount = After Margin × VAT %
Total Quote Value = After Margin + VAT Amount
```

## 🔐 API Endpoints

### Machines
- GET `/api/machines` - Get all active machines
- GET `/api/machines/:id` - Get machine by ID
- POST `/api/machines` - Create new machine
- PUT `/api/machines/:id` - Update machine
- PATCH `/api/machines/:id/disable` - Disable machine
- PATCH `/api/machines/:id/enable` - Enable machine

### Customers
- GET `/api/customers` - Get all active customers
- GET `/api/customers/:id` - Get customer by ID
- POST `/api/customers` - Create new customer
- PUT `/api/customers/:id` - Update customer
- PATCH `/api/customers/:id/disable` - Disable customer
- PATCH `/api/customers/:id/enable` - Enable customer

### Auxiliary Costs
- GET `/api/auxiliary-costs` - Get all active auxiliary costs
- GET `/api/auxiliary-costs/:id` - Get auxiliary cost by ID
- POST `/api/auxiliary-costs` - Create new auxiliary cost
- PUT `/api/auxiliary-costs/:id` - Update auxiliary cost
- PATCH `/api/auxiliary-costs/:id/disable` - Disable auxiliary cost
- PATCH `/api/auxiliary-costs/:id/enable` - Enable auxiliary cost

### Quotations
- GET `/api/quotations` - Get all quotations
- GET `/api/quotations/:id` - Get quotation by ID with full details
- POST `/api/quotations` - Create new quotation
- PUT `/api/quotations/:id` - Update quotation
- PATCH `/api/quotations/:id/status` - Update quotation status
- DELETE `/api/quotations/:id` - Delete quotation

## 🛠 Customization

### Adding New Machine Types

Edit `frontend/src/components/Machines/MachineList.js` and add options to the machine type dropdown.

### Adding New Currencies

Edit `frontend/src/components/Quotations/QuotationForm.js` and add options to the currency dropdown.

### Modifying Quotation Status Flow

Edit the status options in both:
- `database/schema.sql` (database constraints)
- `frontend/src/components/Quotations/QuotationView.js` (UI logic)

## 📈 Future Enhancements

Potential features for future development:

1. **PDF Export**: Generate professional PDF quotations
2. **Excel Export**: Export quotations to Excel format
3. **Email Integration**: Send quotations directly to customers
4. **Approval Workflow**: Multi-level approval system
5. **Dashboard Analytics**: Charts and graphs for quotation trends
6. **Barcode Generation**: Generate barcodes for quote numbers
7. **Template System**: Save and reuse quotation templates
8. **Revision History**: Track changes to quotations
9. **User Authentication**: Login system with roles
10. **Reporting Module**: Custom reports and analytics

## 🐛 Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check credentials in `.env` file
3. Verify database exists: `psql -U postgres -l`
4. Check PostgreSQL logs for errors

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change PORT in backend `.env` file
2. Update REACT_APP_API_URL in frontend `.env` file
3. Restart both servers

### CORS Issues

If you encounter CORS errors:

1. Verify backend CORS configuration in `server.js`
2. Check that frontend is making requests to correct API URL
3. Ensure both servers are running

## 📝 Sample Data

The system comes with pre-populated sample data:

**Machines:**
- CNC Mill 1 ($75/hr)
- CNC Lathe 1 ($65/hr)
- EDM Machine 1 ($90/hr)
- WEDM Machine 1 ($85/hr)
- Grinder 1 ($55/hr)

**Auxiliary Costs:**
- Setup Cost ($50)
- Inspection ($30)
- Tooling ($100)
- Transport ($25)
- Packaging ($20)

**Customers:**
- ABC Manufacturing Ltd
- XYZ Engineering Corp

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for Manufacturing Excellence**
