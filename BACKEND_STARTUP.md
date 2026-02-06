# TigerTrust Backend Startup Guide

This guide explains how to start all TigerTrust backend services with a single command.

## 📦 Backend Services

TigerTrust has three backend services:

1. **AI Scoring API** (Flask - Port 5001)
   - Location: `ai_scoring/`
   - Handles credit scoring and loan evaluation
   - Endpoints: `/api/score/calculate`, `/api/loan/evaluate`

2. **Human Verification API** (Flask - Port 5000)
   - Location: `human_verification/`
   - Handles facial recognition and liveness detection
   - Endpoints: `/api/verify/human`

3. **RSE Server** (Node.js - Port varies)
   - Location: `rse-server/`
   - Real-time Scoring Engine
   - Handles on-chain data aggregation and Stripe integration

## 🚀 Quick Start

### Option 1: Using Python Script (Recommended)
```bash
python start_backends.py
```

This will:
- ✅ Start all three backend services
- ✅ Monitor their health
- ✅ Show live status with color-coded output
- ✅ Stop all services with Ctrl+C

### Option 2: Using NPM Script
```bash
npm run backends
```

### Option 3: Using Shell Script (Linux/Mac/Git Bash)
```bash
bash start_backends.sh
```

### Option 4: Using Batch File (Windows)
```bash
start_backends.bat
```
This opens each service in a separate terminal window.

## 🛑 Stopping All Services

### Python/NPM Method
Press `Ctrl+C` in the terminal running `start_backends.py`

### Shell Script Method
```bash
bash stop_backends.sh
```
or
```bash
npm run stop-backends
```

### Windows Batch Method
```bash
stop_backends.bat
```
or
```bash
npm run stop-backends:windows
```

## 📋 Manual Startup (Old Way)

If you need to start services individually:

### 1. AI Scoring Backend
```bash
cd ai_scoring
python api.py
```

### 2. Human Verification Backend
```bash
cd human_verification
python app.py
```

### 3. RSE Server
```bash
cd rse-server
npm run dev
```

## 🔍 Verifying Services are Running

After starting, check these URLs:

- **AI Scoring**: http://localhost:5001/health (if health endpoint exists)
- **Human Verification**: http://localhost:5000/health (if health endpoint exists)
- **RSE Server**: Check the terminal output for the port number

## 📊 Service Status

The Python startup script (`start_backends.py`) shows:
- ✅ Service names
- 🔢 Process IDs (PIDs)
- 📝 Real-time status monitoring
- ⚠️ Automatic alerts if a service crashes

## 🐛 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. Stop all services:
   ```bash
   npm run stop-backends
   ```

2. Or manually kill processes:
   ```bash
   # On Linux/Mac
   lsof -ti:5001 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :5001
   taskkill /PID <PID> /F
   ```

### Python Dependencies Missing
```bash
cd ai_scoring
pip install -r requirements.txt

cd ../human_verification
pip install -r requirements.txt
```

### Node Dependencies Missing
```bash
cd rse-server
npm install
```

### Service Won't Start
1. Check the log files (if using shell script):
   - `AI_Scoring_API.log`
   - `Human_Verification.log`
   - `RSE_Server.log`

2. Check for errors in the terminal output

3. Ensure Python 3.x and Node.js are installed:
   ```bash
   python --version
   node --version
   ```

## 🎯 Recommended Workflow

### Development:
```bash
# Terminal 1: Start all backends
npm run backends

# Terminal 2: Start frontend
npm run dev
```

### Production:
Use PM2 or Docker Compose for production deployments.

## 📝 Environment Variables

Make sure you have the necessary `.env` files in each service directory:

- `ai_scoring/.env` - Gemini API key (optional, fallback works without it)
- `human_verification/.env` - Face++ API keys
- `rse-server/.env` - Solana RPC, Stripe keys

## ✨ Features

**Python Script (`start_backends.py`):**
- ✅ Single command to start all services
- ✅ Color-coded status output
- ✅ Process monitoring
- ✅ Graceful shutdown with Ctrl+C
- ✅ Cross-platform (Windows/Linux/Mac)

**Shell Script (`start_backends.sh`):**
- ✅ Background process management
- ✅ Log file creation
- ✅ PID tracking for clean shutdown

**Batch File (`start_backends.bat`):**
- ✅ Separate windows for each service
- ✅ Native Windows experience
- ✅ Easy to monitor each service

## 🔗 Integration

The frontend (Next.js) is configured to connect to these backends:
- AI Scoring: `process.env.NEXT_PUBLIC_AI_SCORING_API` or `http://localhost:5001`
- Human Verification: `process.env.NEXT_PUBLIC_BACKEND_URL` or `http://localhost:5000`

Make sure your `.env.local` has these values set correctly.

---

**Made with ❤️ for TigerTrust**
