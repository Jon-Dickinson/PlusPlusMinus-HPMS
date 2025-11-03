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

	// Transform the resources array into a key-value object
	const resources = building.resources.reduce((acc, resource) => {
		acc[resource.type] = resource.amount;
		return acc;
	}, {} as Record<string, number>);

	return {
		...building,
		longDescription: building.category?.description, // Add description
		resources,
	};
}

export async function create(data: any) {
	// allow creating a category if provided
	if (data.category && data.category.name) {
		const category = await prisma.buildingCategory.upsert({ where: { name: data.category.name }, update: {}, create: data.category });
		data.categoryId = category.id;
		delete data.category;
	}
	return prisma.building.create({ data });
}

export async function update(id: number, data: any) {
	// simple update; resource updates are separate in future
	return prisma.building.update({ where: { id }, data });
}

export async function remove(id: number) {
	return prisma.building.delete({ where: { id } });
}

