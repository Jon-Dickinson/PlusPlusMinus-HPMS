import express from 'express';
import * as NoteController from '../controllers/note.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = express.Router();

const noteSchema = z.object({ id: z.number().optional(), content: z.string().min(1) });

router.get('/:userId', NoteController.getNotes);
router.put('/:userId', validate(noteSchema), NoteController.saveNote);

export default router;
