import { prisma } from '../db.js';
/* ---------------------------------------------------------
 * listMayors()
 * --------------------------------------------------------- */
export function listMayors() {
    return prisma.user.findMany({
        where: { role: 'MAYOR' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            hierarchyId: true,
            hierarchy: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                    parent: { select: { name: true } },
                },
            },
            city: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                    qualityIndex: true,
                    gridState: true,
                    buildingLog: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            notes: {
                select: { id: true },
                take: 1,
            },
        },
        orderBy: { id: 'asc' },
    });
}
/* ---------------------------------------------------------
 * getAll()
 * --------------------------------------------------------- */
export async function getAll() {
    return prisma.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            hierarchyId: true,
            mayorId: true,
            createdAt: true,
            updatedAt: true,
            city: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                    qualityIndex: true,
                },
            },
            hierarchy: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                },
            },
        },
    });
}
/* ---------------------------------------------------------
 * getById()
 * --------------------------------------------------------- */
export async function getById(id) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            city: true,
            notes: { orderBy: { createdAt: 'desc' } },
        },
    });
    if (!user)
        return null;
    const { password, ...safeUser } = user;
    return safeUser;
}
/* ---------------------------------------------------------
 * create()
 * --------------------------------------------------------- */
export async function create(data) {
    return prisma.user.create({ data });
}
/* ---------------------------------------------------------
 * update()
 * --------------------------------------------------------- */
export async function update(id, data) {
    return prisma.user.update({
        where: { id },
        data,
    });
}
/* ---------------------------------------------------------
 * remove()
 * --------------------------------------------------------- */
export async function remove(id) {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id },
            include: {
                city: true,
                notes: true,
                permissions: true,
                viewers: true,
            },
        });
        if (!user)
            throw new Error('User not found');
        // 1. Remove permissions
        await tx.userPermission.deleteMany({ where: { userId: id } });
        // 2. Remove notes
        await tx.note.deleteMany({ where: { userId: id } });
        // 3. Detach viewers (VIEWER.mayorId → null)
        if (user.viewers.length > 0) {
            await tx.user.updateMany({
                where: { mayorId: id },
                data: { mayorId: null },
            });
        }
        // 4. Delete city + dependent entities if MAYOR
        if (user.role === 'MAYOR' && user.city) {
            const cityId = user.city.id;
            await tx.building.deleteMany({ where: { cityId } });
            await tx.buildLog.deleteMany({ where: { cityId } });
            await tx.city.delete({ where: { id: cityId } });
        }
        // 5. Finally delete the user
        return tx.user.delete({ where: { id } });
    });
}
/* ---------------------------------------------------------
 * updatePermissions()
 * --------------------------------------------------------- */
export async function updatePermissions(userId, permissions) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    await prisma.$transaction(async (tx) => {
        for (const p of permissions) {
            if (p.canBuild) {
                // Upsert user permission
                await tx.userPermission.upsert({
                    where: {
                        userId_categoryId: {
                            userId,
                            categoryId: p.categoryId,
                        },
                    },
                    update: { canBuild: true },
                    create: {
                        userId,
                        categoryId: p.categoryId,
                        canBuild: true,
                    },
                });
            }
            else {
                // Remove permission row
                await tx.userPermission.deleteMany({
                    where: { userId, categoryId: p.categoryId },
                });
            }
        }
    });
    return prisma.userPermission.findMany({
        where: { userId },
        include: { category: true },
    });
}
