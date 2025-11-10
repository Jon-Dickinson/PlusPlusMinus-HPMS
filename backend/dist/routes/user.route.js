import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import { requireRoles } from '../utils/roles.js';
import { validate } from '../middleware/validate.middleware.js';
import { userCreateSchema, userUpdateSchema } from '../validators/user.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();
router.use(authMiddleware);
// User management
router.get('/mayors', UserController.listMayors);
router.get('/', requireRoles('ADMIN'), UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', validate(userCreateSchema), requireRoles('ADMIN'), UserController.createUser);
router.put('/:id', validate(userUpdateSchema), requireRoles('ADMIN'), UserController.updateUser);
router.delete('/:id', requireRoles('ADMIN'), UserController.deleteUser);
export default router;
