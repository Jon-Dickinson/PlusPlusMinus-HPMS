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
  return prisma.user.findMany({
    include: {
      viewers: {
        select: { id: true, firstName: true, lastName: true, username: true, role: true }
      },
      mayor: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });
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
  // If the user is a MAYOR, delete their city first to avoid foreign key constraint
  const user = await prisma.user.findUnique({ where: { id }, include: { city: true } });
  if (user && user.role === 'MAYOR' && user.city) {
    await prisma.city.delete({ where: { id: user.city.id } });
  }
  return prisma.user.delete({ where: { id } });
}
