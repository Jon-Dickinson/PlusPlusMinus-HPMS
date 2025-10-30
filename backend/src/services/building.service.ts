import { prisma } from '../db.js'

export async function listBuildingTypes() {
  return prisma.building.findMany({ include: { category: true } })
}

export async function getBuildingById(id: number) {
  return prisma.building.findUnique({ where: { id }, include: { category: true } })
}

export async function createBuilding(data: any) {
  // allow categoryName or categoryId
  let categoryId = data.categoryId
  if (!categoryId && data.categoryName) {
    let cat = await prisma.buildingCategory.findFirst({ where: { name: data.categoryName } })
    if (!cat) cat = await prisma.buildingCategory.create({ data: { name: data.categoryName, description: data.categoryDescription ?? null } })
    categoryId = cat.id
  }

  const payload: any = {
    name: data.name,
    file: data.file ?? null,
    sizeX: data.sizeX,
    sizeY: data.sizeY,
    blocks: data.blocks,
    employs: data.employs ?? null,
    houses: data.houses ?? null,
    services: data.services ?? null,
    feeds: data.feeds ?? null,
    waterUsage: data.waterUsage ?? null,
    powerUsage: data.powerUsage ?? null,
    powerOutput: data.powerOutput ?? null,
    waterOutput: data.waterOutput ?? null,
    categoryId: categoryId,
    minRoleLevel: data.minRoleLevel ?? undefined,
  }
  return prisma.building.create({ data: payload })
}

export async function updateBuilding(id: number, data: any) {
  // handle category name update
  let categoryId = data.categoryId
  if (!categoryId && data.categoryName) {
    let cat = await prisma.buildingCategory.findFirst({ where: { name: data.categoryName } })
    if (!cat) cat = await prisma.buildingCategory.create({ data: { name: data.categoryName, description: data.categoryDescription ?? null } })
    categoryId = cat.id
  }

  const payload: any = {}
  const allowed = ['name', 'file', 'sizeX', 'sizeY', 'blocks', 'employs', 'houses', 'services', 'feeds', 'waterUsage', 'powerUsage', 'powerOutput', 'waterOutput', 'minRoleLevel']
  for (const k of allowed) if (k in data) payload[k] = (data as any)[k]
  if (categoryId) payload.categoryId = categoryId
  return prisma.building.update({ where: { id }, data: payload })
}

export async function deleteBuilding(id: number) {
  return prisma.building.delete({ where: { id } })
}

export async function listCityBuildings(cityId: number) {
  return prisma.cityBuilding.findMany({ where: { cityId }, include: { building: true } })
}

export async function placeBuildingOnCity(cityId: number, buildingId: number, gx?: number | null, gy?: number | null, quantity = 1) {
  // cast to any because prisma client may need regeneration to surface new optional fields
  const data: any = { cityId, buildingId, gx: gx ?? null, gy: gy ?? null, quantity }
  return prisma.cityBuilding.create({ data: data as any })
}

export async function updateCityBuilding(id: number, data: Partial<{ gx: number; gy: number; quantity: number }>) {
  return prisma.cityBuilding.update({ where: { id }, data })
}

export async function removeCityBuilding(id: number) {
  return prisma.cityBuilding.delete({ where: { id } })
}

export default {
  listBuildingTypes,
  getBuildingById,
  listCityBuildings,
  placeBuildingOnCity,
  updateCityBuilding,
  removeCityBuilding,
}
