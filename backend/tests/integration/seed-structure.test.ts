import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { HierarchySeeder } from '../../prisma/seeders/hierarchy.seeder';
import { UserSeeder } from '../../prisma/seeders/user-assets/user.seeder';

const prisma = new PrismaClient();

describe('Seed structure constraints', () => {
  beforeEach(async () => {
    // Clean database (order matters due to FKs)
    await prisma.note.deleteMany();
    await prisma.buildLog.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await prisma.hierarchyLevel.deleteMany();
  });

  it('creates strict National → City → Suburb trees and users point to correct nodes', async () => {
    const h = new HierarchySeeder(prisma);
    const hierarchyData = await h.seedHierarchy();

    // Ensure a single top-level root exists and top-level entries are nationals
    expect(hierarchyData.root).toBeTruthy();
    const root = hierarchyData.root;

    // Ensure top-level entries are nationals
    expect(Array.isArray(hierarchyData.nationals)).toBe(true);
    expect(hierarchyData.nationals.length).toBeGreaterThan(0);

    // Validate structure: cities must have parentId referencing a national (level 1)
    for (const nat of hierarchyData.nationals) {
      // Nationals must be direct children of the root
      expect(nat.parentId).toBe(root.id);
      expect(nat.level).toBe(1);
      const cities = nat.cities || [];
      expect(cities.length).toBeGreaterThan(0);

      for (const city of cities) {
        expect(city.level).toBe(2);
        expect(city.parentId).toBe(nat.id);

        const suburbs = city.suburbs || [];
        expect(suburbs.length).toBeGreaterThan(0);
        for (const sub of suburbs) {
          expect(sub.level).toBe(3);
          expect(sub.parentId).toBe(city.id);
        }
      }
    }

    // Now create users for the hierarchy and validate mayor/viewer constraints
    const userSeeder = new UserSeeder(prisma);
    const users = await userSeeder.seedUsers(hierarchyData);

    // For each mayor, verify the hierarchy level is correct and parentage holds
    const mayors = users.filter(u => u.role === 'MAYOR');
    expect(mayors.length).toBeGreaterThan(0);

    for (const mayor of mayors) {
      const hl = await prisma.hierarchyLevel.findUnique({ where: { id: mayor.hierarchyId ?? undefined } });
      expect(hl).toBeTruthy();
      if (hl!.level === 2) {
        // City mayor -> parent must be level 1
        expect(hl!.parentId).toBeTruthy();
        const parent = await prisma.hierarchyLevel.findUnique({ where: { id: hl!.parentId! } });
        expect(parent!.level).toBe(1);
      }
      if (hl!.level === 3) {
        // Suburb mayor -> parent must be a city
        expect(hl!.parentId).toBeTruthy();
        const parent = await prisma.hierarchyLevel.findUnique({ where: { id: hl!.parentId! } });
        expect(parent!.level).toBe(2);
      }
    }

    // Verify viewers: mayorId should point at the mayor and hierarchyId matches mayor's
    const viewers = users.filter(u => u.role === 'VIEWER');
    expect(viewers.length).toBeGreaterThan(0);

    for (const v of viewers) {
      expect(v.mayorId).toBeDefined();
      const mayor = await prisma.user.findUnique({ where: { id: v.mayorId! } });
      expect(mayor).toBeTruthy();
      expect(v.hierarchyId).toBe(mayor!.hierarchyId);
    }

    // Verify Alice Admin is created and assigned to the root node
    const admin = users.find(u => u.role === 'ADMIN');
    expect(admin).toBeTruthy();
    expect(admin?.hierarchyId).toBe(root.id);
  });
});
