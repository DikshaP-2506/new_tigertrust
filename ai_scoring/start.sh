#!/bin/bash

# TigerTrust AI Scoring Service Startup Script

echo "========================================"
echo "  TigerTrust AI Scoring Service"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
    exit 1
fi

# Check dependencies
echo "🔍 Checking dependencies..."
python -c "import google.generativeai" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "✅ Environment ready!"
echo ""

# Parse command line arguments
SERVICE=$1

case $SERVICE in
    "api")
        echo "🚀 Starting API service on port 5001..."
        python api.py
        ;;
    "scheduler")
        echo "⏰ Starting scheduler service..."
        python scheduler.py
        ;;
    "test")
        echo "🧪 Running test scorer..."
        python gemini_scorer.py
        ;;
    *)
        echo "Usage: ./start.sh [api|scheduler|test]"
        echo ""
        echo "Services:"
        echo "  api        - Start the REST API service"
        echo "  scheduler  - Start the periodic update scheduler"
        echo "  test       - Run a test score calculation"
        echo ""
        exit 1
        ;;
esac
