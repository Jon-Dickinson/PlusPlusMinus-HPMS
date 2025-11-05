import express from 'express';
import * as NoteController from '../controllers/note.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRoleOrOwner } from '../utils/roles.js';

const router = express.Router();

const noteSchema = z.object({ id: z.number().optional(), content: z.string().min(1) });

router.get('/:userId', NoteController.getNotes);
// require auth and allow ADMIN or the owner (userId)
router.put('/:userId', authMiddleware, requireRoleOrOwner('userId', 'ADMIN'), validate(noteSchema), NoteController.saveNote);

export default router;
