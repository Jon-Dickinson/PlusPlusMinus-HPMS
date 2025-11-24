/**
 * Viewer Seeder
 * 
 * Creates viewer user accounts and assigns them to specific mayors.
 * Each viewer is assigned to exactly one mayor for viewing their cities.
 */

import { PrismaClient, User } from '@prisma/client';
import { BaseUserSeeder } from './base-user.seeder.js';
import { SEED_CONFIG } from '../config.js';

export class ViewerSeeder extends BaseUserSeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Create a viewer user with mayor assignment
   */
  async createViewer(index: number, hierarchyId: number, mayorId?: number): Promise<User> {
    return await this.upsertUser({
      username: `viewer${index}`,
      firstName: `Viewer${index}`,
      lastName: 'User',
      email: this.generateEmail(`viewer${index}`),
      role: 'VIEWER',
      hierarchyId: hierarchyId,
      mayorId: mayorId
    });
  }

  // NOTE: We create viewers directly linked 1:1 to mayors and therefore no
  // special selection helpers are necessary.

  /**
   * Seed all viewer users with mayor assignments
   */
  async seedViewers(hierarchyData: any, mayors: User[]): Promise<User[]> {
    console.log('Creating viewer users with mayor assignments...');
    const viewers: User[] = [];

    // Create one viewer per mayor and ensure hierarchyId matches the mayor's
    // hierarchyId and mayorId points to that mayor. This satisfies the "each
    // mayor node carries its own viewer" requirement.
    let idx = 1;
    for (const mayor of mayors) {
      const user = await this.createViewer(idx, mayor.hierarchyId, mayor.id);
      viewers.push(user);
      console.log(`Created viewer: ${user.username} assigned to mayor: ${mayor.username}`);
      idx++;
    }

    // Optionally ensure at least one national-level viewer exists (if there is a
    // national mayor, create an extra viewer for them if no viewer already exists)
    const nationalMayor = mayors.find(m => m.hierarchyId && m.hierarchyId === hierarchyData.nationals?.[0]?.id);
    if (nationalMayor) {
      const existing = viewers.find(v => v.mayorId === nationalMayor.id);
      if (!existing) {
        const v = await this.createViewer(idx++, nationalMayor.hierarchyId, nationalMayor.id);
        viewers.push(v);
        console.log(`Created optional national viewer: ${v.username} assigned to ${nationalMayor.username}`);
      }
    }

    console.log(`Viewer Summary: Created ${viewers.length} viewer users`);
    return viewers;
  }
}