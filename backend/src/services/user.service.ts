import { prisma } from '../db.js';

export function listMayors() {
  return prisma.user.findMany({
    where: { role: 'MAYOR' },
    select: {
      id: true, firstName: true, lastName: true, role: true,
      city: { select: { name: true, country: true, qualityIndex: true } },
      notes: { select: { id: true }, take: 1 },
    },
    orderBy: { id: 'asc' },
  });
}

export async function getAll() {
  // Return only mayors with their city summary for admin user list
  return prisma.user.findMany({ where: { role: 'MAYOR' } as any, select: { id: true, firstName: true, lastName: true, username: true, role: true, createdAt: true, updatedAt: true, city: { select: { id: true, name: true, qualityIndex: true } } as any } as any });
}

export async function getById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      city: true,
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function create(data: any) {
  // Note: password hashing should be handled by auth service for registrations; this create is intended for admin user creation
  return prisma.user.create({ data });
}

export async function update(id: number, data: any) {
  return prisma.user.update({ where: { id }, data });
}

export async function remove(id: number) {
  return prisma.user.delete({ where: { id } });
}
