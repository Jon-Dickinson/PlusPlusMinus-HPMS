#!/bin/bash

# Docker deployment script
# This script builds and pushes Docker images to a registry

set -e

# Configuration
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
ORG="${DOCKER_ORG:-jon-dickinson}"
IMAGE_NAME="plusplusminus"
TAG="${DOCKER_TAG:-$(git rev-parse --short HEAD)}"

echo "🐳 Building and deploying Docker images..."
echo "Registry: $REGISTRY"
echo "Organization: $ORG"
echo "Tag: $TAG"

# Build backend image
echo "📦 Building backend image..."
docker build -t $REGISTRY/$ORG/$IMAGE_NAME-backend:$TAG ./backend
docker tag $REGISTRY/$ORG/$IMAGE_NAME-backend:$TAG $REGISTRY/$ORG/$IMAGE_NAME-backend:latest

# Build frontend image
echo "📦 Building frontend image..."
docker build -t $REGISTRY/$ORG/$IMAGE_NAME-frontend:$TAG ./frontend
docker tag $REGISTRY/$ORG/$IMAGE_NAME-frontend:$TAG $REGISTRY/$ORG/$IMAGE_NAME-frontend:latest

# Push images
echo "🚀 Pushing images to registry..."
docker push $REGISTRY/$ORG/$IMAGE_NAME-backend:$TAG
docker push $REGISTRY/$ORG/$IMAGE_NAME-backend:latest
docker push $REGISTRY/$ORG/$IMAGE_NAME-frontend:$TAG
docker push $REGISTRY/$ORG/$IMAGE_NAME-frontend:latest

echo "✅ Docker images pushed successfully!"
echo "Backend: $REGISTRY/$ORG/$IMAGE_NAME-backend:$TAG"
echo "Frontend: $REGISTRY/$ORG/$IMAGE_NAME-frontend:$TAG"