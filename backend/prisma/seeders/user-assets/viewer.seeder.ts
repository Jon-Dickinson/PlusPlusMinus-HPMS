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

  /**
   * Select specific mayors for viewer assignments
   */
  private selectMayorsForViewers(mayors: User[]): User[] {
    return [
      mayors.find(m => m.username === 'national_mayor1'), // Viewer1 -> National1 Mayor
      mayors.find(m => m.username === 'cityA_mayor1'),    // Viewer2 -> CityA1 Mayor  
      mayors.find(m => m.username === 'cityB_mayor1'),    // Viewer3 -> CityB1 Mayor
      mayors.find(m => m.username.includes('suburb_a1_mayor1')), // Viewer4 -> Suburb A1 Mayor1
      mayors.find(m => m.username.includes('suburb_b1_mayor1'))  // Viewer5 -> Suburb B1 Mayor1
    ].filter(Boolean) as User[];
  }

  /**
   * Get hierarchy IDs for viewers based on their assigned mayors
   */
  private getViewerHierarchies(hierarchyData: any): number[] {
    return [
      hierarchyData.national.id,
      hierarchyData.cities[0]?.id,
      hierarchyData.cities[1]?.id,
      hierarchyData.suburbs[0]?.id,
      hierarchyData.suburbs[2]?.id // Suburb B1
    ].filter(Boolean);
  }

  /**
   * Seed all viewer users with mayor assignments
   */
  async seedViewers(hierarchyData: any, mayors: User[]): Promise<User[]> {
    console.log('Creating viewer users with mayor assignments...');
    
    const viewers = [];
    const selectedMayors = this.selectMayorsForViewers(mayors);
    const viewerHierarchies = this.getViewerHierarchies(hierarchyData);

    for (let i = 1; i <= SEED_CONFIG.USER_COUNTS.VIEWERS; i++) {
      const hierarchyId = viewerHierarchies[i - 1] || hierarchyData.national.id;
      const assignedMayor = selectedMayors[i - 1];
      const mayorId = assignedMayor ? assignedMayor.id : undefined;
      
      const user = await this.createViewer(i, hierarchyId, mayorId);
      viewers.push(user);
      console.log(`Created viewer: ${user.username} assigned to mayor: ${assignedMayor?.username || 'none'}`);
    }

    console.log(`Viewer Summary: Created ${viewers.length} viewer users`);
    return viewers;
  }
}