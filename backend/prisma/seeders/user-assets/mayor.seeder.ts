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
  async createCityMayor(cityIndex: number, mayorIndex: number, hierarchyId: number): Promise<User> {
    const cityLetter = this.getCityLetter(cityIndex);
    return await this.upsertUser({
      username: `city${cityLetter}_mayor${mayorIndex}`,
      firstName: `City${cityLetter}${mayorIndex}`,
      lastName: 'Mayor',
      email: this.generateEmail(`city${cityLetter.toLowerCase()}${mayorIndex}`),
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

    // Create National Mayors
    for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.NATIONAL_MAYORS; i++) {
      const user = await this.createNationalMayor(i, hierarchyData.national.id);
      mayors.push(user);
      console.log(`Created national mayor: ${user.username}`);
    }

    // Create City Mayors
    for (let cityIdx = 0; cityIdx < hierarchyData.cities.length; cityIdx++) {
      const city = hierarchyData.cities[cityIdx];
      for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.CITY_MAYORS_PER_CITY; i++) {
        const user = await this.createCityMayor(cityIdx, i, city.id);
        mayors.push(user);
        console.log(`Created city mayor: ${user.username} for ${city.name}`);
      }
    }

    // Create Suburb Mayors
    for (let suburbIdx = 0; suburbIdx < hierarchyData.suburbs.length; suburbIdx++) {
      const suburb = hierarchyData.suburbs[suburbIdx];
      for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.SUBURB_MAYORS_PER_SUBURB; i++) {
        const user = await this.createSuburbMayor(suburb, i, suburb.id);
        mayors.push(user);
        console.log(`Created suburb mayor: ${user.username} for ${suburb.name}`);
      }
    }

    console.log(`Mayor Summary: Created ${mayors.length} mayor users`);
    return mayors;
  }
}