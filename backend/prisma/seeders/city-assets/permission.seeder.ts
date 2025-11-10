/**
 * Permission Seeder
 * 
 * Handles building permissions based on user hierarchy levels.
 * Assigns permissions to users based on their roles and hierarchy access.
 */

import { PrismaClient, BuildingCategory, User } from '@prisma/client';
import { SEED_CONFIG } from '../config.js';

export class PermissionSeeder {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create permission rules based on hierarchy levels
   */
  private createPermissionRules(allCategories: BuildingCategory[]): Record<number, number[]> {
    return {
      1: allCategories.map(c => c.id), // National: All buildings
      2: allCategories.filter(c => 
        SEED_CONFIG.BUILDING_PERMISSIONS.CITY_LEVEL.includes(c.name as any)
      ).map(c => c.id), // City: Limited set
      3: allCategories.filter(c => 
        SEED_CONFIG.BUILDING_PERMISSIONS.SUBURB_LEVEL.includes(c.name as any)
      ).map(c => c.id) // Suburb: Most limited
    };
  }

  /**
   * Log permission rules for debugging
   */
  private logPermissionRules(allCategories: BuildingCategory[], permissionRules: Record<number, number[]>): void {
    console.log('Permission rules:');
    console.log('National:', allCategories.filter(c => permissionRules[1].includes(c.id)).map(c => c.name));
    console.log('City:', allCategories.filter(c => permissionRules[2].includes(c.id)).map(c => c.name));
    console.log('Suburb:', allCategories.filter(c => permissionRules[3].includes(c.id)).map(c => c.name));
  }

  /**
   * Assign building permissions to users based on their hierarchy level
   */
  async seedBuildingPermissions(users: User[]): Promise<void> {
    console.log('Assigning building permissions...');

    const allCategories = await this.prisma.buildingCategory.findMany();
    const permissionRules = this.createPermissionRules(allCategories);

    this.logPermissionRules(allCategories, permissionRules);

    // Assign permissions to all non-viewer users
    for (const user of users) {
      if (user.role === 'VIEWER') continue;

      const userHierarchy = await this.prisma.hierarchyLevel.findUnique({
        where: { id: user.hierarchyId! }
      });
      
      if (!userHierarchy) continue;

      const allowedCategoryIds = permissionRules[userHierarchy.level] || [];
      
      for (const categoryId of allowedCategoryIds) {
        await this.prisma.userPermission.upsert({
          where: {
            userId_categoryId: {
              userId: user.id,
              categoryId: categoryId
            }
          },
          update: { canBuild: true },
          create: {
            userId: user.id,
            categoryId: categoryId,
            canBuild: true
          }
        });
      }
    }

    console.log('Building permissions assigned successfully');
  }
}