#!/bin/bash
# TigerTrust - Stop All Backend Services

echo "=========================================="
echo "   Stopping TigerTrust Backends"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PID_FILE="$SCRIPT_DIR/.backend_pids"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

if [ -f "$PID_FILE" ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "Stopping process ${pid}..."
            kill $pid
            sleep 1
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "Force killing process ${pid}..."
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✓ Process ${pid} stopped${NC}"
        fi
    done < "$PID_FILE"
    
    rm "$PID_FILE"
    echo ""
    echo -e "${GREEN}✓ All backend services stopped${NC}"
else
    echo -e "${RED}No running services found (PID file missing)${NC}"
    echo ""
    echo "Attempting to stop by port..."
    
    # Try to stop by common ports
    fuser -k 5001/tcp 2>/dev/null && echo "  ✓ Stopped service on port 5001"
    fuser -k 5000/tcp 2>/dev/null && echo "  ✓ Stopped service on port 5000"
fi

echo ""
