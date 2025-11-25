import { prisma } from '../db.js';

/* ---------------------------------------------------------
 * TYPES
 * --------------------------------------------------------- */

export interface CreateBuildingInput {
  name: string;
  categoryId?: number;
  category?: { name: string };
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

  // Create or upsert category if category.name is provided
  if (input.category?.name) {
    const category = await prisma.buildingCategory.upsert({
      where: { name: input.category.name },
      update: {},
      create: { name: input.category.name },
    });

    categoryId = category.id;
  }

  // Create building using only valid fields
  return prisma.building.create({
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
