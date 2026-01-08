@echo off
echo ================================================
echo Quotation Management System - Installation
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed
    echo Please install PostgreSQL from https://www.postgresql.org/
    pause
    exit /b 1
)
echo [OK] PostgreSQL found

echo.
echo ================================================
echo Step 1: Database Setup
echo ================================================

set /p DB_USER="Enter PostgreSQL username (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_NAME="Enter database name (default: quotation_db): "
if "%DB_NAME%"=="" set DB_NAME=quotation_db

set /p DB_PASSWORD="Enter PostgreSQL password: "

echo Creating database %DB_NAME%...
createdb -U %DB_USER% %DB_NAME% 2>nul
echo [OK] Database created or already exists

echo Initializing database schema...
psql -U %DB_USER% -d %DB_NAME% -f backend\database\schema.sql >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Database schema initialized
) else (
    echo [ERROR] Failed to initialize schema
    pause
    exit /b 1
)

echo.
echo ================================================
echo Step 2: Backend Setup
echo ================================================

cd backend

echo Configuring backend environment...
(
echo PORT=5000
echo DB_USER=%DB_USER%
echo DB_HOST=localhost
echo DB_NAME=%DB_NAME%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_PORT=5432
echo NODE_ENV=development
) > .env
echo [OK] Backend environment configured

echo Installing backend dependencies...
call npm install
if %errorlevel% equ 0 (
    echo [OK] Backend dependencies installed
) else (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ================================================
echo Step 3: Frontend Setup
echo ================================================

cd frontend

echo Configuring frontend environment...
(
echo REACT_APP_API_URL=http://localhost:5000/api
) > .env
echo [OK] Frontend environment configured

echo Installing frontend dependencies (this may take a few minutes)...
call npm install
if %errorlevel% equ 0 (
    echo [OK] Frontend dependencies installed
) else (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ================================================
echo Installation Complete! 🎉
echo ================================================
echo.
echo To start the application:
echo.
echo 1. Start the backend:
echo    cd backend
echo    npm start
echo.
echo 2. In a new command prompt, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo The application will open at http://localhost:3000
echo.
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.
echo Happy quoting! 🎯
echo.
pause
