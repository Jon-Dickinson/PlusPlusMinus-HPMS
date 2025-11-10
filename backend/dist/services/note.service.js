import { prisma } from '../db.js';
export async function getNotesForUser(userId) {
    return prisma.note.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
export async function saveNoteForUser(userId, data) {
    // if id provided, update, else create
    if (data.id) {
        return prisma.note.update({ where: { id: data.id }, data: { content: data.content } });
    }
    return prisma.note.create({ data: { userId, content: data.content } });
}
