import { Router } from 'express';
import * as CityController from '../controllers/city.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRoleOrOwner } from '../utils/roles.js';
import {
  cityCreateSchema,
  cityUpdateSchema,
  updateCityDataSchema,
} from '../validators/city.validator.js';

import { z } from 'zod';

const router = Router();

/* ------------------------------------------------------------------
 *  Inline Schemas (for build logs & notes)
 * ------------------------------------------------------------------ */
const logSchema = z.object({
  action: z.string(),
  value: z.number().optional(),
});

const noteSchema = z.object({
  content: z.string().min(1),
});

/* ==================================================================
 *  CITY CRUD ROUTES
 * ================================================================== */

// List all cities
router.get('/', CityController.listCities);

// Create a new city
router.post('/', validate(cityCreateSchema), CityController.createCity);

// Get a single city
router.get('/:id', CityController.getCityById);

// Update city metadata
router.put('/:id', validate(cityUpdateSchema), CityController.updateCity);

// Delete city
router.delete('/:id', CityController.deleteCity);

/* ==================================================================
 *  CITY DATA (GRID + LOGS + QUALITY INDEX)
 * ================================================================== */

// Get city data (gridState + buildingLog + latest note)
router.get('/:id/data', CityController.getCityData);

// Update city data — requires auth
router.put(
  '/:id/data',
  authMiddleware,
  validate(updateCityDataSchema),
  CityController.updateCityData
);

/* ==================================================================
 *  CITY BUILD LOGS
 * ================================================================== */

// Retrieve build logs
router.get('/:id/logs', CityController.getBuildLogs);

// Append new build log entry
router.post('/:id/logs', validate(logSchema), CityController.addBuildLog);

/* ==================================================================
 *  CITY NOTES (Owned by MAYOR)
 * ================================================================== */

// List notes for this city's mayor
router.get('/:id/notes', authMiddleware, CityController.getNotes);

// Add a new note
router.post(
  '/:id/notes',
  authMiddleware,
  validate(noteSchema),
  CityController.addNote
);

/* ==================================================================
 *  USER-BASED CITY ENDPOINTS (frontend depends on these)
 * ================================================================== */

// Get city by user ID
router.get('/user/:userId', CityController.getCityByUserId);

// Save city by user ID (ADMIN or owner only)
router.put(
  '/user/:userId/save',
  authMiddleware,
  requireRoleOrOwner('userId', 'ADMIN'),
  CityController.saveCityByUserId
);

export default router;
