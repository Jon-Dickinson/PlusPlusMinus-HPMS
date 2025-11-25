import { Router } from 'express';
import * as HierarchyController from '../controllers/hierarchy.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import requireHierarchyReadAccess from '../middleware/hierarchy-auth.middleware.js';
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
router.get('/users/subordinates/:userId', requireHierarchyReadAccess, HierarchyController.getUserSubordinates);
// Get effective permissions for a user (considers direct + ancestor permissions)
router.get('/users/:userId/effective-permissions', requireHierarchyReadAccess, HierarchyController.getEffectivePermissions);
// Get allowed buildings for a user (only accessible by admin/owner/ancestor)
router.get('/buildings/allowed/:userId', requireHierarchyReadAccess, HierarchyController.getAllowedBuildings);
export default router;
