/**
 * Building Seeder (Refactored)
 * 
 * Orchestrates the seeding of building-related data using specialized seeder classes:
 * - CategorySeeder: Creates building categories
 * - BuildingDataSeeder: Creates buildings and resources
 * - PermissionSeeder: Assigns building permissions to users
 */

import { PrismaClient, User } from '@prisma/client';
import { CategorySeeder } from './category.seeder.js';
import { BuildingSeeder as BuildingDataSeeder } from './building-data.seeder.js';
import { PermissionSeeder } from './permission.seeder.js';

export class BuildingSeeder {
  private categorySeeder: CategorySeeder;
  private buildingDataSeeder: BuildingDataSeeder;
  private permissionSeeder: PermissionSeeder;

  constructor(private prisma: PrismaClient) {
    this.categorySeeder = new CategorySeeder(prisma);
    this.buildingDataSeeder = new BuildingDataSeeder(prisma);
    this.permissionSeeder = new PermissionSeeder(prisma);
  }

  async seedBuildings() {
    console.log('Creating building categories and buildings...');

    // Seed categories first
    const categories = await this.categorySeeder.seedCategories();
    
    // Then seed buildings
    const buildings = await this.buildingDataSeeder.seedBuildings();

    console.log('Building data seeded successfully');
    return { buildings, categories };
  }

  async seedBuildingPermissions(users: User[]) {
    await this.permissionSeeder.seedBuildingPermissions(users);
  }
}