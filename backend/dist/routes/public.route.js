import { Router } from 'express';
import * as UserController from '../controllers/user.controller.js';
const router = Router();
/* ---------------------------------------------------------
 * PUBLIC USER ROUTES
 * --------------------------------------------------------- */
// List all users with MAYOR role (public endpoint)
router.get('/mayors', UserController.listMayors);
export default router;
