import { prisma } from '../db.js';

export async function listCities() {
  return prisma.city.findMany({ include: { mayor: true, buildLogs: true } as any } as any);
}

export async function getById(id: number) {
  return prisma.city.findUnique({ where: { id }, include: { mayor: true, buildLogs: true } as any } as any);
}

export async function getByMayorId(userId: number) {
  return prisma.city.findFirst({ where: { mayorId: userId } as any, include: { mayor: true, buildLogs: true } as any } as any);
}

export async function saveByMayorId(userId: number, data: any) {
  return prisma.city.update({ where: { mayorId: userId } as any, data: { buildingLog: data.buildingLog, gridState: data.gridState, qualityIndex: data.qualityIndex, updatedAt: new Date() } as any } as any);
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
  // Notes are now owned by users; return notes created by the city's mayor
  const city = await prisma.city.findUnique({ where: { id: cityId } as any });
  if (!city) return [];
  return prisma.note.findMany({ where: { userId: city.mayorId }, orderBy: { createdAt: 'desc' } as any } as any);
}

export async function addNote(cityId: number, data: any) {
  const city = await prisma.city.findUnique({ where: { id: cityId } as any });
  if (!city) throw new Error('City not found');
  return prisma.note.create({ data: { userId: city.mayorId, ...data } as any });
}
export function getCityByUserId(userId: number) {
  return prisma.city.findUnique({ where: { mayorId: userId } });
}

export async function saveCity(userId: number, data: {
  buildingLog: string[]; gridState: any; qualityIndex: number;
}) {
  return prisma.city.update({
    where: { mayorId: userId },
    data: {
      buildingLog: data.buildingLog,
      gridState: data.gridState,
      qualityIndex: data.qualityIndex,
    },
  });
}

export async function updateCityData(cityId: number, userId: number, data: {
  gridState?: any;
  buildingLog?: any;
  note?: string;
  qualityIndex?: number;
}) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });

  if (!city) {
    throw new Error('City not found');
  }

  if (city.mayorId !== userId) {
    throw new Error('User is not the mayor of this city');
  }

  const cityUpdateData: { gridState?: any, buildingLog?: any, qualityIndex?: number } = {};
  if (data.gridState) {
    cityUpdateData.gridState = data.gridState;
  }
  if (data.buildingLog) {
    cityUpdateData.buildingLog = data.buildingLog;
  }
  if (data.qualityIndex !== undefined) {
    cityUpdateData.qualityIndex = data.qualityIndex;
  }

  const updatePromises = [];

  if (Object.keys(cityUpdateData).length > 0) {
    updatePromises.push(prisma.city.update({
      where: { id: cityId },
      data: cityUpdateData,
    }));
  }

  if (data.note) {
    updatePromises.push(prisma.note.create({
      data: {
        userId: userId,
        content: data.note,
      },
    }));
  }

  const [updatedCity, ..._] = await Promise.all(updatePromises);

  return updatedCity;
}