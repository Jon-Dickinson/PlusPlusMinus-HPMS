import { prisma } from '../db.js';

export async function getAll() {
  return prisma.user.findMany({ select: { password: false, id: true, firstName: true, lastName: true, email: true, role: true, nationality: true, homeCity: true, createdAt: true, updatedAt: true } as any });
}

export async function getById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: { password: false, id: true, firstName: true, lastName: true, email: true, role: true, nationality: true, homeCity: true, createdAt: true, updatedAt: true } as any });
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
