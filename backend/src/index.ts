// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { prisma } from './db.js'; // FIX: Added .js extension
import authRoutes from './routes/auth.route.js'; // FIX: Added .js extension
import userRoutes from './routes/user.route.js'; // FIX: Added .js extension
import buildingRoutes from './routes/building.route.js'
import docsRoutes from './routes/docs.route.js'
import cityRoutes from './routes/city.route.js'
import { verifyToken } from './middleware/auth.middleware.js';
import errorHandler from './middleware/error.middleware.js'
import requestIdMiddleware from './middleware/requestId.middleware.js'

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
// Allow frontend dev server origin for local development
app.use(cors({ origin: ['http://localhost:3001'], credentials: true }));
// attach request id early
app.use(requestIdMiddleware)

// Simple request logger to help debug 404s and routing during development
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('[req]', req.method, req.originalUrl)
  next()
})

// --- ROUTES ---

// 1. Root Status
app.get('/', (req, res) => {
    res.send('Infra-RBAC API Initialized!');
});

// 2. Database Connection Test Route
// This route attempts a simple Prisma operation to verify connection to Neon DB.
app.get('/db-status', async (req, res) => {
  try {
    // Attempt a simple read operation (count all users)
    // This assumes you have a 'User' model in prisma/schema.prisma
    // NOTE: This will fail if the User model doesn't exist yet, but will confirm connection.
    const userCount = await prisma.user.count();
    res.status(200).json({
      status: 'OK',
      message: 'Successfully connected to Neon PostgreSQL database.',
      details: `Found ${userCount} existing user records.`,
      database: process.env.DATABASE_URL?.split('@')[1] // Display connection info
    });
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Database connection FAILED. Please check your DATABASE_URL in the .env file and ensure the Neon service is running.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 3. Mount Authentication Routes
app.use('/auth', authRoutes);

// 4. Mount User Management Routes (protected)
app.use('/users', verifyToken, userRoutes);

// 5. Building routes (public master data + protected city placement endpoints)
app.use('/buildings', buildingRoutes);

// 6. City placement API (alternative path used by frontend)
app.use('/api/cities', cityRoutes)

// Swagger UI docs
app.use('/docs', docsRoutes)

// 5. Protect assets
app.use('/assets', verifyToken, express.static('assets'));

// Global error handler (should be last middleware)
app.use(errorHandler)


// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`DB Status Check: http://localhost:${port}/db-status`);
});