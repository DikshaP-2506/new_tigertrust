@echo off
REM TigerTrust AI Scoring Service Startup Script (Windows)

echo ========================================
echo   TigerTrust AI Scoring Service
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv venv
    exit /b 1
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Copying .env.example to .env...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your API keys!
    exit /b 1
)

REM Check dependencies
echo 🔍 Checking dependencies...
python -c "import google.generativeai" 2>nul
if errorlevel 1 (
    echo 📥 Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo ✅ Environment ready!
echo.

REM Parse command line arguments
set SERVICE=%1

if "%SERVICE%"=="api" (
    echo 🚀 Starting API service on port 5001...
    python api.py
) else if "%SERVICE%"=="scheduler" (
    echo ⏰ Starting scheduler service...
    python scheduler.py
) else if "%SERVICE%"=="test" (
    echo 🧪 Running test scorer...
    python gemini_scorer.py
) else (
    echo Usage: start.bat [api^|scheduler^|test]
    echo.
    echo Services:
    echo   api        - Start the REST API service
    echo   scheduler  - Start the periodic update scheduler
    echo   test       - Run a test score calculation
    echo.
    exit /b 1
)
