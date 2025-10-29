// prisma/seed.ts
import { PrismaClient, ResourceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ──────────────────────────────────────────────
//   ─── HELPERS ───────────────────────────────
// ──────────────────────────────────────────────

async function ensureStructure(name: string, level: string, parentId?: number) {
  const existing = await prisma.structure.findFirst({ where: { name, level, parentId } })
  if (existing) return existing
  return prisma.structure.create({ data: { name, level, parentId } })
}

async function ensureAsset(
  name: string,
  type: string,
  structureId: number,
  gx = 0,
  gy = 0,
  w = 1,
  h = 1,
  status = 'active'
) {
  const existing = await prisma.asset.findFirst({ where: { name, structureId } })
  if (existing) return existing
  return prisma.asset.create({ data: { name, type, structureId, gx, gy, w, h, status } })
}

// ──────────────────────────────────────────────
//   ─── MAIN SEED ──────────────────────────────
// ──────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seed...')

  // -----------------------
  // Roles
  // -----------------------
  const roles = [
    { name: 'ADMIN', scopeLevel: 'GLOBAL' },
    { name: 'NATIONAL', scopeLevel: 'NATIONAL' },
    { name: 'CITY', scopeLevel: 'CITY' },
    { name: 'SUBURB', scopeLevel: 'SUBURB' },
  ]
  for (const r of roles) {
    await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r })
  }

  // -----------------------
  // Structures hierarchy
  // -----------------------
  const country = await ensureStructure('Countryland', 'NATIONAL')
  const city = await ensureStructure('Metropolis', 'CITY', country.id)
  const suburb = await ensureStructure('Downtown', 'SUBURB', city.id)

  // -----------------------
  // Users
  // -----------------------
  const passwords = {
    admin: await bcrypt.hash('Admin@123', 10),
    city: await bcrypt.hash('City@123', 10),
    suburb: await bcrypt.hash('Suburb@123', 10),
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'System Admin', passwordHash: passwords.admin },
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: passwords.admin,
      structureId: country.id,
    },
  })

  const cityUser = await prisma.user.upsert({
    where: { email: 'city.manager@example.com' },
    update: { name: 'City Manager', passwordHash: passwords.city },
    create: {
      name: 'City Manager',
      email: 'city.manager@example.com',
      passwordHash: passwords.city,
      structureId: city.id,
    },
  })

  const suburbUser = await prisma.user.upsert({
    where: { email: 'suburb.user@example.com' },
    update: { name: 'Suburb User', passwordHash: passwords.suburb },
    create: {
      name: 'Suburb User',
      email: 'suburb.user@example.com',
      passwordHash: passwords.suburb,
      structureId: suburb.id,
    },
  })

  // -----------------------
  // Attach roles
  // -----------------------
  async function attachRole(userId: number, roleName: string) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) return
    const exists = await prisma.userRole.findFirst({ where: { userId, roleId: role.id } })
    if (!exists) await prisma.userRole.create({ data: { userId, roleId: role.id } })
  }
  await attachRole(adminUser.id, 'ADMIN')
  await attachRole(adminUser.id, 'NATIONAL')
  await attachRole(cityUser.id, 'CITY')
  await attachRole(suburbUser.id, 'SUBURB')

  // -----------------------
  // Assets
  // -----------------------
  await ensureAsset('Central Hospital', 'hospital', city.id, 10, 10, 4, 4, 'active')
  await ensureAsset('Downtown School', 'school', suburb.id, 5, 6, 2, 2, 'active')
  await ensureAsset('City Power Plant', 'power', city.id, 2, 3, 6, 6, 'maintenance')

  // -----------------------
  // City Builder Data
  // -----------------------
  async function ensureBuildingCategory(name: string, description?: string) {
    const existing = await prisma.buildingCategory.findFirst({ where: { name } })
    if (existing) return existing
    return prisma.buildingCategory.create({ data: { name, description } })
  }

  async function ensureBuilding(data: any) {
    const existing = await prisma.building.findFirst({ where: { name: data.name, categoryId: data.categoryId } })
    if (existing) return existing
    return prisma.building.create({ data })
  }

  async function ensureCity(name: string, population?: number) {
    const existing = await prisma.city.findFirst({ where: { name } })
    if (existing) return existing
    return prisma.city.create({ data: { name, population } })
  }

  async function ensureCityBuilding(cityId: number, buildingId: number, quantity = 1) {
    const existing = await prisma.cityBuilding.findFirst({ where: { cityId, buildingId } })
    if (existing) return existing
    return prisma.cityBuilding.create({ data: { cityId, buildingId, quantity } })
  }

  async function ensureBuildingResource(
    buildingId: number,
    type: ResourceType,
    input?: number | null,
    output?: number | null
  ) {
    const existing = await prisma.buildingResourceStat.findFirst({ where: { buildingId, type } })
    if (existing) return existing
    return prisma.buildingResourceStat.create({ data: { buildingId, type, input, output } })
  }

  // -----------------------
  // Categories
  // -----------------------
  const infra = await ensureBuildingCategory('Infrastructure', 'Power, water, offices, government')
  const services = await ensureBuildingCategory('Services', 'Emergency and marketplace')
  const industry = await ensureBuildingCategory('Industry', 'Factories and production')
  const housing = await ensureBuildingCategory('Housing', 'Residential types')
  const agriculture = await ensureBuildingCategory('Agriculture', 'Farms and food sources')

  // -----------------------
  // Buildings (from chart)
  // -----------------------
  const buildingData = [
    { name: 'Government Building', sizeX: 7, sizeY: 5, blocks: 30, employs: 100, waterUsage: 200, powerUsage: 200, categoryId: infra.id },
    { name: 'Power Station (3x3)', sizeX: 3, sizeY: 3, blocks: 9, employs: 100, waterUsage: 200, powerOutput: 1000, categoryId: infra.id },
    { name: 'Power Station (4x4)', sizeX: 4, sizeY: 4, blocks: 16, employs: 100, waterUsage: 200, powerOutput: 1500, categoryId: infra.id },
    { name: 'Marketplace', sizeX: 5, sizeY: 6, blocks: 30, employs: 100, waterUsage: 200, powerUsage: 200, categoryId: services.id },
    { name: 'Factory (4x4)', sizeX: 4, sizeY: 4, blocks: 16, employs: 100, waterUsage: 200, powerUsage: 300, categoryId: industry.id },
    { name: 'Factory (3x3)', sizeX: 3, sizeY: 3, blocks: 9, employs: 100, waterUsage: 100, powerUsage: 200, categoryId: industry.id },
    { name: 'Factory (4x4 Heavy)', sizeX: 4, sizeY: 4, blocks: 16, employs: 250, waterUsage: 200, powerUsage: 400, categoryId: industry.id },
    { name: 'Emergency Services (Large)', sizeX: 4, sizeY: 4, blocks: 16, employs: 100, services: 500, waterUsage: 100, powerUsage: 200, categoryId: services.id },
    { name: 'Emergency Services (Medium)', sizeX: 3, sizeY: 3, blocks: 9, employs: 50, services: 300, waterUsage: 100, powerUsage: 200, categoryId: services.id },
    { name: 'Emergency Services (Small)', sizeX: 2, sizeY: 2, blocks: 4, employs: 50, services: 200, waterUsage: 100, powerUsage: 100, categoryId: services.id },
    { name: 'Office', sizeX: 3, sizeY: 3, blocks: 9, employs: 100, waterUsage: 100, powerUsage: 100, categoryId: infra.id },
    { name: 'Dense Residential', sizeX: 5, sizeY: 5, blocks: 25, houses: 500, waterUsage: 500, powerUsage: 1000, categoryId: housing.id },
    { name: 'Residential (4x3)', sizeX: 4, sizeY: 3, blocks: 12, houses: 200, waterUsage: 200, powerUsage: 50, categoryId: housing.id },
    { name: 'Residential (2x4)', sizeX: 2, sizeY: 4, blocks: 8, houses: 100, waterUsage: 100, powerUsage: 100, categoryId: housing.id },
    { name: 'Residential (3x3)', sizeX: 3, sizeY: 3, blocks: 9, houses: 50, waterUsage: 100, powerUsage: 100, categoryId: housing.id },
    { name: 'Farm (Large)', sizeX: 4, sizeY: 4, blocks: 16, employs: 200, waterUsage: 300, feeds: 1000, categoryId: agriculture.id },
    { name: 'Farm (Small)', sizeX: 4, sizeY: 4, blocks: 16, employs: 100, waterUsage: 200, feeds: 500, categoryId: agriculture.id },
    { name: 'Water Pump', sizeX: 2, sizeY: 4, blocks: 8, employs: 50, waterOutput: 1000, powerUsage: 100, categoryId: infra.id },
  ]

  const createdBuildings = []
  for (const b of buildingData) {
    const record = await ensureBuilding(b)
    createdBuildings.push(record)
  }

  // -----------------------
  // City + linkage
  // -----------------------
  const seedCity = await ensureCity('Metropolis Seed', 500000)
  for (const building of createdBuildings) {
    await ensureCityBuilding(seedCity.id, building.id, 1)
  }

  // -----------------------
  // Resource stats
  // -----------------------
  for (const building of createdBuildings) {
    if (building.powerOutput)
      await ensureBuildingResource(building.id, ResourceType.POWER, 0, building.powerOutput)
    if (building.waterOutput)
      await ensureBuildingResource(building.id, ResourceType.WATER, 0, building.waterOutput)
    if (building.powerUsage)
      await ensureBuildingResource(building.id, ResourceType.POWER, building.powerUsage, 0)
    if (building.waterUsage)
      await ensureBuildingResource(building.id, ResourceType.WATER, building.waterUsage, 0)
    if (building.feeds)
      await ensureBuildingResource(building.id, ResourceType.FOOD, 0, building.feeds)
    if (building.services)
      await ensureBuildingResource(building.id, ResourceType.SERVICES, 0, building.services)
    if (building.houses)
      await ensureBuildingResource(building.id, ResourceType.HOUSING, 0, building.houses)
    if (building.employs)
      await ensureBuildingResource(building.id, ResourceType.EMPLOYMENT, 0, building.employs)
  }

  console.log('✅ Seeding complete with full city-builder dataset!')
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
