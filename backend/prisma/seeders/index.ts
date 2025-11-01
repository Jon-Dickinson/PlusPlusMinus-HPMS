import { PrismaClient } from '@prisma/client';
import buildingJson from '../data/buildings.json' assert { type: 'json' };
import { seedCategories } from './categories.js';
import { seedBuildings } from './buildings.js';
import { asNumber } from './utils.js';

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting modular seed...');

  // Roles (idempotent)
  const roleNames = ['ADMIN', 'CITY', 'GUEST'];
  for (const name of roleNames) {
    const scopeLevel = name === 'ADMIN' ? 'NATIONAL' : name === 'CITY' ? 'CITY' : 'SUBURB';
    await prisma.role
      .upsert({
        where: { name },
        update: {},
        create: { name, scopeLevel },
      })
      .catch(() => {});
  }

  // Structures and assets might exist already in the monolithic seed; keep minimal compatibility
  // (No-op if already present)

  // Categories
  const categoryMap = await seedCategories(prisma, buildingJson as any[]);

  // Buildings
  const buildings = await seedBuildings(
    prisma,
    buildingJson as any[],
    categoryMap as Record<string, any>,
  );

  // Create a seed city if not exists
  let city = await prisma.city.findFirst({ where: { name: 'Seed City' } });
  if (!city) {
    city = await prisma.city.create({ data: { name: 'Seed City' } });
  }

  // Place first building for demo, if none exists
  const existingPlacement = await prisma.cityBuilding.findFirst({ where: { cityId: city.id } });
  if (!existingPlacement && buildings.length > 0) {
    const b = buildings[0];
    await prisma.cityBuilding.create({
      data: { cityId: city.id, buildingId: b.id, gx: 5, gy: 5 },
    });
  }

  console.log('✅ Modular seeding complete');
}

seed()
  .catch((err) => {
    console.error('Seed failed', err);
    (globalThis as any).process?.exit?.(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seed;
