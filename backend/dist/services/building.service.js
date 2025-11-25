import { prisma } from '../db.js';
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
export async function getByCategoryName(name) {
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
export async function getById(id) {
    const building = await prisma.building.findUnique({
        where: { id },
        include: { category: true, resources: true },
    });
    if (!building)
        return null;
    return {
        ...building,
        longDescription: building.category?.description ?? null,
    };
}
/* ---------------------------------------------------------
 *  CREATE BUILDING
 * --------------------------------------------------------- */
export async function create(input) {
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
export async function update(id, data) {
    return prisma.building.update({
        where: { id },
        data,
    });
}
/* ---------------------------------------------------------
 *  DELETE BUILDING
 * --------------------------------------------------------- */
export async function remove(id) {
    return prisma.building.delete({ where: { id } });
}
