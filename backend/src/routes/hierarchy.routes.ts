import { Router } from 'express';
import * as HierarchyController from '../controllers/hierarchy.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Test endpoint without auth to verify deployment
router.get('/test', (req, res) => {
  res.json({ message: 'Hierarchy routes are working!', timestamp: new Date().toISOString() });
});

// Apply authentication to all hierarchy routes
router.use(requireAuth);

// Get hierarchy tree structure
router.get('/tree', HierarchyController.getHierarchyTree);

// Get subordinate users for a given user
router.get('/users/subordinates/:userId', HierarchyController.getUserSubordinates);

// Get allowed buildings for a user
router.get('/buildings/allowed/:userId', HierarchyController.getAllowedBuildings);

export default router;