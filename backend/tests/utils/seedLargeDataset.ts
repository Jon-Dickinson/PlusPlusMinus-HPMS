import { prisma } from '../../src/db.js';

export async function seedLargeDataset(cityCount = 1000) {
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
  await prisma.user.createMany({ data: mayorUsers });

  const createdMayors = await prisma.user.findMany({ where: { username: { startsWith: 'seed-mayor-' } }, take: cityCount as any });

  // create cities linked to each mayor
  const cities = createdMayors.map((m, i) => ({
    name: `City-${i}`,
    country: 'Testland',
    qualityIndex: Math.random() * 100,
    mayorId: m.id,
  }));

  // createMany for cities
  await prisma.city.createMany({ data: cities });

  // create one building per city using a transaction for speed
  const createdCities = await prisma.city.findMany({ where: { name: { startsWith: 'City-' } }, take: cityCount as any });
  const buildingCreates = createdCities.map((c) => prisma.building.create({ data: { cityId: c.id, name: `B-${c.id}-0` } }));
  // run in transactions in chunks to avoid giant transaction
  const chunkSize = 200;
  for (let i = 0; i < buildingCreates.length; i += chunkSize) {
    const chunk = buildingCreates.slice(i, i + chunkSize);
    await prisma.$transaction(chunk);
  }
}
