#!/bin/bash

echo "================================================"
echo "Quotation Management System - Installation"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL from https://www.postgresql.org/"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

echo ""
echo "================================================"
echo "Step 1: Database Setup"
echo "================================================"

# Database setup
echo -e "${YELLOW}Creating database...${NC}"
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter database name (default: quotation_db): " DB_NAME
DB_NAME=${DB_NAME:-quotation_db}

# Create database
echo "Creating database $DB_NAME..."
createdb -U $DB_USER $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created successfully${NC}"
else
    echo -e "${YELLOW}Database might already exist, continuing...${NC}"
fi

# Initialize schema
echo "Initializing database schema..."
psql -U $DB_USER -d $DB_NAME -f backend/database/schema.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema initialized${NC}"
else
    echo -e "${RED}✗ Failed to initialize schema${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo "Step 2: Backend Setup"
echo "================================================"

cd backend

# Update .env file
echo "Configuring backend environment..."
cat > .env << EOF
PORT=5000
DB_USER=$DB_USER
DB_HOST=localhost
DB_NAME=$DB_NAME
DB_PASSWORD=postgres
DB_PORT=5432
NODE_ENV=development
EOF
echo -e "${GREEN}✓ Backend environment configured${NC}"

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "================================================"
echo "Step 3: Frontend Setup"
echo "================================================"

cd frontend

# Create .env file
echo "Configuring frontend environment..."
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
echo -e "${GREEN}✓ Frontend environment configured${NC}"

# Install frontend dependencies
echo "Installing frontend dependencies (this may take a few minutes)..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "================================================"
echo "Installation Complete! 🎉"
echo "================================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "The application will open at http://localhost:3000"
echo ""
echo "Default credentials for PostgreSQL:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "Happy quoting! 🎯"
