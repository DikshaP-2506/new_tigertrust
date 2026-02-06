@echo off
REM TigerTrust - Stop All Backend Services for Windows

echo ==========================================
echo    Stopping TigerTrust Backends
echo ==========================================
echo.

REM Kill Python processes (Flask apps)
echo Stopping Python backend services...
taskkill /FI "WINDOWTITLE eq AI Scoring API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Human Verification*" /F >nul 2>&1

REM Kill Node processes (RSE Server)
echo Stopping Node.js backend services...
taskkill /FI "WINDOWTITLE eq RSE Server*" /F >nul 2>&1

REM Alternative: Kill by port (if above doesn't work)
echo Stopping services by port...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo [92m* All backend services stopped[0m
echo.
pause
