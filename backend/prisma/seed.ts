// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureStructure(name: string, level: string, parentId?: number) {
  const existing = await prisma.structure.findFirst({ where: { name, level, parentId } });
  if (existing) return existing;
  return prisma.structure.create({ data: { name, level, parentId } });
}

async function ensureAsset(name: string, type: string, structureId: number, gx = 0, gy = 0, w = 1, h = 1, status = 'active') {
  const existing = await prisma.asset.findFirst({ where: { name, structureId } });
  if (existing) return existing;
  return prisma.asset.create({ data: { name, type, structureId, gx, gy, w, h, status } });
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Roles - role.name is unique in the schema
  const roles = [
    { name: 'ADMIN', scopeLevel: 'GLOBAL' },
    { name: 'NATIONAL', scopeLevel: 'NATIONAL' },
    { name: 'CITY', scopeLevel: 'CITY' },
    { name: 'SUBURB', scopeLevel: 'SUBURB' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  // Structures: create a small hierarchy: Country -> City -> Suburb
  const country = await ensureStructure('Countryland', 'NATIONAL');
  const city = await ensureStructure('Metropolis', 'CITY', country.id);
  const suburb = await ensureStructure('Downtown', 'SUBURB', city.id);

  // Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const cityPassword = await bcrypt.hash('City@123', 10);
  const suburbPassword = await bcrypt.hash('Suburb@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'System Admin', passwordHash: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      structureId: country.id,
    },
  });

  const cityUser = await prisma.user.upsert({
    where: { email: 'city.manager@example.com' },
    update: { name: 'City Manager', passwordHash: cityPassword },
    create: {
      name: 'City Manager',
      email: 'city.manager@example.com',
      passwordHash: cityPassword,
      structureId: city.id,
    },
  });

  const suburbUser = await prisma.user.upsert({
    where: { email: 'suburb.user@example.com' },
    update: { name: 'Suburb User', passwordHash: suburbPassword },
    create: {
      name: 'Suburb User',
      email: 'suburb.user@example.com',
      passwordHash: suburbPassword,
      structureId: suburb.id,
    },
  });

  // Link users to roles using createMany with skipDuplicates logic implemented via find
  const roleAdmin = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const roleNational = await prisma.role.findUnique({ where: { name: 'NATIONAL' } });
  const roleCity = await prisma.role.findUnique({ where: { name: 'CITY' } });
  const roleSuburb = await prisma.role.findUnique({ where: { name: 'SUBURB' } });

  // Helper to attach role if not already attached
  async function attachRole(userId: number, roleId: number) {
    const exists = await prisma.userRole.findFirst({ where: { userId, roleId } });
    if (!exists) {
      await prisma.userRole.create({ data: { userId, roleId } });
    }
  }

  if (roleAdmin) await attachRole(adminUser.id, roleAdmin.id);
  if (roleNational) await attachRole(adminUser.id, roleNational.id);
  if (roleCity) await attachRole(cityUser.id, roleCity.id);
  if (roleSuburb) await attachRole(suburbUser.id, roleSuburb.id);

  // Assets
  await ensureAsset('Central Hospital', 'hospital', city.id, 10, 10, 4, 4, 'active');
  await ensureAsset('Downtown School', 'school', suburb.id, 5, 6, 2, 2, 'active');
  await ensureAsset('City Power Plant', 'power', city.id, 2, 3, 6, 6, 'maintenance');

  console.log('✅ Seeding complete!');
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
