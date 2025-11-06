#!/bin/bash

# Health check script for PlusPlusMinus-HPMS
# This script checks if the application is healthy by testing key endpoints

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=30

echo "🔍 Starting health checks..."

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=$3

    echo "Checking $url..."

    if curl -f -s --max-time $timeout -o /dev/null -w "%{http_code}" "$url" | grep -q "^$expected_status$"; then
        echo "✅ $url is healthy"
        return 0
    else
        echo "❌ $url is not responding correctly"
        return 1
    fi
}

# Check backend health
echo "🏥 Checking backend health..."
if ! check_endpoint "$BACKEND_URL/health" 200 $TIMEOUT; then
    echo "Backend health check failed"
    exit 1
fi

# Check backend API root
if ! check_endpoint "$BACKEND_URL/api" 200 $TIMEOUT; then
    echo "Backend API check failed"
    exit 1
fi

# Check frontend health (if running)
echo "� Checking frontend health..."
if curl -f -s --max-time 10 -o /dev/null "$FRONTEND_URL"; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend not accessible (might be expected if not running)"
fi

# Check database connectivity (via backend)
echo "�️  Checking database connectivity..."
if ! check_endpoint "$BACKEND_URL/api/health/db" 200 $TIMEOUT; then
    echo "Database connectivity check failed"
    exit 1
fi

echo "🎉 All health checks passed!"
exit 0