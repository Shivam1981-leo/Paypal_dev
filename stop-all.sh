#!/bin/bash

# PayGuard AI - Stop All Services

echo "🛑 Stopping PayGuard AI Services..."

if [ -f logs/pids.txt ]; then
    source logs/pids.txt

    echo "Stopping ML Service (PID: $ML_PID)..."
    kill $ML_PID 2>/dev/null || echo "  Already stopped"

    echo "Stopping Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || echo "  Already stopped"

    echo "Stopping Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || echo "  Already stopped"

    rm logs/pids.txt
    echo ""
    echo "✅ All services stopped!"
else
    echo "⚠️  No PID file found. Killing by port..."

    # Kill processes on ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "  Port 8000 clear"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  Port 3001 clear"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  Port 3000 clear"

    echo "✅ Ports cleared!"
fi
