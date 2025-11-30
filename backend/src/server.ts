// src/server.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler } from './middleware/error.middleware.js';

// Routes
import authRoutes from './routes/auth.route.js';
import publicRoutes from './routes/public.route.js';
import userRoutes from './routes/user.route.js';
import cityRoutes from './routes/city.route.js';
import noteRoutes from './routes/note.route.js';
import buildingRoutes from './routes/building.route.js';
import docsRoutes from './routes/docs.route.js';
import hierarchyRoutes from './routes/hierarchy.routes.js';

const app = express();

// Lightweight health endpoint used by status checks / uptime probes
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ======================================================================
 * GLOBAL MIDDLEWARE
 * ====================================================================== */

// JSON body parsing (safe limit)
app.use(express.json({ limit: '2mb' }));

// CORS whitelist
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://plus-plus-minus-hpms.vercel.app',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request logging
app.use(morgan('dev'));

/* ======================================================================
 * ROUTES
 * ====================================================================== */

// Auth (public)
app.use('/api/auth', authRoutes);

// Public read-only endpoints
app.use('/api/public', publicRoutes);

// Authenticated domains
app.use('/api/users', userRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/buildings', buildingRoutes);

// Documentation / dev tools
app.use('/api/docs', docsRoutes);

// Hierarchy system (auth inside routes)
app.use('/api/hierarchy', hierarchyRoutes);

/* ======================================================================
 * 404 Handler — Always JSON
 * ====================================================================== */

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    method: req.method,
    path: req.originalUrl,
  });
});

/* ======================================================================
 * GLOBAL ERROR HANDLER
 * ====================================================================== */

app.use(errorHandler);

export default app;
