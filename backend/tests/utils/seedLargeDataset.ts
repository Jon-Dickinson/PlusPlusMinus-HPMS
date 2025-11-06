import { prisma } from '../../src/db.js';

export async function seedLargeDataset(cityCount = 1000) {
  console.log(`Creating ${cityCount} cities with associated data...`);

  // Create many mayor users first, then create cities linked to those mayors.
  const mayorUsers = Array.from({ length: cityCount }).map((_, i) => ({
    firstName: `Mayor-${i}`,
    lastName: `Seed`,
    username: `seed-mayor-${i}`,
    email: `seed-mayor-${i}@test.local`,
    password: `seed-pass-${i}`,
    role: 'MAYOR' as any,
  }));

  // Use createMany for users (fast). Note: createMany won't return created records; we'll query them back.
  console.log('Creating mayor users...');
  await prisma.user.createMany({ data: mayorUsers });

  const createdMayors = await prisma.user.findMany({
    where: { username: { startsWith: 'seed-mayor-' } },
    take: cityCount as any
  });
  console.log(`Created ${createdMayors.length} mayor users`);

  // create cities linked to each mayor
  const cities = createdMayors.map((m, i) => ({
    name: `City-${i}`,
    country: 'Testland',
    qualityIndex: Math.random() * 100,
    mayorId: m.id,
  }));

  // createMany for cities
  console.log('Creating cities...');
  await prisma.city.createMany({ data: cities });

  // Create buildings for each city (1-3 buildings per city for more realistic data)
  const createdCities = await prisma.city.findMany({
    where: { name: { startsWith: 'City-' } },
    take: cityCount as any
  });
  console.log(`Created ${createdCities.length} cities`);

  // Create building categories first
  const categories = ['Residential', 'Commercial', 'Industrial', 'Utility'];
  const categoryPromises = categories.map(name =>
    prisma.buildingCategory.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} buildings` }
    })
  );
  await Promise.all(categoryPromises);

  const createdCategories = await prisma.buildingCategory.findMany();
  console.log(`Created ${createdCategories.length} building categories`);

  // Create buildings in batches to avoid memory issues
  const buildingsPerCity = 2; // Average 2 buildings per city
  const totalBuildings = cityCount * buildingsPerCity;
  console.log(`Creating ${totalBuildings} buildings...`);

  const buildingData = [];
  for (const city of createdCities) {
    for (let j = 0; j < buildingsPerCity; j++) {
      const category = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      buildingData.push({
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

  // Create buildings in chunks
  const chunkSize = 500;
  for (let i = 0; i < buildingData.length; i += chunkSize) {
    const chunk = buildingData.slice(i, i + chunkSize);
    await prisma.building.createMany({ data: chunk });
    console.log(`Created buildings ${i} to ${Math.min(i + chunkSize, buildingData.length)}`);
  }

  // Create some building resources for variety
  const createdBuildings = await prisma.building.findMany({
    where: { name: { startsWith: 'Building-' } },
    take: Math.min(1000, totalBuildings) as any // Sample some buildings for resources
  });

  const resourceTypes = ['steel', 'wood', 'concrete', 'energy', 'water', 'food'];
  const resourcePromises = createdBuildings.flatMap(building =>
    Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
      buildingId: building.id,
      type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
      amount: Math.floor(Math.random() * 1000) + 10
    }))
  );

  // Create resources in chunks
  for (let i = 0; i < resourcePromises.length; i += chunkSize) {
    const chunk = resourcePromises.slice(i, i + chunkSize);
    await prisma.buildingResource.createMany({ data: chunk });
  }

  console.log(`Created ${resourcePromises.length} building resources`);

  // Create some build logs for realism
  const logPromises = createdCities.slice(0, Math.min(500, createdCities.length)).map(city => ({
    cityId: city.id,
    action: 'initial_construction',
    value: Math.floor(Math.random() * 10) + 1
  }));

  await prisma.buildLog.createMany({ data: logPromises });
  console.log(`Created ${logPromises.length} build logs`);

  console.log(`✅ Dataset seeding complete: ${cityCount} cities, ~${totalBuildings} buildings`);
}
