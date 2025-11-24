import { beforeAll, beforeEach } from 'vitest';
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
  await (prisma as any).qualityIndexAudit?.deleteMany?.();
  // Ensure we delete user-permission records before users to avoid FK constraint errors
  await prisma.userPermission.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
});

// Ensure every test starts from a clean DB snapshot so tests are isolated and
// won't hit FK constraint issues due to ordering or concurrency. This is a
// defensive delete across child tables -> parent tables.
beforeEach(async () => {
  await prisma.buildingResource.deleteMany();
  await prisma.buildLog.deleteMany();
  await prisma.building.deleteMany();
  await prisma.note.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.buildingCategory.deleteMany();
  await (prisma as any).qualityIndexAudit?.deleteMany?.();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
  // Don't remove HierarchyLevel because many tests rely on seeded entries; if
  // a test needs to create levels it should clean them itself.
});