/**
 * Building Seeder
 * 
 * Seeds building categories and buildings from JSON data files.
 * Also handles building permissions based on hierarchy levels.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BuildingSeeder {
  constructor(private prisma: PrismaClient) {}

  async seedBuildings() {
    console.log('Creating building categories and buildings...');

    // Load JSON data
    const buildings = this.loadBuildingsData();
    const categories = this.loadCategoriesData();

    // Seed categories first
    await this.seedCategories(categories);
    
    // Then seed buildings
    await this.seedBuildingData(buildings);

    console.log('Building data seeded successfully');
    return { buildings, categories };
  }

  async seedBuildingPermissions(users: any[]) {
    console.log('Assigning building permissions...');

    const allCategories = await this.prisma.buildingCategory.findMany();
    const permissionRules = this.createPermissionRules(allCategories);

    this.logPermissionRules(allCategories, permissionRules);

    // Assign permissions to all non-viewer users
    for (const user of users) {
      if (user.role === 'VIEWER') continue;

      const userHierarchy = await this.prisma.hierarchyLevel.findUnique({
        where: { id: user.hierarchyId }
      });
      
      if (!userHierarchy) continue;

      const allowedCategoryIds = permissionRules[userHierarchy.level as keyof typeof permissionRules] || [];
      
      for (const categoryId of allowedCategoryIds) {
        await this.prisma.userPermission.upsert({
          where: {
            userId_categoryId: {
              userId: user.id,
              categoryId: categoryId
            }
          },
          update: { canBuild: true },
          create: {
            userId: user.id,
            categoryId: categoryId,
            canBuild: true
          }
        });
      }
    }

    console.log('Building permissions assigned successfully');
  }

  private loadBuildingsData() {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/buildings.json'), 'utf8')
    );
  }

  private loadCategoriesData() {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/categories.json'), 'utf8')
    );
  }

  private async seedCategories(categories: any[]) {
    console.log('Seeding building categories...');
    
    for (const category of categories) {
      await this.prisma.buildingCategory.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
          description: category.description ?? '',
        },
      });
      console.log(`Created category: ${category.name}`);
    }
  }

  private async seedBuildingData(buildings: any[]) {
    console.log('Seeding buildings...');
    
    for (const building of buildings) {
      const category = await this.prisma.buildingCategory.findUnique({
        where: { name: building.category },
      });
      
      if (!category) {
        console.warn(`Missing category for building ${building.name}`);
        continue;
      }

      // Create building if it doesn't exist
      let buildingRecord = await this.prisma.building.findFirst({ 
        where: { name: building.name } 
      });
      
      if (!buildingRecord) {
        buildingRecord = await this.prisma.building.create({
          data: {
            id: building.id,
            name: building.name,
            categoryId: category.id,
            level: (building.level as number) || undefined,
            sizeX: (building.sizeX as number) || undefined,
            sizeY: (building.sizeY as number) || undefined,
            powerUsage: (building.powerUsage as number) || undefined,
            powerOutput: (building.powerOutput as number) || undefined,
            waterUsage: (building.waterUsage as number) || undefined,
            waterOutput: (building.waterOutput as number) || undefined,
          },
        });
        console.log(`Created building: ${building.name}`);
      }

      // Handle building resources
      if (building.resources) {
        await this.seedBuildingResources(buildingRecord.id, building.resources);
      }
    }
  }

  private async seedBuildingResources(buildingId: number, resources: any) {
    for (const [resourceType, amount] of Object.entries(resources)) {
      const resourceAmount = Number(amount) || 0;
      
      const existing = await this.prisma.buildingResource.findFirst({ 
        where: { buildingId, type: resourceType } 
      });
      
      if (existing) {
        await this.prisma.buildingResource.update({ 
          where: { id: existing.id }, 
          data: { amount: resourceAmount } 
        });
      } else {
        await this.prisma.buildingResource.create({ 
          data: { 
            buildingId, 
            type: resourceType, 
            amount: resourceAmount 
          } 
        });
      }
    }
  }

  private createPermissionRules(allCategories: any[]) {
    return {
      1: allCategories.map(c => c.id), // National: All buildings
      2: allCategories.filter(c => 
        SEED_CONFIG.BUILDING_PERMISSIONS.CITY_LEVEL.includes(c.name)
      ).map(c => c.id), // City: Limited set
      3: allCategories.filter(c => 
        SEED_CONFIG.BUILDING_PERMISSIONS.SUBURB_LEVEL.includes(c.name)
      ).map(c => c.id) // Suburb: Most limited
    };
  }

  private logPermissionRules(allCategories: any[], permissionRules: any) {
    console.log('Permission rules:');
    console.log('National:', allCategories.filter(c => permissionRules[1].includes(c.id)).map(c => c.name));
    console.log('City:', allCategories.filter(c => permissionRules[2].includes(c.id)).map(c => c.name));
    console.log('Suburb:', allCategories.filter(c => permissionRules[3].includes(c.id)).map(c => c.name));
  }
}