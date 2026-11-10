#!/bin/bash

# PayGuard AI - Quick Start Script
# Run this after Docker Desktop is fully started

echo "🚀 PayGuard AI - Quick Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Docker
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo ""
    echo "Please start Docker Desktop and wait for it to fully initialize."
    echo "You'll see a whale icon in your system tray when it's ready."
    echo ""
    echo "Then run this script again: ./quick-start.sh"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start services
echo "Starting infrastructure services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30

echo ""
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U payguard > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL is still starting..."
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "⚠️  Redis is still starting..."
fi

# Check Elasticsearch
if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "✅ Elasticsearch is ready"
else
    echo "⚠️  Elasticsearch is still starting (may take another 30s)..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next steps:"
echo ""
echo "1. cd backend"
echo "2. npm run db:generate"
echo "3. npm run db:migrate"
echo "4. npm run db:seed"
echo "5. npm run dev"
echo ""
echo "Then open: http://localhost:3001/health"
echo ""
echo "📚 Full testing guide: backend/TESTING_GUIDE.md"
