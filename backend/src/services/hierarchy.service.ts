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

  // Get all users in subordinate levels (exclude the same level — we want true
  // subordinates). Additionally include viewers who are assigned to mayors in
  // those subordinate levels so that e.g. a national mayor can see viewers
  // under their subordinate city/suburb mayors.
  const subordinateUsers = await prisma.user.findMany({
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

  // Also include viewers whose mayorId is one of the subordinate users
  const subordinateUserIds = subordinateUsers.map(u => u.id);
  let subordinateViewers: any[] = [];
  if (subordinateUserIds.length > 0) {
    subordinateViewers = await prisma.user.findMany({
      where: {
        role: 'VIEWER',
        mayorId: { in: subordinateUserIds }
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

  // Merge unique users (subordinateUsers first, then viewers). Avoid duplicates
  const all = [...subordinateUsers];
  const existingIds = new Set(all.map(u => u.id));
  for (const v of subordinateViewers) {
    if (!existingIds.has(v.id)) {
      all.push(v);
    }
  }

  return all;
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

/**
 * Compute effective permissions for a user by combining their explicit
 * userPermission rows as well as any permissions held by users on ancestor
 * hierarchy levels. Effective rule used: canBuild is true if any source
 * (the user or any ancestor user) has canBuild=true for that category.
 */
export async function getEffectivePermissions(userId: number) {
  // load user and ensure hierarchy assignment exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');

  if (!user.hierarchyId) throw new HttpError(400, 'User has no hierarchy assignment');

  // gather ancestor hierarchy ids (walk up parent-chain)
  const ancestorIds: number[] = [];
  let currentHierarchyId = user.hierarchyId ?? null;
  while (currentHierarchyId) {
    const h = await prisma.hierarchyLevel.findUnique({ where: { id: currentHierarchyId }, select: { parentId: true } });
    if (!h || !h.parentId) break;
    ancestorIds.push(h.parentId);
    currentHierarchyId = h.parentId;
  }

  // find users assigned to ancestor levels
  const ancestorUsers = await prisma.user.findMany({ where: { hierarchyId: { in: ancestorIds } }, select: { id: true } });
  const ancestorUserIds = ancestorUsers.map(u => u.id);

  // fetch all categories so categories without any permission rows are still
  // presented in the effective permission list (with directCanBuild=false)
  const categories = await prisma.buildingCategory.findMany({ select: { id: true, name: true, description: true } });

  // fetch permissions for the target user and any ancestor users
  const allUserIds = [userId, ...ancestorUserIds];
  const permissions = await prisma.userPermission.findMany({ where: { userId: { in: allUserIds } }, include: { category: true } });

  // Build a map categoryId -> aggregated info. Start from all categories
  // so that categories with no permission records still appear with direct=false
  const map = new Map<number, { categoryId: number; categoryName: string; description?: string; effectiveCanBuild: boolean; directCanBuild: boolean }>();

  for (const c of categories) {
    map.set(c.id, {
      categoryId: c.id,
      categoryName: c.name,
      description: c.description ?? undefined,
      effectiveCanBuild: false,
      directCanBuild: false,
    });
  }

  for (const p of permissions) {
    const existing = map.get(p.categoryId);
    const isDirect = p.userId === userId;
    if (!existing) {
      // If a permission references a category not found in categories list,
      // create a fallback entry.
      map.set(p.categoryId, {
        categoryId: p.categoryId,
        categoryName: p.category?.name ?? `Category ${p.categoryId}`,
        description: p.category?.description ?? undefined,
        effectiveCanBuild: !!p.canBuild,
        directCanBuild: isDirect ? !!p.canBuild : false,
      });
    } else {
      // OR the canBuild flags
      existing.effectiveCanBuild = existing.effectiveCanBuild || !!p.canBuild;
      if (isDirect) existing.directCanBuild = !!p.canBuild;
    }
  }

  return Array.from(map.values());
}
