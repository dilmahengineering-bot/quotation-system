#!/bin/bash

echo "================================================"
echo "Starting Quotation Management System"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started successfully${NC}"
else
    echo "✗ Backend failed to start"
    exit 1
fi

# Start frontend
echo ""
echo -e "${YELLOW}Starting frontend application...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo ""
echo "================================================"
echo "Application Started! 🚀"
echo "================================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Keep script running
wait
