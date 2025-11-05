import express from 'express';
import * as UserController from '../controllers/user.controller.js';

const router = express.Router();

// Public endpoints that do not require authentication
router.get('/mayors', UserController.listMayors);

export default router;
