// backend/src/index.ts

import express from 'express';
import 'dotenv/config';
import { prisma } from './db.js'; // FIX: Added .js extension
import authRouter from './routes/auth.route.js'; // FIX: Added .js extension
import userRouter from './routes/user.route.js'; // FIX: Added .js extension

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

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
app.use('/auth', authRouter);

// 4. Mount User Management Routes
app.use('/users', userRouter);


// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`DB Status Check: http://localhost:${port}/db-status`);
});