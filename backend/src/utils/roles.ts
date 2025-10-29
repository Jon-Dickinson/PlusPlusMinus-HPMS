import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export function isAdmin(roles: string[] = []) {
  return roles.includes('ADMIN');
}

// Given a structureId, find all descendant structure ids (including itself)
export async function getDescendantStructures(rootId: number) {
  const results: number[] = [];
  async function recurse(id: number) {
    results.push(id);
    const children = await prisma.structure.findMany({ where: { parentId: id }, select: { id: true } });
    for (const c of children) await recurse(c.id);
  }
  await recurse(rootId);
  return results;
}