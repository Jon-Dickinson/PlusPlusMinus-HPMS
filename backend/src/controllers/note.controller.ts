import { Request, Response, NextFunction } from 'express';
import * as NoteService from '../services/note.service.js';
import { noteSchema } from '../validators/note.validator.js';

/* ======================================================================
 * Utility: Safe ID Parsing
 * ====================================================================== */
function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

/* ======================================================================
 * GET: Notes for a User
 * ====================================================================== */
export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

    const notes = await NoteService.getNotesForUser(userId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * PUT / POST: Save (create or update) a note
 * - Middleware already ensures ADMIN or owner can call this
 * ====================================================================== */
export async function saveNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

    const parsed = noteSchema.parse(req.body);

    const saved = await NoteService.saveNoteForUser(userId, {
      content: parsed.content
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
}
