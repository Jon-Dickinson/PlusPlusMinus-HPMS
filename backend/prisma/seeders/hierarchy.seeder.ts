/**
 * Hierarchy Seeder
 * 
 * Creates the hierarchical structure of administrative levels:
 * - National (Level 1)
 * - Cities (Level 2) 
 * - Suburbs (Level 3)
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG } from './config.js';

export class HierarchySeeder {
  constructor(private prisma: PrismaClient) {}

  async seedHierarchy() {
    console.log('Creating hierarchy levels...');
    
    const hierarchyData = {
      national: null as any,
      cities: [] as any[],
      suburbs: [] as any[]
    };

    // Create National level (root)
    hierarchyData.national = await this.prisma.hierarchyLevel.upsert({
      where: { id: 1 },
      update: {},
      create: { 
        id: 1, 
        name: SEED_CONFIG.HIERARCHY.NATIONAL.name, 
        level: SEED_CONFIG.HIERARCHY.NATIONAL.level 
      }
    });

    console.log(`Created National level: ${hierarchyData.national.name}`);

    // Create City levels
    let cityId = 2;
    for (const cityName of SEED_CONFIG.HIERARCHY.CITY.cities) {
      const city = await this.prisma.hierarchyLevel.upsert({
        where: { id: cityId },
        update: {},
        create: { 
          id: cityId, 
          name: cityName, 
          level: SEED_CONFIG.HIERARCHY.CITY.level, 
          parentId: hierarchyData.national.id 
        }
      });
      
      hierarchyData.cities.push(city);
      console.log(`Created City level: ${city.name}`);
      cityId++;
    }

    // Create Suburb levels
    let suburbId = 4;
    for (const suburbConfig of SEED_CONFIG.HIERARCHY.SUBURB.suburbs) {
      // Find the parent city
      const parentCity = hierarchyData.cities.find(c => c.name === suburbConfig.parentCity);
      if (!parentCity) {
        console.error(`Parent city not found for suburb: ${suburbConfig.name}`);
        continue;
      }

      const suburb = await this.prisma.hierarchyLevel.upsert({
        where: { id: suburbId },
        update: {},
        create: { 
          id: suburbId, 
          name: suburbConfig.name, 
          level: SEED_CONFIG.HIERARCHY.SUBURB.level, 
          parentId: parentCity.id 
        }
      });
      
      hierarchyData.suburbs.push(suburb);
      console.log(`Created Suburb level: ${suburb.name} (under ${parentCity.name})`);
      suburbId++;
    }

    console.log(`Hierarchy Summary: 1 National, ${hierarchyData.cities.length} Cities, ${hierarchyData.suburbs.length} Suburbs`);
    
    return hierarchyData;
  }
}