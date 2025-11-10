// src/server.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import publicRoutes from "./routes/public.route.js";
import userRoutes from "./routes/user.route.js";
import cityRoutes from "./routes/city.route.js";
import noteRoutes from "./routes/note.route.js";
import buildingRoutes from "./routes/building.route.js";
import docsRoutes from "./routes/docs.route.js";
import hierarchyRoutes from "./routes/hierarchy.routes.js";
const app = express();
app.use(express.json());
// Configure CORS to allow frontend domain
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://plus-plus-minus-hpms.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(morgan('dev'));
// routes
app.use('/api/auth', authRoutes);
// public endpoints (no auth required)
app.use('/api/public', publicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
// global error handler
app.use(errorHandler);
export default app;
