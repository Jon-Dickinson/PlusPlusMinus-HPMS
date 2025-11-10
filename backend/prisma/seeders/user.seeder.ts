/**
 * User Seeder
 * 
 * Creates all user accounts with appropriate roles and hierarchy assignments:
 * - 1 Admin (National level)
 * - 2 National Mayors
 * - 4 City Mayors (2 per city)
 * - 8 Suburb Mayors (2 per suburb)
 * - 5 Viewers (distributed across levels)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_CONFIG } from './config.js';

export class UserSeeder {
  constructor(private prisma: PrismaClient) {}

  async seedUsers(hierarchyData: any) {
    console.log('Creating users...');
    
    const passwordHash = await bcrypt.hash(SEED_CONFIG.DEFAULT_PASSWORD, 10);
    const users = [];

    // Create Admin user
    const admin = await this.createAdmin(passwordHash, hierarchyData.national.id);
    users.push(admin);
    console.log(`Created admin: ${admin.username}`);

    // Create National Mayors
    for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.NATIONAL_MAYORS; i++) {
      const user = await this.createNationalMayor(i, passwordHash, hierarchyData.national.id);
      users.push(user);
      console.log(`Created national mayor: ${user.username}`);
    }

    // Create City Mayors
    for (let cityIdx = 0; cityIdx < hierarchyData.cities.length; cityIdx++) {
      const city = hierarchyData.cities[cityIdx];
      for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.CITY_MAYORS_PER_CITY; i++) {
        const user = await this.createCityMayor(cityIdx, i, passwordHash, city.id);
        users.push(user);
        console.log(`Created city mayor: ${user.username} for ${city.name}`);
      }
    }

    // Create Suburb Mayors
    for (let suburbIdx = 0; suburbIdx < hierarchyData.suburbs.length; suburbIdx++) {
      const suburb = hierarchyData.suburbs[suburbIdx];
      for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.SUBURB_MAYORS_PER_SUBURB; i++) {
        const user = await this.createSuburbMayor(suburb, i, passwordHash, suburb.id);
        users.push(user);
        console.log(`Created suburb mayor: ${user.username} for ${suburb.name}`);
      }
    }

    // Create Viewers
    const viewerHierarchies = [
      hierarchyData.national.id,
      hierarchyData.cities[0]?.id,
      hierarchyData.cities[1]?.id,
      hierarchyData.suburbs[0]?.id,
      hierarchyData.suburbs[2]?.id // Suburb B1
    ].filter(Boolean);

    for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.VIEWERS; i++) {
      const hierarchyId = viewerHierarchies[i - 1] || hierarchyData.national.id;
      const user = await this.createViewer(i, passwordHash, hierarchyId);
      users.push(user);
      console.log(`Created viewer: ${user.username}`);
    }

    console.log(`User Summary: Created ${users.length} users total`);
    return users;
  }

  private async createAdmin(passwordHash: string, hierarchyId: number) {
    return await this.prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        hierarchyId: hierarchyId,
        role: 'ADMIN'
      },
      create: {
        firstName: 'Alice',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@example.com',
        password: passwordHash,
        role: 'ADMIN',
        hierarchyId: hierarchyId
      }
    });
  }

  private async createNationalMayor(index: number, passwordHash: string, hierarchyId: number) {
    return await this.prisma.user.upsert({
      where: { username: `national_mayor${index}` },
      update: {
        hierarchyId: hierarchyId,
        role: 'MAYOR'
      },
      create: {
        firstName: `National${index}`,
        lastName: 'Mayor',
        username: `national_mayor${index}`,
        email: `national${index}@example.com`,
        password: passwordHash,
        role: 'MAYOR',
        hierarchyId: hierarchyId
      }
    });
  }

  private async createCityMayor(cityIndex: number, mayorIndex: number, passwordHash: string, hierarchyId: number) {
    const cityLetter = String.fromCharCode(65 + cityIndex); // A, B, C...
    return await this.prisma.user.upsert({
      where: { username: `city${cityLetter}_mayor${mayorIndex}` },
      update: {
        hierarchyId: hierarchyId,
        role: 'MAYOR'
      },
      create: {
        firstName: `City${cityLetter}${mayorIndex}`,
        lastName: 'Mayor',
        username: `city${cityLetter}_mayor${mayorIndex}`,
        email: `city${cityLetter.toLowerCase()}${mayorIndex}@example.com`,
        password: passwordHash,
        role: 'MAYOR',
        hierarchyId: hierarchyId
      }
    });
  }

  private async createSuburbMayor(suburb: any, mayorIndex: number, passwordHash: string, hierarchyId: number) {
    const username = `${suburb.name.toLowerCase().replace(/\s+/g, '_')}_mayor${mayorIndex}`;
    const email = `${suburb.name.toLowerCase().replace(/\s+/g, '_')}${mayorIndex}@example.com`;
    
    return await this.prisma.user.upsert({
      where: { username },
      update: {
        hierarchyId: hierarchyId,
        role: 'MAYOR'
      },
      create: {
        firstName: `${suburb.name}${mayorIndex}`,
        lastName: 'Mayor',
        username,
        email,
        password: passwordHash,
        role: 'MAYOR',
        hierarchyId: hierarchyId
      }
    });
  }

  private async createViewer(index: number, passwordHash: string, hierarchyId: number) {
    return await this.prisma.user.upsert({
      where: { username: `viewer${index}` },
      update: {
        hierarchyId: hierarchyId,
        role: 'VIEWER'
      },
      create: {
        firstName: `Viewer${index}`,
        lastName: 'User',
        username: `viewer${index}`,
        email: `viewer${index}@example.com`,
        password: passwordHash,
        role: 'VIEWER',
        hierarchyId: hierarchyId
      }
    });
  }
}