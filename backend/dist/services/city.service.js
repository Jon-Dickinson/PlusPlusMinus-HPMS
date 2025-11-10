import { prisma } from '../db.js';
export async function listCities() {
    return prisma.city.findMany({ include: { mayor: true, buildLogs: true } });
}
export async function getById(id) {
    return prisma.city.findUnique({ where: { id }, include: { mayor: true, buildLogs: true } });
}
export async function getByMayorId(userId) {
    return prisma.city.findFirst({ where: { mayorId: userId }, include: { mayor: true, buildLogs: true } });
}
export async function saveByMayorId(userId, data) {
    return prisma.city.update({ where: { mayorId: userId }, data: { buildingLog: data.buildingLog, gridState: data.gridState, qualityIndex: data.qualityIndex, updatedAt: new Date() } });
}
export async function create(data) {
    return prisma.city.create({ data });
}
export async function update(id, data) {
    return prisma.city.update({ where: { id }, data });
}
export async function remove(id) {
    return prisma.city.delete({ where: { id } });
}
export async function getBuildLogs(cityId) {
    return prisma.buildLog.findMany({ where: { cityId }, orderBy: { createdAt: 'desc' } });
}
export async function addBuildLog(cityId, data) {
    return prisma.buildLog.create({ data: { cityId, ...data } });
}
export async function getNotes(cityId) {
    // Notes are now owned by users; return notes created by the city's mayor
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city)
        return [];
    return prisma.note.findMany({ where: { userId: city.mayorId }, orderBy: { createdAt: 'desc' } });
}
export async function addNote(cityId, data) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city)
        throw new Error('City not found');
    return prisma.note.create({ data: { userId: city.mayorId, ...data } });
}
export function getCityByUserId(userId) {
    return prisma.city.findUnique({ where: { mayorId: userId } });
}
export async function saveCity(userId, data) {
    return prisma.city.update({
        where: { mayorId: userId },
        data: {
            buildingLog: data.buildingLog,
            gridState: data.gridState,
            qualityIndex: data.qualityIndex,
        },
    });
}
export async function updateCityData(cityId, userId, data) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
        throw new Error('City not found');
    }
    if (city.mayorId !== userId) {
        throw new Error('User is not the mayor of this city');
    }
    const cityUpdateData = {};
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
export async function getCityData(cityId) {
    const city = await prisma.city.findUnique({ where: { id: cityId }, select: { gridState: true, buildingLog: true, mayorId: true } });
    if (!city)
        throw new Error('City not found');
    const latestNote = await prisma.note.findFirst({ where: { userId: city.mayorId }, orderBy: { createdAt: 'desc' } });
    return {
        gridState: city.gridState,
        buildingLog: city.buildingLog,
        note: latestNote?.content || '',
    };
}
