#!/usr/bin/env node
import 'dotenv/config';
import { seedLargeDataset } from '../tests/utils/seedLargeDataset.js';
import { prisma } from '../src/db.js';

(async function main() {
  try {
    const count = Number(process.env.SEED_COUNT) || 200; // default to 200 to keep runs reasonable
    const start = Date.now();
    console.log(`Starting large dataset seed (count=${count})`);

    // Remove any prior seed artifacts to avoid unique-key collisions when
    // re-running the same seeder in a development DB.
    const existing = await prisma.user.findMany({ where: { username: { startsWith: 'seed-mayor-' } }, select: { id: true } });
    if (existing.length > 0) {
      console.log(`Found ${existing.length} previous seeded mayors — cleaning up related data first.`);
      const mayorIds = existing.map(m => m.id);

      // Find cities for those mayors
      const cities = await prisma.city.findMany({ where: { mayorId: { in: mayorIds } }, select: { id: true } });
      const cityIds = cities.map(c => c.id);

      if (cityIds.length > 0) {
        // Delete building resources for buildings in these cities
        const buildings = await prisma.building.findMany({ where: { cityId: { in: cityIds } }, select: { id: true } });
        const buildingIds = buildings.map(b => b.id);
        if (buildingIds.length > 0) {
          await prisma.buildingResource.deleteMany({ where: { buildingId: { in: buildingIds } } });
        }

        // Delete buildings
        await prisma.building.deleteMany({ where: { cityId: { in: cityIds } } });

        // Delete build logs
        await prisma.buildLog.deleteMany({ where: { cityId: { in: cityIds } } });

        // Delete cities
        await prisma.city.deleteMany({ where: { id: { in: cityIds } } });
      }

      // Finally delete the users
      await prisma.user.deleteMany({ where: { id: { in: mayorIds } } });

      console.log('Cleanup complete — proceeding with seeding.');
    }
    await seedLargeDataset(count);
    const delta = (Date.now() - start) / 1000;
    console.log(`Seeding finished in ${delta.toFixed(1)}s`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
