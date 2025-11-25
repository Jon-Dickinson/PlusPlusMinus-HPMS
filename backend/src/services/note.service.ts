import { prisma } from '../db.js';

export interface SaveNoteInput {
  id?: number;
  content: string;
}

/* -------------------------------------------
 * Get all notes for a user (descending order)
 * ------------------------------------------- */
export async function getNotesForUser(userId: number) {
  return prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/* -------------------------------------------
 * Save (Create or Update) a note
 * ------------------------------------------- */
export async function saveNoteForUser(userId: number, data: SaveNoteInput) {
  if (data.id) {
    // Update existing note
    return prisma.note.update({
      where: { id: data.id },
      data: { content: data.content },
    });
  }

  // Create new note
  return prisma.note.create({
    data: {
      userId,
      content: data.content,
    },
  });
}
