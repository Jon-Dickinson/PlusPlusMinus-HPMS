import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import { requireRoles } from '../utils/roles.js';
import { validate } from '../middleware/validate.middleware.js';
import { userCreateSchema, userUpdateSchema, } from '../validators/user.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireHierarchyWriteAccess } from '../middleware/hierarchy-auth.middleware.js';
const router = express.Router();
/* ==================================================================
 * GLOBAL AUTH — all user routes require a logged-in user
 * ================================================================== */
router.use(authMiddleware);
/* ==================================================================
 * PUBLIC-LIKE ROUTES (still require auth but no special role)
 * ================================================================== */
// List all mayors (used frequently by frontend)
router.get('/mayors', UserController.listMayors);
/* ==================================================================
 * ADMIN ROUTES (restricted)
 * ================================================================== */
// Get all users — ADMIN only
router.get('/', requireRoles('ADMIN'), UserController.getAllUsers);
// Create a new user — ADMIN only
router.post('/', requireRoles('ADMIN'), validate(userCreateSchema), UserController.createUser);
/* ==================================================================
 * INDIVIDUAL USER ROUTES
 * ================================================================== */
// Admin: list audits for a given user
router.get('/:id/audits', requireRoles('ADMIN'), UserController.getUserAudits);
// Get a single user (self or admin or ancestor — allowed via controller logic)
router.get('/:id', UserController.getUserById);
// Update a user — ADMIN only
router.put('/:id', requireRoles('ADMIN'), validate(userUpdateSchema), UserController.updateUser);
// Update a user's building permissions — ADMIN or ancestor of target
router.put('/:id/permissions', requireHierarchyWriteAccess, UserController.updateUserPermissions);
// Delete a user — ADMIN only
router.delete('/:id', requireRoles('ADMIN'), UserController.deleteUser);
export default router;
