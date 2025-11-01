import express from 'express';
import * as controller from '../controllers/building.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  buildingCreateSchema,
  buildingUpdateSchema,
  cityPlacementCreateSchema,
} from '../validators/building.validator.js';

const router = express.Router();

// Public: list building types
router.get('/', controller.listBuildingTypes);
// Public: single building
router.get('/:id', controller.getBuilding);

// Admin-only master data endpoints
router.post(
  '/',
  verifyToken,
  requireRole(['ADMIN']),
  validateBody(buildingCreateSchema),
  controller.createBuilding,
);
router.patch(
  '/:id',
  verifyToken,
  requireRole(['ADMIN']),
  validateBody(buildingUpdateSchema),
  controller.updateBuilding,
);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), controller.removeBuilding);

// City-specific placements (protected)
router.get('/cities/:cityId', verifyToken, controller.listCityBuildings);
router.post(
  '/cities/:cityId',
  verifyToken,
  requireRole(['CITY', 'NATIONAL', 'ADMIN']),
  validateBody(cityPlacementCreateSchema),
  controller.createCityBuilding,
);
router.patch(
  '/cities/:cityId/:id',
  verifyToken,
  requireRole(['CITY', 'NATIONAL', 'ADMIN']),
  validateBody(cityPlacementCreateSchema),
  controller.patchCityBuilding,
);
router.delete(
  '/cities/:cityId/:id',
  verifyToken,
  requireRole(['CITY', 'NATIONAL', 'ADMIN']),
  controller.deleteCityBuilding,
);

export default router;
