import { prisma } from '../db.js';

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
          parent: {
            select: { name: true }
          }
        }
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
          updatedAt: true
        } 
      },
      notes: { select: { id: true }, take: 1 },
    },
    orderBy: { id: 'asc' },
  });
}

export async function getAll() {
  return prisma.user.findMany({
    include: {
      viewers: {
        select: { id: true, firstName: true, lastName: true, username: true, role: true }
      },
      mayor: {
        select: { id: true, firstName: true, lastName: true }
      },
      city: { 
        select: { 
          id: true,
          name: true, 
          country: true, 
          qualityIndex: true
        } 
      },
      hierarchy: {
        select: {
          id: true,
          name: true,
          level: true
        }
      }
    }
  });
}

export async function getById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      city: true,
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function create(data: any) {
  // Note: password hashing should be handled by auth service for registrations; this create is intended for admin user creation
  return prisma.user.create({ data });
}

export async function update(id: number, data: any) {
  return prisma.user.update({ where: { id }, data });
}

export async function remove(id: number) {
  // Use a transaction to handle all cascading deletes properly
  return prisma.$transaction(async (tx) => {
    // Get user with all relationships
    const user = await tx.user.findUnique({ 
      where: { id }, 
      include: { 
        city: true, 
        notes: true, 
        permissions: true,
        viewers: true
      } 
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // 1. Delete user permissions first
    await tx.userPermission.deleteMany({ where: { userId: id } });

    // 2. Delete user notes
    await tx.note.deleteMany({ where: { userId: id } });

    // 3. If user has viewers, reassign them or handle appropriately
    if (user.viewers && user.viewers.length > 0) {
      // Remove the mayor assignment from viewers (set mayorId to null)
      await tx.user.updateMany({
        where: { mayorId: id },
        data: { mayorId: null }
      });
    }

    // 4. If the user is a MAYOR and has a city, delete city and related data
    if (user.role === 'MAYOR' && user.city) {
      // Delete city buildings first
      await tx.building.deleteMany({ where: { cityId: user.city.id } });
      
      // Delete city build logs
      await tx.buildLog.deleteMany({ where: { cityId: user.city.id } });
      
      // Delete the city
      await tx.city.delete({ where: { id: user.city.id } });
    }

    // 5. Finally delete the user
    return tx.user.delete({ where: { id } });
  });
}
