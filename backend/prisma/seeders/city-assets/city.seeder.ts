/**
 * City Seeder
 * 
 * Creates cities for all mayors based on their hierarchy level:
 * - National mayors get capital cities
 * - City mayors get their respective cities
 * - Suburb mayors get township cities
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG } from '../config.js';
import { CityGridGenerator } from '../../../src/services/city-grid-generator.ts';

export class CitySeeder {
  private gridGenerator: CityGridGenerator;
  
  constructor(private prisma: PrismaClient) {
    this.gridGenerator = new CityGridGenerator();
  }

  async seedCities(users: any[], hierarchyData: any) {
    console.log('Creating cities for mayors...');

    const mayors = users.filter(user => user.role === 'MAYOR');
    const createdCities = [];

    for (const mayor of mayors) {
      const mayorHierarchy = await this.prisma.hierarchyLevel.findUnique({
        where: { id: mayor.hierarchyId }
      });
      
      if (!mayorHierarchy) {
        console.error(`Hierarchy not found for mayor: ${mayor.username}`);
        continue;
      }

      const cityName = this.generateCityName(mayorHierarchy, mayor);
      
      // Generate realistic city grid based on hierarchy level
      const cityGrid = this.gridGenerator.generateCityGrid(mayorHierarchy.level);
      
      // Check if city already exists for this mayor
      let city = await this.prisma.city.findFirst({ 
        where: { mayorId: mayor.id } 
      });
      
      if (!city) {
        city = await this.prisma.city.create({
          data: {
            name: cityName,
            country: SEED_CONFIG.CITY_SETTINGS.DEFAULT_COUNTRY,
            qualityIndex: cityGrid.qualityIndex,
            mayorId: mayor.id,
            gridState: JSON.stringify(cityGrid.gridState),
            buildingLog: JSON.stringify(cityGrid.buildingLog)
          }
        });
        
        console.log(`Created city "${cityName}" for ${this.getHierarchyLevelName(mayorHierarchy.level)} mayor ${mayor.firstName} ${mayor.lastName} (Quality: ${cityGrid.qualityIndex}%)`);
      } else {
        // Update existing city with new grid data
        city = await this.prisma.city.update({
          where: { id: city.id },
          data: {
            qualityIndex: cityGrid.qualityIndex,
            gridState: JSON.stringify(cityGrid.gridState),
            buildingLog: JSON.stringify(cityGrid.buildingLog)
          }
        });
        
        console.log(`Updated existing city "${city.name}" for ${this.getHierarchyLevelName(mayorHierarchy.level)} mayor ${mayor.firstName} ${mayor.lastName} (Quality: ${cityGrid.qualityIndex}%)`);
      }

      // Always add city to the result array (whether newly created or existing)
      createdCities.push({
        ...city,
        mayorName: `${mayor.firstName} ${mayor.lastName}`,
        mayorUsername: mayor.username,
        hierarchyLevel: this.getHierarchyLevelName(mayorHierarchy.level)
      });
    }

    console.log(`City Summary: Created ${createdCities.length} cities`);
    return createdCities;
  }

  private generateCityName(hierarchy: any, mayor: any): string {
    switch (hierarchy.level) {
      case 1: // National level
        return `National Capital - ${mayor.firstName}'s District`;
      case 2: // City level
        return hierarchy.name; // "City A" or "City B"
      case 3: // Suburb level
        return `${hierarchy.name} Township`; // "Suburb A1 Township"
      default:
        return `${mayor.firstName}'s City`;
    }
  }

  private getHierarchyLevelName(level: number): string {
    switch (level) {
      case 1: return 'National';
      case 2: return 'City';
      case 3: return 'Suburb';
      default: return 'Unknown';
    }
  }
}