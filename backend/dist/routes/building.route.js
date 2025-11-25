import { Router } from 'express';
import * as BuildingController from '../controllers/building.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { buildingCreateSchema, buildingUpdateSchema, } from '../validators/building.validator.js';
const router = Router();
/* ----------------------------------------------------------------------
 *  BUILDING CATEGORY ROUTES
 * ---------------------------------------------------------------------- */
// List all categories
router.get('/categories', BuildingController.getAllCategories);
// Get buildings by category/type
router.get('/type/:type', BuildingController.getBuildingsByType);
/* ----------------------------------------------------------------------
 *  BUILDING ROUTES
 * ---------------------------------------------------------------------- */
// List all buildings
router.get('/', BuildingController.getAllBuildings);
// Get building by ID
router.get('/:id', BuildingController.getBuildingById);
// Create new building
router.post('/', validate(buildingCreateSchema), BuildingController.createBuilding);
// Update building
router.put('/:id', validate(buildingUpdateSchema), BuildingController.updateBuilding);
// Delete building
router.delete('/:id', BuildingController.deleteBuilding);
export default router;
