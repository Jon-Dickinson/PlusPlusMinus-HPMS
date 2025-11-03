import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { userCreateSchema, userUpdateSchema } from '../validators/user.validator.js';

const router = express.Router();

// User management
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', validate(userCreateSchema), UserController.createUser);
router.put('/:id', validate(userUpdateSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
