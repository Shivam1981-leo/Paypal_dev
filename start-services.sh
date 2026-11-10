#!/bin/bash

echo "🚀 Starting PayGuard AI Development Environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start Docker services
echo ""
echo "📦 Starting database services (PostgreSQL, Redis, Elasticsearch)..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check PostgreSQL
until docker exec payguard-postgres pg_isready -U payguard > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check Redis
until docker exec payguard-redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

# Check Elasticsearch
until curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do
    echo "   Waiting for Elasticsearch..."
    sleep 2
done
echo "✅ Elasticsearch is ready"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All services are running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Service URLs:"
echo "   PostgreSQL:     localhost:5432"
echo "   Redis:          localhost:6379"
echo "   Elasticsearch:  http://localhost:9200"
echo ""
echo "🔐 Database Credentials:"
echo "   Database: payguard_dev"
echo "   User:     payguard"
echo "   Password: dev_password"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. cp .env.example .env"
echo "3. Edit .env with your PayPal credentials"
echo "4. npm install"
echo "5. npm run db:generate && npm run db:migrate"
echo "6. npm run dev"
echo ""
