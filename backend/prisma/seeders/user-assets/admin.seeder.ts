/**
 * Admin Seeder
 * 
 * Creates admin user accounts with national-level access.
 */

import { PrismaClient, User } from '@prisma/client';
import { BaseUserSeeder } from './base-user.seeder.js';

export class AdminSeeder extends BaseUserSeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Create admin user with national hierarchy access
   */
  async createAdmin(hierarchyId: number): Promise<User> {
    const admin = await this.upsertUser({
      username: 'admin',
      firstName: 'Alice',
      lastName: 'Admin',
      email: this.generateEmail('admin'),
      role: 'ADMIN',
      hierarchyId: hierarchyId
    });

    console.log(`Created admin: ${admin.username}`);
    return admin;
  }

  /**
   * Seed all admin users
   */
  async seedAdmins(hierarchyData: any): Promise<User[]> {
    console.log('Creating admin users...');
    
    const admins = [];
    const admin = await this.createAdmin(hierarchyData.national.id);
    admins.push(admin);

    console.log(`Admin Summary: Created ${admins.length} admin users`);
    return admins;
  }
}