import { prisma } from '../db.js';

export async function getAll() {
	return prisma.building.findMany({ include: { category: true, resources: true } });
}

export async function getAllCategories() {
	return prisma.buildingCategory.findMany();
}

export async function getByCategoryName(name: string) {
  return prisma.building.findMany({ where: { category: { name } as any } as any, include: { category: true, resources: true } as any } as any);
}

export async function getById(id: number) {
	const building = await prisma.building.findUnique({ where: { id }, include: { category: true, resources: true } });

	if (!building) {
		return null;
	}

	return {
		...building,
		longDescription: building.category?.description, // Add description
	};
}

export async function create(data: any) {
	// allow creating a category if provided
	if (data.category && data.category.name) {
		const category = await prisma.buildingCategory.upsert({ where: { name: data.category.name }, update: {}, create: data.category });
		data.categoryId = category.id;
		delete data.category;
	}
	
	// Only pass valid fields to Prisma
	const { name, categoryId, level, sizeX, sizeY, powerUsage, powerOutput, waterUsage, waterOutput, cityId } = data;
	
	return prisma.building.create({ 
		data: { 
			name, 
			categoryId, 
			level, 
			sizeX, 
			sizeY, 
			powerUsage, 
			powerOutput, 
			waterUsage, 
			waterOutput, 
			cityId 
		} 
	});
}

export async function update(id: number, data: any) {
	// simple update; resource updates are separate in future
	return prisma.building.update({ where: { id }, data });
}

export async function remove(id: number) {
	return prisma.building.delete({ where: { id } });
}

