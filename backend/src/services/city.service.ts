import { prisma } from '../db.js';
import { Prisma } from '@prisma/client';

/* -------------------------------------------------------
 * Types
 * ------------------------------------------------------- */

export interface SaveCityInput {
  buildingLog: string[];
  gridState: unknown;
  qualityIndex: number;
}

export interface UpdateCityDataInput {
  gridState?: unknown;
  buildingLog?: unknown;
  note?: string;
  qualityIndex?: number;
}

/* -------------------------------------------------------
 * City Queries
 * ------------------------------------------------------- */

export async function listCities() {
  return prisma.city.findMany({
    include: {
      mayor: true,
      buildLogs: true,
    },
  });
}

export async function getById(id: number) {
  return prisma.city.findUnique({
    where: { id },
    include: {
      mayor: true,
      buildLogs: true,
    },
  });
}

export async function getByMayorId(userId: number) {
  return prisma.city.findFirst({
    where: { mayorId: userId },
    include: {
      mayor: true,
      buildLogs: true,
    },
  });
}

/* -------------------------------------------------------
 * City Updating (Save)
 * ------------------------------------------------------- */

export async function saveByMayorId(userId: number, data: SaveCityInput) {
  return prisma.city.update({
    where: { mayorId: userId },
    data: {
      buildingLog: data.buildingLog,
      gridState: data.gridState as Prisma.InputJsonValue,
      qualityIndex: data.qualityIndex,
      updatedAt: new Date(),
    },
  });
}

/* -------------------------------------------------------
 * CRUD
 * ------------------------------------------------------- */

export async function create(data: any) {
  return prisma.city.create({ data });
}

export async function update(id: number, data: any) {
  return prisma.city.update({
    where: { id },
    data,
  });
}

export async function remove(id: number) {
  return prisma.city.delete({ where: { id } });
}

/* -------------------------------------------------------
 * Build Logs
 * ------------------------------------------------------- */

export async function getBuildLogs(cityId: number) {
  return prisma.buildLog.findMany({
    where: { cityId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addBuildLog(cityId: number, data: any) {
  return prisma.buildLog.create({
    data: {
      cityId,
      ...data,
    },
  });
}

/* -------------------------------------------------------
 * Notes (Owned by mayor)
 * ------------------------------------------------------- */

export async function getNotes(cityId: number) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { mayorId: true },
  });

  if (!city) return [];

  return prisma.note.findMany({
    where: { userId: city.mayorId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addNote(cityId: number, data: { content: string }) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { mayorId: true },
  });

  if (!city) throw new Error('City not found');

  return prisma.note.create({
    data: {
      userId: city.mayorId,
      content: data.content,
    },
  });
}

/* -------------------------------------------------------
 * Helper Query
 * ------------------------------------------------------- */

export function getCityByUserId(userId: number) {
  return prisma.city.findUnique({
    where: { mayorId: userId },
  });
}

/* -------------------------------------------------------
 * Save City (Grid + Log + Index)
 * ------------------------------------------------------- */

export async function saveCity(userId: number, data: SaveCityInput) {
  return prisma.city.update({
    where: { mayorId: userId },
    data: {
      buildingLog: data.buildingLog,
      gridState: data.gridState as Prisma.InputJsonValue,
      qualityIndex: data.qualityIndex,
    },
  });
}

/* -------------------------------------------------------
 * updateCityData — Upsert new grid, log, quality, and notes
 * ------------------------------------------------------- */

export async function updateCityData(
  cityId: number,
  userId: number,
  data: UpdateCityDataInput
) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });

  if (!city) throw new Error('City not found');
  if (city.mayorId !== userId)
    throw new Error('User is not the mayor of this city');

  const cityChanges: Record<string, unknown> = {};

  if (data.gridState !== undefined) cityChanges.gridState = data.gridState;
  if (data.buildingLog !== undefined) cityChanges.buildingLog = data.buildingLog;
  if (data.qualityIndex !== undefined)
    cityChanges.qualityIndex = data.qualityIndex;

  const ops: Promise<any>[] = [];

  if (Object.keys(cityChanges).length > 0) {
    ops.push(
      prisma.city.update({
        where: { id: cityId },
        data: cityChanges,
      })
    );
  }

  if (data.note) {
    ops.push(
      prisma.note.create({
        data: {
          userId,
          content: data.note,
        },
      })
    );
  }

  const [updatedCity] = await Promise.all(ops);

  return updatedCity;
}

/* -------------------------------------------------------
 * getCityData — Return parsed grid + logs + latest mayor note
 * ------------------------------------------------------- */

export async function getCityData(cityId: number) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: {
      gridState: true,
      buildingLog: true,
      mayorId: true,
    },
  });

  if (!city) throw new Error('City not found');

  const latestNote = await prisma.note.findFirst({
    where: { userId: city.mayorId },
    orderBy: { createdAt: 'desc' },
  });

  // Safe JSON parsing
  const parseJSON = (value: unknown, fallback: any[] = []) => {
    if (typeof value !== 'string') return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  return {
    gridState: parseJSON(city.gridState),
    buildingLog: parseJSON(city.buildingLog),
    note: latestNote?.content || '',
  };
}
