// src/server.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import cityRoutes from "./routes/city.route.js";
import buildingRoutes from "./routes/building.route.js";
import docsRoutes from "./routes/docs.route.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/docs', docsRoutes);

// global error handler
app.use(errorHandler);

export default app;
