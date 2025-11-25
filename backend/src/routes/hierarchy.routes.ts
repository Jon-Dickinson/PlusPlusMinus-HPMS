import { Router } from 'express';
import * as HierarchyController from '../controllers/hierarchy.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import requireHierarchyReadAccess from '../middleware/hierarchy-auth.middleware.js';

const router = Router();

/* ==================================================================
 * PUBLIC DEBUG ROUTES
 * ================================================================== */

// Deployment verification route
router.get('/test', (req, res) => {
  res.json({
    message: 'Hierarchy routes are working!',
    timestamp: new Date().toISOString(),
  });
});

// Temporary debugging endpoint — public on purpose
router.get('/tree', HierarchyController.getHierarchyTree);

/* ==================================================================
 * AUTH-PROTECTED ROUTES
 * ================================================================== */

router.use(requireAuth);

/* -----------------------------------------------------------
 * USER-SUBORDINATE ACCESS
 * ----------------------------------------------------------- */
router.get(
  '/users/subordinates/:userId',
  requireHierarchyReadAccess,
  HierarchyController.getUserSubordinates
);

/* -----------------------------------------------------------
 * EFFECTIVE PERMISSIONS
 * ----------------------------------------------------------- */
router.get(
  '/users/:userId/effective-permissions',
  requireHierarchyReadAccess,
  HierarchyController.getEffectivePermissions
);

/* -----------------------------------------------------------
 * ALLOWED BUILDINGS
 * ----------------------------------------------------------- */
router.get(
  '/buildings/allowed/:userId',
  requireHierarchyReadAccess,
  HierarchyController.getAllowedBuildings
);

export default router;
