import { Router } from 'express';
import * as HierarchyController from '../controllers/hierarchy.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
const router = Router();
// Test endpoint without auth to verify deployment
router.get('/test', (req, res) => {
    res.json({ message: 'Hierarchy routes are working!', timestamp: new Date().toISOString() });
});
// Temporary: Make tree endpoint public for debugging
router.get('/tree', HierarchyController.getHierarchyTree);
// Apply authentication to other hierarchy routes
router.use(requireAuth);
// Get subordinate users for a given user
router.get('/users/subordinates/:userId', HierarchyController.getUserSubordinates);
// Get subordinate users for a given user
router.get('/users/subordinates/:userId', HierarchyController.getUserSubordinates);
// Get allowed buildings for a user
router.get('/buildings/allowed/:userId', HierarchyController.getAllowedBuildings);
export default router;
