import express from 'express';
import * as CityController from '../controllers/city.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { cityCreateSchema, cityUpdateSchema } from '../validators/city.validator.js';
import { z } from 'zod';

const router = express.Router();

const logSchema = z.object({ action: z.string(), value: z.number().optional() });
const noteSchema = z.object({ content: z.string().min(1) });

// City-level operations
router.get('/', CityController.listCities);
router.get('/:id', CityController.getCityById);
router.post('/', validate(cityCreateSchema), CityController.createCity);
router.put('/:id', validate(cityUpdateSchema), CityController.updateCity);
router.delete('/:id', CityController.deleteCity);

// City subroutes (notes & logs)
router.get('/:id/logs', CityController.getBuildLogs);
router.post('/:id/logs', validate(logSchema), CityController.addBuildLog);
router.get('/:id/notes', CityController.getNotes);
router.post('/:id/notes', validate(noteSchema), CityController.addNote);

export default router;
