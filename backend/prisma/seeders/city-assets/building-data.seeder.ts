/**
 * Building Seeder (Refactored)
 * 
 * Seeds buildings from JSON data files and handles building resources.
 * Categories are handled by CategorySeeder.
 */

import { PrismaClient, Building, BuildingCategory } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BuildingSeeder {
  constructor(private prisma: PrismaClient) {}

  /**
   * Load buildings data from JSON file
   */
  private loadBuildingsData(): any[] {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/buildings.json'), 'utf8')
    );
  }

  /**
   * Seed buildings and their resources
   */
  async seedBuildings(): Promise<Building[]> {
    console.log('Seeding buildings...');
    
    const buildingsData = this.loadBuildingsData();
    const buildings: Building[] = [];
    
    for (const building of buildingsData) {
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

      buildings.push(buildingRecord);

      // Handle building resources
      if (building.resources) {
        await this.seedBuildingResources(buildingRecord.id, building.resources);
      }
    }

    console.log(`Building Summary: Created ${buildings.length} buildings`);
    return buildings;
  }

  /**
   * Seed resources for a specific building
   */
  private async seedBuildingResources(buildingId: number, resources: any): Promise<void> {
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
}