#!/bin/bash

# Local deployment script for testing
# Use this to deploy AGOS locally before pushing to production

set -e

echo "🚀 Starting local AGOS deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    DOCKER_AVAILABLE=true
else
    echo "⚠️ Docker not found, will use Node.js directly"
    DOCKER_AVAILABLE=false
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create logs and data directories
mkdir -p logs data

# Setup environment file
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "🔧 Please edit .env file with your configuration"
fi

# Choose deployment method
if [ "$DOCKER_AVAILABLE" = true ] && [ "$1" = "--docker" ]; then
    echo "🐳 Deploying with Docker..."

    # Build and start containers
    docker-compose up --build -d

    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 10

    # Health check
    echo "🏥 Performing health check..."
    if curl -f http://localhost:3000/api/health; then
        echo "✅ AGOS is running with Docker!"
        echo "🌐 Access your application at: http://localhost:3000"
    else
        echo "❌ Health check failed"
        docker-compose logs
        exit 1
    fi

else
    echo "📦 Deploying with Node.js directly..."

    # Start with PM2 if available, otherwise with node
    if command -v pm2 &> /dev/null; then
        echo "🔄 Starting with PM2..."
        pm2 stop agos || true
        pm2 delete agos || true
        pm2 start server.js --name agos
        pm2 save
        pm2 startup

        # Health check
        sleep 5
        if curl -f http://localhost:3000/api/health; then
            echo "✅ AGOS is running with PM2!"
            echo "🌐 Access your application at: http://localhost:3000"
            echo "📊 Monitor with: pm2 monit"
        else
            echo "❌ Health check failed"
            pm2 logs agos
            exit 1
        fi
    else
        echo "🔄 Starting with Node.js..."
        echo "⚠️ Note: This will run in foreground. Use Ctrl+C to stop."
        npm start
    fi
fi
