import { beforeAll } from 'vitest';
import { prisma } from '../src/db.js';

// Global test setup
beforeAll(async () => {
  // Ensure database connection
  await prisma.$connect();

  // Clean up any leftover test data
  await prisma.note.deleteMany();
  await prisma.buildLog.deleteMany();
  await prisma.buildingResource.deleteMany();
  await prisma.building.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
});