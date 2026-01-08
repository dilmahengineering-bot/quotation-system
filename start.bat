@echo off
echo ================================================
echo Starting Quotation Management System
echo ================================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend application...
start "Frontend Application" cmd /k "cd frontend && npm start"

echo.
echo ================================================
echo Application Started! 🚀
echo ================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two command windows have been opened.
echo Close them to stop the application.
echo.
pause
