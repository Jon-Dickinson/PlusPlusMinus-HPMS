// routes/auth.route.ts
import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
const router = Router();
/* ---------------------------------------------------------
 * AUTH ROUTES
 * --------------------------------------------------------- */
// Register new user (validated payload)
router.post('/register', validate(registerSchema), AuthController.register);
// Login (validated payload)
router.post('/login', validate(loginSchema), AuthController.login);
export default router;
