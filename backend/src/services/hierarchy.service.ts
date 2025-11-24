import { prisma } from '../db.js';
import { HttpError } from '../utils/http-error.js';

export async function getHierarchyTree() {
  return await prisma.hierarchyLevel.findMany({
    include: {
      children: {
        include: {
          children: {
            include: {
              children: {
                include: {
                  users: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      username: true,
                      role: true
                    }
                  }
                }
              },
              users: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  role: true
                }
              }
            }
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              role: true
            }
          }
        }
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true
        }
      }
    },
    where: {
      parentId: null // Start with root level
    }
  });
}

export async function getUserSubordinates(userId: number) {
  // Get user's hierarchy level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hierarchy: true
    }
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!user.hierarchyId) {
    throw new HttpError(400, 'User has no hierarchy assignment');
  }

  // Get all subordinate hierarchy levels
  const subordinateLevels = await getSubordinateLevels(user.hierarchyId);
  const subordinateLevelIds = subordinateLevels.map(level => level.id);
  subordinateLevelIds.push(user.hierarchyId); // Include same level

  // Get all users in subordinate levels
  return await prisma.user.findMany({
    where: {
      hierarchyId: {
        in: subordinateLevelIds
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
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

async function getSubordinateLevels(hierarchyId: number): Promise<any[]> {
  const children = await prisma.hierarchyLevel.findMany({
    where: {
      parentId: hierarchyId
    }
  });

  let allSubordinates = [...children];

  // Recursively get children of children
  for (const child of children) {
    const grandChildren = await getSubordinateLevels(child.id);
    allSubordinates = allSubordinates.concat(grandChildren);
  }

  return allSubordinates;
}

export async function getAllowedBuildings(userId: number) {
  // Get user's building permissions
  const userPermissions = await prisma.userPermission.findMany({
    where: {
      userId: userId,
      canBuild: true
    },
    include: {
      category: {
        include: {
          buildings: true
        }
      }
    }
  });

  // Return allowed building categories and their buildings
  return userPermissions.map((permission: any) => ({
    categoryId: permission.categoryId,
    categoryName: permission.category.name,
    description: permission.category.description,
    buildings: permission.category.buildings.map((building: any) => ({
      id: building.id,
      name: building.name,
      level: building.level,
      sizeX: building.sizeX,
      sizeY: building.sizeY,
      powerUsage: building.powerUsage,
      powerOutput: building.powerOutput,
      waterUsage: building.waterUsage,
      waterOutput: building.waterOutput
    }))
  }));
}
