import { prisma } from '../db.js';

export async function getAll() {
	return prisma.building.findMany({ include: { category: true, resources: true } });
}

export async function getAllCategories() {
	return prisma.buildingCategory.findMany();
}

export async function getById(id: number) {
	return prisma.building.findUnique({ where: { id }, include: { category: true, resources: true } });
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

