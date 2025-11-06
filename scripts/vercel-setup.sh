#!/bin/bash

# Vercel deployment helper script
# Usage: ./scripts/vercel-setup.sh [command]

set -e

PROJECT_DIR="frontend"
VERCEL_PROJECT="plus-plus-minus-hpms"

echo "🔧 Vercel Deployment Helper"
echo "Project: $VERCEL_PROJECT"
echo "Directory: $PROJECT_DIR"
echo

case "${1:-help}" in
    "login")
        echo "Logging into Vercel..."
        vercel login
        ;;
    "link")
        echo "Linking project..."
        cd "$PROJECT_DIR"
        vercel link --yes
        ;;
    "env")
        echo "Setting up environment variables..."
        cd "$PROJECT_DIR"
        echo "Please set these environment variables in Vercel dashboard:"
        echo "- NEXT_PUBLIC_API_URL"
        echo "- Any other required env vars"
        ;;
    "deploy")
        echo "Deploying to Vercel..."
        cd "$PROJECT_DIR"
        vercel --prod
        ;;
    "build")
        echo "Building project..."
        cd "$PROJECT_DIR"
        vercel build
        ;;
    "help"|*)
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  login     - Login to Vercel CLI"
        echo "  link      - Link project to Vercel"
        echo "  env       - Show environment setup instructions"
        echo "  deploy    - Deploy to production"
        echo "  build     - Build project locally"
        echo "  help      - Show this help"
        echo
        echo "For CI/CD, ensure VERCEL_TOKEN is set in GitHub secrets"
        ;;
esac