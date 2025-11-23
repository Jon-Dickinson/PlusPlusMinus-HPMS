/**
 * Summary Reporter
 * 
 * Generates human-readable summaries and reports of the seeded data.
 * Provides useful information for testing and verification.
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG } from './config.js';

export class SummaryReporter {
  constructor(private prisma: PrismaClient) {}

  async generateSeedSummary(users: any[], cities: any[]) {
    console.log('\n' + '='.repeat(60));
    console.log('SEED SUMMARY REPORT');
    console.log('='.repeat(60));

    await this.reportHierarchyStructure();
    this.reportUserAccounts(users);
    this.reportCities(cities);
    await this.reportBuildingPermissions();
    this.reportTestCredentials(users);
  }

  private async reportHierarchyStructure() {
    console.log('\nHIERARCHY STRUCTURE:');
    console.log('-'.repeat(40));
    
    const hierarchies = await this.prisma.hierarchyLevel.findMany({
      orderBy: [{ level: 'asc' }, { id: 'asc' }],
      include: { 
        users: { select: { username: true, role: true } },
        parent: true,
        children: true
      }
    });

    for (const hierarchy of hierarchies) {
      const indent = '  '.repeat(hierarchy.level - 1);
      const userCount = hierarchy.users.length;
      const mayorCount = hierarchy.users.filter(u => u.role === 'MAYOR').length;
      
      console.log(`${indent}${hierarchy.name} (Level ${hierarchy.level})`);
      console.log(`${indent}  Users: ${userCount} (${mayorCount} mayors)`);
      
      if (hierarchy.children.length > 0) {
        console.log(`${indent}  Children: ${hierarchy.children.length}`);
      }
    }
  }

  private reportUserAccounts(users: any[]) {
    console.log('\nUSER ACCOUNT SUMMARY:');
    console.log('-'.repeat(40));
    
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`Total Users: ${users.length}`);
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });
  }

  private reportCities(cities: any[]) {
    console.log('\nCITIES CREATED:');
    console.log('-'.repeat(40));
    
    console.table(cities.map(city => ({
      cityName: city.name,
      mayorName: city.mayorName,
      mayorUsername: city.mayorUsername,
      hierarchyLevel: city.hierarchyLevel,
      qualityIndex: Math.round(city.qualityIndex * 100) / 100
    })));
  }

  private async reportBuildingPermissions() {
    console.log('\nBUILDING PERMISSION MATRIX:');
    console.log('-'.repeat(40));
    
    const categories = await this.prisma.buildingCategory.findMany();
    
    const permissionMatrix = [
      {
        level: 'National Mayor',
        buildings: 'All buildings (full access)',
        count: categories.length
      },
      {
        level: 'City Mayor',
        buildings: SEED_CONFIG.BUILDING_PERMISSIONS.CITY_LEVEL.join(', '),
        count: SEED_CONFIG.BUILDING_PERMISSIONS.CITY_LEVEL.length
      },
      {
        level: 'Suburb Mayor',
        buildings: SEED_CONFIG.BUILDING_PERMISSIONS.SUBURB_LEVEL.join(', '),
        count: SEED_CONFIG.BUILDING_PERMISSIONS.SUBURB_LEVEL.length
      },
      {
        level: 'Viewer',
        buildings: 'None (read-only access)',
        count: 0
      }
    ];

    console.table(permissionMatrix);
  }

  private reportTestCredentials(users: any[]) {
    console.log('\nTEST USER CREDENTIALS:');
    console.log('-'.repeat(40));
    console.log(`Default Password: ${SEED_CONFIG.DEFAULT_PASSWORD}`);
    console.log('');

    const testUsers = [
      {
        role: 'Admin',
        username: 'admin',
        email: 'admin@example.com',
        hierarchyLevel: 'National',
        access: 'Full system access'
      },
      {
        role: 'National Mayor',
        username: 'national_mayor1',
        email: 'national1@example.com',
        hierarchyLevel: 'National',
        access: 'All buildings'
      },
      {
        role: 'City Mayor',
        username: 'cityA_mayor1',
        email: 'citya1@example.com',
        hierarchyLevel: 'City A',
        access: 'Commercial, Emergency, Energy, Utilities, Residential, Agriculture'
      },
      {
        role: 'Suburb Mayor',
        username: 'suburb_a1_mayor1',
        email: 'suburb_a1_mayor1@example.com',
        hierarchyLevel: 'Suburb A1',
        access: 'Residential, Agriculture only'
      },
      {
        role: 'Viewer',
        username: 'viewer1',
        email: 'viewer1@example.com',
        hierarchyLevel: 'National',
        access: 'Read-only (no building permissions)'
      }
    ];

    console.table(testUsers);
    
    console.log('\nLOGIN INSTRUCTIONS:');
    console.log('-'.repeat(40));
    console.log('1. Use the email address as the login identifier');
    console.log('2. All accounts use the same password: Password123!');
    console.log('3. Different roles will show different building options');
    console.log('4. Suburb mayors have the most restricted building access');
    console.log('5. National mayors and admins have full building access');
  }
}