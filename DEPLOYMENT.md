# CI/CD Pipeline Setup

This document describes the CI/CD pipeline setup for the PlusPlusMinus-HPMS application.

## Overview

The CI/CD pipeline includes:
- Automated testing (backend integration, performance, frontend unit tests)
- Docker containerization
- Deployment to Railway (backend) and Vercel (frontend)
- Health checks and monitoring

## GitHub Actions Workflow

The pipeline is defined in `.github/workflows/ci-cd.yml` and includes:

### Jobs
1. **Test**: Runs all tests with PostgreSQL service
2. **Build**: Builds both frontend and backend
3. **Deploy Backend**: Deploys to Railway (main branch only)
4. **Deploy Frontend**: Deploys to Vercel (main branch only)

### Triggers
- Push to `main` or `sync` branches
- Pull requests to `main` or `sync` branches

## Local Development with Docker

### Development Setup
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Setup
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Deployment Scripts

### Manual Deployment
```bash
# Deploy using deployment script
./scripts/deploy.sh

# Deploy Docker images
./scripts/docker-deploy.sh

# Health check
./scripts/health-check.sh https://your-backend-url https://your-frontend-url
```

### Vercel Setup
```bash
# Setup Vercel project
./scripts/vercel-setup.sh login
./scripts/vercel-setup.sh link

# Deploy manually
./scripts/vercel-setup.sh deploy

# Build locally
./scripts/vercel-setup.sh build
```

## Environment Configuration

### Required Secrets (GitHub Repository)
Add these to your GitHub repository secrets:

```
RAILWAY_TOKEN=your_railway_token
VERCEL_TOKEN=your_vercel_token
```

**Note**: The updated CI/CD pipeline uses Vercel CLI which only requires `VERCEL_TOKEN`. The organization and project are automatically detected from your Vercel account.

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL="https://your-backend-url/api"
```

## Docker Images

### Backend Image
- Base: Node.js 20 Alpine
- Multi-stage build for optimization
- Includes Prisma client and migrations
- Runs on port 4000

### Frontend Image
- Next.js standalone output
- Optimized for static file serving
- Runs on port 3001

## Database Setup

### Local Development
PostgreSQL runs in Docker with persistent volumes.

### Production
- Railway provides managed PostgreSQL
- Automatic migrations on deployment
- Database seeding included

## Monitoring and Health Checks

### Health Endpoints
- Backend: `GET /api/docs` (Swagger UI)
- Frontend: `GET /` (Next.js app)
- Database: `GET /api/public/mayors` (tests DB connectivity)

### Automated Health Checks
The `health-check.sh` script verifies:
- Backend responsiveness
- Frontend loading
- Database connectivity

## Deployment Platforms

### Backend: Railway
- Automatic deployments from GitHub
- Environment variable management
- Database hosting included
- Scaling and monitoring features

### Frontend: Vercel
- **Project URL**: https://vercel.com/jondickinsons-projects/plus-plus-minus-hpms
- **Organization**: jondickinsons-projects
- **Project**: plus-plus-minus-hpms
- Global CDN deployment
- Automatic HTTPS
- Preview deployments for PRs
- Analytics and monitoring

#### Vercel Configuration
The `frontend/vercel.json` file configures:
- Next.js framework detection
- Build commands and output directory
- Node.js runtime version
- Environment variables

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check Railway database URL
   railway variables

   # Test local database
   docker-compose exec postgres pg_isready
   ```

2. **Build Failures**
   ```bash
   # Check build logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **Deployment Failures**
   ```bash
   # Check Railway deployment
   railway logs

   # Check Vercel deployment
   vercel logs
   ```

### Rollback Procedures

1. **Railway Rollback**
   ```bash
   railway rollback
   ```

2. **Vercel Rollback**
   ```bash
   vercel rollback
   ```

## Security Considerations

- JWT secrets rotated regularly
- Database credentials in environment variables
- No secrets committed to repository
- Docker images scanned for vulnerabilities
- HTTPS enforced on all deployments

## Performance Optimization

- Multi-stage Docker builds
- Next.js standalone output
- Database connection pooling
- CDN for static assets
- Compression enabled