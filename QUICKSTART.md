# Quick Start Guide

Get the Quotation Management System up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js (v14+) installed
- PostgreSQL (v12+) installed
- Git (optional)

## 🚀 Quick Setup

### Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb quotation_db

# Initialize schema
psql -d quotation_db -f backend/database/schema.sql
```

### Step 2: Backend Setup (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
echo "PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=your_password
DB_PORT=5432" > .env

# Start server
npm start
```

Backend will run at http://localhost:5000

### Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start application
npm start
```

Frontend will open at http://localhost:3000

## 🎉 You're Ready!

The system is now running with sample data:

- **Machines**: 5 pre-configured machines
- **Customers**: 2 sample customers
- **Auxiliary Costs**: 5 common cost types

### What to Do First

1. **Explore the Dashboard** - View system overview
2. **Check Machines** - See pre-loaded CNC machines
3. **Create a Quotation** - Try the quotation workflow
4. **Add Your Data** - Add your own machines, customers, and costs

## 🛠️ Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or on macOS
brew services list
```

### Port Already in Use
Change the port in `.env` files:
- Backend: Change `PORT=5000` to `PORT=5001`
- Frontend: Update `REACT_APP_API_URL` accordingly

### Missing Dependencies
```bash
# Reinstall all dependencies
npm install

# Clear npm cache if needed
npm cache clean --force
```

## 📚 Next Steps

- Read the [README.md](README.md) for full documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

## 💡 Quick Tips

1. All IDs are auto-generated - don't worry about them!
2. Real-time calculations happen automatically
3. You can add multiple parts and operations per quotation
4. Use the status workflow: Draft → Submitted → Approved/Rejected

## 🆘 Need Help?

- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible
- Check that ports 5000 and 3000 are available

---

**Happy Quoting! 🎯**
