import { prisma } from '../db.js';

export async function getNotesForUser(userId: number) {
  return prisma.note.findMany({ where: { userId } as any, orderBy: { createdAt: 'desc' } as any } as any);
}

export async function saveNoteForUser(userId: number, data: any) {
  // if id provided, update, else create
  if (data.id) {
    return prisma.note.update({ where: { id: data.id } as any, data: { content: data.content } as any } as any);
  }
  return prisma.note.create({ data: { userId, content: data.content } as any } as any);
}
