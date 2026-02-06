#!/bin/bash
# TigerTrust - Unified Backend Startup Script
# Starts all backend services in separate terminals

echo "=========================================="
echo "   TigerTrust Backend Startup"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local command=$3
    
    echo -e "${BLUE}➤ Starting ${service_name}...${NC}"
    
    if [ -d "$service_dir" ]; then
        cd "$service_dir"
        
        # Start in background
        $command > "${service_name// /_}.log" 2>&1 &
        local pid=$!
        
        sleep 2
        
        # Check if still running
        if ps -p $pid > /dev/null; then
            echo -e "${GREEN}✓ ${service_name} started (PID: $pid)${NC}"
            echo $pid >> "$SCRIPT_DIR/.backend_pids"
        else
            echo -e "${RED}✗ ${service_name} failed to start${NC}"
        fi
        
        cd "$SCRIPT_DIR"
    else
        echo -e "${RED}✗ Directory not found: $service_dir${NC}"
    fi
    echo ""
}

# Clean up old PID file
rm -f "$SCRIPT_DIR/.backend_pids"

# Start AI Scoring Backend (Port 5001)
echo "=========================================="
echo "   AI Scoring Backend (Port 5001)"
echo "=========================================="
start_service "AI Scoring API" "$SCRIPT_DIR/ai_scoring" "python api.py"

# Start Human Verification Backend (Port 5000)
echo "=========================================="
echo "   Human Verification (Port 5000)"
echo "=========================================="
start_service "Human Verification" "$SCRIPT_DIR/human_verification" "python app.py"

# Start RSE Server
echo "=========================================="
echo "   RSE Server"
echo "=========================================="
start_service "RSE Server" "$SCRIPT_DIR/rse-server" "npm run dev"

echo "=========================================="
echo "   All Services Started"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Backend services are running${NC}"
echo ""
echo "Logs are being written to:"
echo "  • AI_Scoring_API.log"
echo "  • Human_Verification.log"
echo "  • RSE_Server.log"
echo ""
echo "To stop all services, run: ./stop_backends.sh"
echo ""
