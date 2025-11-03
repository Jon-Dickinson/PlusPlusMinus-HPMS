import { prisma } from '../db.js';

export async function listCities() {
  return prisma.city.findMany({ include: { mayor: true, buildLogs: true, notes: true } });
}

export async function getById(id: number) {
  return prisma.city.findUnique({ where: { id }, include: { mayor: true, buildLogs: true, notes: true } });
}

export async function create(data: any) {
  return prisma.city.create({ data });
}

export async function update(id: number, data: any) {
  return prisma.city.update({ where: { id }, data });
}

export async function remove(id: number) {
  return prisma.city.delete({ where: { id } });
}

export async function getBuildLogs(cityId: number) {
  return prisma.buildLog.findMany({ where: { cityId }, orderBy: { createdAt: 'desc' } });
}

export async function addBuildLog(cityId: number, data: any) {
  return prisma.buildLog.create({ data: { cityId, ...data } });
}

export async function getNotes(cityId: number) {
  return prisma.note.findMany({ where: { cityId }, orderBy: { createdAt: 'desc' } });
}

export async function addNote(cityId: number, data: any) {
  return prisma.note.create({ data: { cityId, ...data } });
}
