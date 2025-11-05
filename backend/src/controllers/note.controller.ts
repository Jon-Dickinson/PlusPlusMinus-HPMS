import { Request, Response, NextFunction } from 'express';
import * as NoteService from '../services/note.service.js';
import { noteSchema } from '../validators/note.validator.js';
export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const notes = await NoteService.getNotesForUser(userId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}
export async function getUserNotes(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const notes = await NoteService.getNotesForUser(userId);
  res.json(notes);
}

export async function saveUserNotes(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const parsed = noteSchema.parse(req.body);
  const note = await NoteService.saveNoteForUser(userId, { content: parsed.content });
  res.json(note);
}
export async function saveNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const note = await NoteService.saveNoteForUser(userId, req.body);
    res.json(note);
  } catch (err) {
    next(err);
  }
}
