import { prisma } from '../../src/db.js';

/**
 * Seed a large dataset for testing performance and UI behavior.
 * Creates:
 *  - N mayor users
 *  - N cities
 *  - ~2N buildings
 *  - building categories
 *  - random building resources
 *  - optional build logs
 */
export async function seedLargeDataset(cityCount = 1000) {
  console.log(`🌱 Seeding ${cityCount} mayors, cities, and related data...\n`);

  /** -----------------------------
   *  1. CREATE MAYOR USERS
   * ----------------------------- */
  console.log('➡ Creating mayor users…');

  const mayorUsers = Array.from({ length: cityCount }).map((_, i) => ({
    firstName: `Mayor-${i}`,
    lastName: 'Seed',
    username: `seed-mayor-${i}`,
    email: `seed-mayor-${i}@test.local`,
    password: `seed-pass-${i}`, // not hashed (dataset only)
    role: 'MAYOR' as const,
  }));

  await prisma.user.createMany({ data: mayorUsers });

  const createdMayors = await prisma.user.findMany({
    where: { username: { startsWith: 'seed-mayor-' } },
    take: cityCount,
  });

  console.log(`✔ Created ${createdMayors.length} mayor users`);


  /** -----------------------------
   *  2. CREATE CITIES
   * ----------------------------- */
  console.log('\n➡ Creating cities…');

  const cities = createdMayors.map((mayor, i) => ({
    name: `City-${i}`,
    country: 'Testland',
    qualityIndex: Math.random() * 100,
    mayorId: mayor.id,
  }));

  await prisma.city.createMany({ data: cities });

  const createdCities = await prisma.city.findMany({
    where: { name: { startsWith: 'City-' } },
    take: cityCount,
  });

  console.log(`✔ Created ${createdCities.length} cities`);


  /** -----------------------------
   *  3. CREATE BUILDING CATEGORIES
   * ----------------------------- */
  console.log('\n➡ Creating building categories…');

  const categoryNames = ['Residential', 'Commercial', 'Industrial', 'Utility'];

  await Promise.all(
    categoryNames.map((name) =>
      prisma.buildingCategory.upsert({
        where: { name },
        update: {},
        create: { name, description: `${name} buildings` },
      })
    )
  );

  const categories = await prisma.buildingCategory.findMany();

  console.log(`✔ Created ${categories.length} categories`);


  /** -----------------------------
   *  4. CREATE BUILDINGS (batched)
   * ----------------------------- */
  const buildingsPerCity = 2;
  const totalBuildings = cityCount * buildingsPerCity;
  console.log(`\n➡ Creating ~${totalBuildings} buildings…`);

  const buildingBatch: any[] = [];

  for (const city of createdCities) {
    for (let j = 0; j < buildingsPerCity; j++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      buildingBatch.push({
        cityId: city.id,
        name: `Building-${city.id}-${j}`,
        categoryId: category.id,
        level: Math.floor(Math.random() * 5) + 1,
        sizeX: Math.floor(Math.random() * 3) + 1,
        sizeY: Math.floor(Math.random() * 3) + 1,
        powerUsage: Math.floor(Math.random() * 100),
        powerOutput: Math.floor(Math.random() * 200),
        waterUsage: Math.floor(Math.random() * 50),
        waterOutput: Math.floor(Math.random() * 100),
      });
    }
  }

  const CHUNK = 500;
  for (let i = 0; i < buildingBatch.length; i += CHUNK) {
    const chunk = buildingBatch.slice(i, i + CHUNK);
    await prisma.building.createMany({ data: chunk });
    console.log(`  ✔ Buildings ${i} → ${i + chunk.length}`);
  }


  /** -----------------------------
   *  5. CREATE BUILDING RESOURCES
   * ----------------------------- */
  console.log(`\n➡ Creating random building resources…`);

  const sampleBuildings = await prisma.building.findMany({
    where: { name: { startsWith: 'Building-' } },
    take: Math.min(1000, totalBuildings),
  });

  const resourceTypes = [
    'steel',
    'wood',
    'concrete',
    'energy',
    'water',
    'food',
  ];

  const resourceBatch: any[] = [];
  for (const building of sampleBuildings) {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < count; k++) {
      resourceBatch.push({
        buildingId: building.id,
        type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
        amount: Math.floor(Math.random() * 1000) + 10,
      });
    }
  }

  for (let i = 0; i < resourceBatch.length; i += CHUNK) {
    const chunk = resourceBatch.slice(i, i + CHUNK);
    await prisma.buildingResource.createMany({ data: chunk });
  }

  console.log(`✔ Created ${resourceBatch.length} building resources`);


  /** -----------------------------
   *  6. CREATE BUILD LOGS
   * ----------------------------- */
  console.log('\n➡ Creating build logs…');

  const logCount = Math.min(500, createdCities.length);

  const logs = createdCities.slice(0, logCount).map((city) => ({
    cityId: city.id,
    action: 'initial_construction',
    value: Math.floor(Math.random() * 10) + 1,
  }));

  await prisma.buildLog.createMany({ data: logs });

  console.log(`✔ Created ${logs.length} build logs\n`);


  /** -----------------------------
   *  DONE
   * ----------------------------- */
  console.log(
    `Seeding complete!\n→ ${cityCount} cities\n→ ${createdMayors.length} mayors\n→ ${totalBuildings} buildings\n→ ${resourceBatch.length} resources\n`
  );
}
