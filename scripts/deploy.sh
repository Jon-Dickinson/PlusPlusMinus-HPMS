#!/bin/bash

# Deploy script for Railway
# This script assumes you have Railway CLI installed and configured

set -e

echo "🚀 Starting deployment to Railway..."

# Build and deploy backend
echo "📦 Building backend..."
cd backend
npm ci
npm run build

echo "🚂 Deploying backend to Railway..."
railway up --service backend

# Build and deploy frontend
echo "📦 Building frontend..."
cd ../frontend
npm ci
npm run build

echo "🚀 Deploying frontend to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at:"
echo "  Frontend: https://your-vercel-domain.vercel.app"
echo "  Backend: https://your-railway-domain.up.railway.app"