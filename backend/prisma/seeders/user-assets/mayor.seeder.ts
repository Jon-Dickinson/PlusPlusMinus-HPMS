/**
 * Mayor Seeder
 * 
 * Creates mayor user accounts for all hierarchy levels:
 * - National mayors (national level access)
 * - City mayors (city level access)
 * - Suburb mayors (suburb level access)
 */

import { PrismaClient, User } from '@prisma/client';
import { BaseUserSeeder } from './base-user.seeder.js';
import { SEED_CONFIG } from '../config.js';

export class MayorSeeder extends BaseUserSeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Create a national mayor
   */
  async createNationalMayor(index: number, hierarchyId: number): Promise<User> {
    return await this.upsertUser({
      username: `national_mayor${index}`,
      firstName: `National${index}`,
      lastName: 'Mayor',
      email: this.generateEmail(`national${index}`),
      role: 'MAYOR',
      hierarchyId: hierarchyId
    });
  }

  /**
   * Create a city mayor
   */
  async createCityMayor(nationalIndex: number, cityIndex: number, mayorIndex: number, hierarchyId: number): Promise<User> {
    const cityLetter = this.getCityLetter(cityIndex);
    return await this.upsertUser({
      // include national index so usernames are unique across different
      // top-level national trees (e.g. city1A_mayor1 vs city2A_mayor1)
      username: `city${nationalIndex}${cityLetter}_mayor${mayorIndex}`,
      firstName: `City${nationalIndex}${cityLetter}${mayorIndex}`,
      lastName: 'Mayor',
      email: this.generateEmail(`city${nationalIndex}${cityLetter.toLowerCase()}${mayorIndex}`),
      role: 'MAYOR',
      hierarchyId: hierarchyId
    });
  }

  /**
   * Create a suburb mayor
   */
  async createSuburbMayor(suburb: any, mayorIndex: number, hierarchyId: number): Promise<User> {
    const username = `${this.sanitizeForUsername(suburb.name)}_mayor${mayorIndex}`;
    return await this.upsertUser({
      username: username,
      firstName: `${suburb.name}${mayorIndex}`,
      lastName: 'Mayor',
      email: this.generateEmail(username),
      role: 'MAYOR',
      hierarchyId: hierarchyId
    });
  }

  /**
   * Seed all mayor users
   */
  async seedMayors(hierarchyData: any): Promise<User[]> {
    console.log('Creating mayor users...');
    
    const mayors = [];

    // For each national subtree create a national mayor, then create mayors
    // for each city and each suburb under that city.
    let natIndex = 1;
    for (const nat of hierarchyData.nationals) {
      const natMayor = await this.createNationalMayor(natIndex, nat.id);
      mayors.push(natMayor);
      console.log(`Created national mayor: ${natMayor.username}`);

      // Create city mayors for cities under this national node
      for (let cityIdx = 0; cityIdx < (nat.cities || []).length; cityIdx++) {
        const city = nat.cities[cityIdx];
        // create exactly one mayor per city node; if config requires more, use mayorIndex
        for (let i = 1; i <= Math.max(1, SEED_CONFIG.USER_COUNTS.CITY_MAYORS_PER_CITY); i++) {
          const user = await this.createCityMayor(natIndex, cityIdx, i, city.id);
          mayors.push(user);
          console.log(`Created city mayor: ${user.username} for ${city.name}`);

          // For each suburb under this city, create suburb mayors
          const suburbs = city.suburbs || [];
          for (let sIdx = 0; sIdx < suburbs.length; sIdx++) {
            const suburb = suburbs[sIdx];
            for (let j = 1; j <= Math.max(1, SEED_CONFIG.USER_COUNTS.SUBURB_MAYORS_PER_SUBURB); j++) {
              const subMayor = await this.createSuburbMayor(suburb, j, suburb.id);
              mayors.push(subMayor);
              console.log(`Created suburb mayor: ${subMayor.username} for ${suburb.name}`);
            }
          }
        }
      }

      natIndex++;
    }

    console.log(`Mayor Summary: Created ${mayors.length} mayor users`);
    return mayors;
  }
}