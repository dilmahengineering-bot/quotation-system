@echo off
echo ========================================
echo  Quotation Management System Startup
echo ========================================
echo.

echo [1/3] Testing Database Connection...
cd backend
call npm run test-db
if errorlevel 1 (
    echo.
    echo ❌ Database connection failed!
    echo Please fix the database issues before starting the servers.
    echo See DATABASE_TROUBLESHOOTING.md for help.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend Application...
cd ..\frontend
start "Frontend App" cmd /k "npm start"

echo.
echo ========================================
echo ✅ Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
echo (Servers will continue running in separate windows)
pause >nul
