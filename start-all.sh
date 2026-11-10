#!/bin/bash

# PayGuard AI - Start All Services
# This script starts the ML service, backend, and frontend

echo "🚀 Starting PayGuard AI Services..."
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22+ first."
    exit 1
fi

# Install Python dependencies for ML service
echo "📦 Installing ML dependencies..."
cd ml
pip install -r requirements.txt --quiet
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --silent
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Starting services..."
echo ""

# Start ML service in background
echo "🤖 Starting ML Service on port 8000..."
cd ml/src/api
python -m uvicorn main:app --reload --port 8000 > ../../../logs/ml-service.log 2>&1 &
ML_PID=$!
cd ../../..
echo "   ML Service PID: $ML_PID"

# Wait for ML service to start
sleep 3

# Start backend in background
echo "⚙️  Starting Backend on port 3001..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend in foreground (or background with &)
echo "🎨 Starting Frontend on port 3000..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Access URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   ML API:    http://localhost:8000"
echo "   API Docs:  http://localhost:3001/api/v1/docs"
echo ""
echo "📊 Service PIDs:"
echo "   ML Service: $ML_PID"
echo "   Backend:    $BACKEND_PID"
echo "   Frontend:   $FRONTEND_PID"
echo ""
echo "📝 Logs are in ./logs/ directory"
echo ""
echo "To stop all services: kill $ML_PID $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to view logs (services will continue running)..."
echo ""

# Save PIDs to file
mkdir -p logs
echo "ML_PID=$ML_PID" > logs/pids.txt
echo "BACKEND_PID=$BACKEND_PID" >> logs/pids.txt
echo "FRONTEND_PID=$FRONTEND_PID" >> logs/pids.txt

# Tail all logs
tail -f logs/ml-service.log logs/backend.log logs/frontend.log
