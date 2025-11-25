import { Router } from 'express';
import * as NoteController from '../controllers/note.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRoleOrOwner } from '../utils/roles.js';
import { z } from 'zod';
const router = Router();
/* ---------------------------------------------------------
 * Validation Schema
 * --------------------------------------------------------- */
const noteSchema = z.object({
    id: z.number().optional(),
    content: z.string().min(1),
});
/* ---------------------------------------------------------
 * Routes
 * --------------------------------------------------------- */
// Public: Fetch notes for a given user
router.get('/:userId', NoteController.getNotes);
// Auth-required: Save/update a note for a given user
router.put('/:userId', authMiddleware, requireRoleOrOwner('userId', 'ADMIN'), validate(noteSchema), NoteController.saveNote);
export default router;
