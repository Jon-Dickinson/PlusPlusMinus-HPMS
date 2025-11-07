import express from 'express';
import * as BuildingController from '../controllers/building.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { buildingCreateSchema, buildingUpdateSchema } from '../validators/building.validator.js';
const router = express.Router();
// CRUD for buildings and categories
router.get('/', BuildingController.getAllBuildings);
router.get('/categories', BuildingController.getAllCategories);
router.get('/type/:type', BuildingController.getBuildingsByType);
router.get('/:id', BuildingController.getBuildingById);
router.post('/', validate(buildingCreateSchema), BuildingController.createBuilding);
router.put('/:id', validate(buildingUpdateSchema), BuildingController.updateBuilding);
router.delete('/:id', BuildingController.deleteBuilding);
export default router;
