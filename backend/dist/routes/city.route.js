import express from 'express';
import * as CityController from '../controllers/city.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRoleOrOwner } from '../utils/roles.js';
import { cityCreateSchema, cityUpdateSchema, updateCityDataSchema } from '../validators/city.validator.js';
import { z } from 'zod';
const router = express.Router();
const logSchema = z.object({ action: z.string(), value: z.number().optional() });
const noteSchema = z.object({ content: z.string().min(1) });
// City-level operations
router.get('/', CityController.listCities);
router.get('/:id', CityController.getCityById);
router.post('/', validate(cityCreateSchema), CityController.createCity);
router.put('/:id', validate(cityUpdateSchema), CityController.updateCity);
router.put('/:id/data', authMiddleware, validate(updateCityDataSchema), CityController.updateCityData);
router.get('/:id/data', CityController.getCityData);
router.delete('/:id', CityController.deleteCity);
// City subroutes (notes & logs)
router.get('/:id/logs', CityController.getBuildLogs);
router.post('/:id/logs', validate(logSchema), CityController.addBuildLog);
router.get('/:id/notes', authMiddleware, CityController.getNotes);
router.post('/:id/notes', authMiddleware, validate(noteSchema), CityController.addNote);
// User-based city endpoints (frontend expects /api/city/:userId)
router.get('/user/:userId', CityController.getCityByUserId);
// require auth and allow ADMIN or the owner (userId) to save
router.put('/user/:userId/save', authMiddleware, requireRoleOrOwner('userId', 'ADMIN'), CityController.saveCityByUserId);
export default router;
