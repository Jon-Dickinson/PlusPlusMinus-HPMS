/**
 * User Seeder (Refactored)
 * 
 * Orchestrates the creation of all user accounts using specialized seeder classes:
 * - AdminSeeder: Creates admin users
 * - MayorSeeder: Creates mayors at all hierarchy levels
 * - ViewerSeeder: Creates viewers with mayor assignments
 */

import { PrismaClient, User } from '@prisma/client';
import { AdminSeeder } from './admin.seeder.js';
import { MayorSeeder } from './mayor.seeder.js';
import { ViewerSeeder } from './viewer.seeder.js';

export class UserSeeder {
  private adminSeeder: AdminSeeder;
  private mayorSeeder: MayorSeeder;
  private viewerSeeder: ViewerSeeder;

  constructor(private prisma: PrismaClient) {
    this.adminSeeder = new AdminSeeder(prisma);
    this.mayorSeeder = new MayorSeeder(prisma);
    this.viewerSeeder = new ViewerSeeder(prisma);
  }

  async seedUsers(hierarchyData: any): Promise<User[]> {
    console.log('Creating users...');
    
    const users: User[] = [];

    // Create Admin users
    const admins = await this.adminSeeder.seedAdmins(hierarchyData);
    users.push(...admins);

    // Create Mayor users
    const mayors = await this.mayorSeeder.seedMayors(hierarchyData);
    users.push(...mayors);

    // Create Viewer users with mayor assignments
    const viewers = await this.viewerSeeder.seedViewers(hierarchyData, mayors);
    users.push(...viewers);

    console.log(`User Summary: Created ${users.length} users total`);
    return users;
  }


}