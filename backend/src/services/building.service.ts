import { prisma } from '../db.js';
import { BUILDING_PERMISSIONS } from '../config/seed-config.js';

/* ---------------------------------------------------------
 * TYPES
 * --------------------------------------------------------- */

export interface CreateBuildingInput {
  name: string;
  categoryId?: number;
  // support either nested `category` or flat fields coming from API
  category?: { name: string; description?: string };
  categoryName?: string;
  categoryDescription?: string;
  level: number;
  sizeX: number;
  sizeY: number;
  powerUsage?: number;
  powerOutput?: number;
  waterUsage?: number;
  waterOutput?: number;
  cityId: number;
}

export interface UpdateBuildingInput {
  name?: string;
  categoryId?: number;
  level?: number;
  sizeX?: number;
  sizeY?: number;
  powerUsage?: number;
  powerOutput?: number;
  waterUsage?: number;
  waterOutput?: number;
  cityId?: number;
}

/* ---------------------------------------------------------
 *  GET ALL BUILDINGS
 * --------------------------------------------------------- */

export async function getAll() {
  return prisma.building.findMany({
    include: { category: true, resources: true },
  });
}

/* ---------------------------------------------------------
 *  GET ALL CATEGORIES
 * --------------------------------------------------------- */

export async function getAllCategories() {
  return prisma.buildingCategory.findMany();
}

/* ---------------------------------------------------------
 *  GET BUILDINGS BY CATEGORY NAME
 * --------------------------------------------------------- */

export async function getByCategoryName(name: string) {
  return prisma.building.findMany({
    where: {
      category: {
        name,
      },
    },
    include: { category: true, resources: true },
  });
}

/* ---------------------------------------------------------
 *  GET BUILDING BY ID
 * --------------------------------------------------------- */

export async function getById(id: number) {
  const building = await prisma.building.findUnique({
    where: { id },
    include: { category: true, resources: true },
  });

  if (!building) return null;

  return {
    ...building,
    longDescription: building.category?.description ?? null,
  };
}

/* ---------------------------------------------------------
 *  CREATE BUILDING
 * --------------------------------------------------------- */

export async function create(input: CreateBuildingInput) {
  let categoryId = input.categoryId;

  // Create or upsert category if category.name or categoryName is provided
  const requestedCategoryName = input.category?.name ?? input.categoryName;
  const requestedCategoryDescription = input.category?.description ?? input.categoryDescription;

  if (requestedCategoryName) {
    const category = await prisma.buildingCategory.upsert({
      where: { name: requestedCategoryName },
      update: { description: requestedCategoryDescription ?? undefined },
      create: { name: requestedCategoryName, description: requestedCategoryDescription ?? undefined },
    });

    categoryId = category.id;
  }

  // Create building using only valid fields
  const created = await prisma.building.create({
    data: {
      name: input.name,
      categoryId,
      level: input.level,
      sizeX: input.sizeX,
      sizeY: input.sizeY,
      powerUsage: input.powerUsage,
      powerOutput: input.powerOutput,
      waterUsage: input.waterUsage,
      waterOutput: input.waterOutput,
      cityId: input.cityId,
    },
  });

  // After creating a building (and potentially creating a category), ensure
  // existing users are granted appropriate permissions for this category
  // according to our BUILDING_PERMISSIONS mapping. This mirrors the seeder
  // behavior and guarantees that if categories are created after mayors are
  // registered they still receive permission rows.
  try {
    if (categoryId) {
      const category = await prisma.buildingCategory.findUnique({ where: { id: categoryId } });
      if (category) {
        const catName = category.name;

        // Determine which hierarchy levels should be granted this category
        const levelsToGrant = new Set<number>();
        if (BUILDING_PERMISSIONS.NATIONAL_LEVEL === 'all') levelsToGrant.add(1);
        if ((BUILDING_PERMISSIONS.CITY_LEVEL as readonly string[]).includes(catName)) levelsToGrant.add(2);
        if ((BUILDING_PERMISSIONS.SUBURB_LEVEL as readonly string[]).includes(catName)) levelsToGrant.add(3);

        if (levelsToGrant.size > 0) {
          // Find hierarchy nodes for each level and all users attached to them
          for (const level of levelsToGrant) {
            const nodes = await prisma.hierarchyLevel.findMany({ where: { level } });
            const nodeIds = nodes.map(n => n.id);
            if (nodeIds.length === 0) continue;

            const users = await prisma.user.findMany({ where: { hierarchyId: { in: nodeIds }, role: { not: 'VIEWER' } } });
            for (const u of users) {
              await prisma.userPermission.upsert({
                where: { userId_categoryId: { userId: u.id, categoryId: category.id } },
                update: { canBuild: true },
                create: { userId: u.id, categoryId: category.id, canBuild: true },
              });
            }
          }
        }
      }
    }
  } catch (err) {
    // Non-fatal — we don't want building creation to fail if permission
    // propagation has problems. Log and move on.
    console.warn('Failed to assign permissions when creating building:', (err as any)?.message ?? String(err));
  }

  return created;
}

/* ---------------------------------------------------------
 *  UPDATE BUILDING
 * --------------------------------------------------------- */

export async function update(id: number, data: UpdateBuildingInput) {
  return prisma.building.update({
    where: { id },
    data,
  });
}

/* ---------------------------------------------------------
 *  DELETE BUILDING
 * --------------------------------------------------------- */

export async function remove(id: number) {
  return prisma.building.delete({ where: { id } });
}
