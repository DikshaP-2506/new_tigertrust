@echo off
REM TigerTrust - Unified Backend Startup Script for Windows
REM Starts all backend services

echo ==========================================
echo    TigerTrust Backend Startup
echo ==========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Start AI Scoring Backend (Port 5001)
echo ==========================================
echo    AI Scoring Backend (Port 5001)
echo ==========================================
cd ai_scoring
start "AI Scoring API" cmd /k python api.py
cd ..
timeout /t 2 /nobreak >nul
echo [92m* AI Scoring API started[0m
echo.

REM Start Human Verification Backend (Port 5000)
echo ==========================================
echo    Human Verification (Port 5000)
echo ==========================================
cd human_verification
start "Human Verification" cmd /k python app.py
cd ..
timeout /t 2 /nobreak >nul
echo [92m* Human Verification started[0m
echo.

REM Start RSE Server
echo ==========================================
echo    RSE Server
echo ==========================================
cd rse-server
start "RSE Server" cmd /k npm run dev
cd ..
timeout /t 2 /nobreak >nul
echo [92m* RSE Server started[0m
echo.

echo ==========================================
echo    All Services Started
echo ==========================================
echo.
echo [92m* All backend services are running in separate windows[0m
echo.
echo To stop services, close their terminal windows or run: stop_backends.bat
echo.
pause
