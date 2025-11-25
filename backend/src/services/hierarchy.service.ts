import { prisma } from '../db.js';
import { HttpError } from '../utils/http-error.js';

/* -------------------------------------------------------------
 *  GET FULL HIERARCHY TREE (ROOT → CHILDREN → USERS)
 * ------------------------------------------------------------- */
export async function getHierarchyTree() {
  return prisma.hierarchyLevel.findMany({
    where: { parentId: null },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true
        }
      },
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
          },
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
              },
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
              }
            }
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------------
 *  GET ALL SUBORDINATES OF A USER
 * ------------------------------------------------------------- */
export async function getUserSubordinates(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { hierarchy: true },
  });

  if (!user) throw new HttpError(404, 'User not found');
  if (!user.hierarchyId) throw new HttpError(400, 'User has no hierarchy assignment');

  // Get descendant hierarchy levels
  const subordinateLevels = await getSubordinateLevels(user.hierarchyId);
  const subordinateLevelIds = subordinateLevels.map(l => l.id);

  // Users assigned directly to subordinate hierarchy levels
  const subordinateUsers = await prisma.user.findMany({
    where: { hierarchyId: { in: subordinateLevelIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
      city: {
        select: {
          id: true,
          name: true,
          country: true,
          qualityIndex: true,
        }
      },
      hierarchy: {
        select: { id: true, name: true, level: true }
      }
    }
  });

  // Viewers assigned to those subordinate mayors
  const subordinateUserIds = subordinateUsers.map(u => u.id);

  const subordinateViewers = subordinateUserIds.length
    ? await prisma.user.findMany({
        where: {
          role: 'VIEWER',
          mayorId: { in: subordinateUserIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          role: true,
          city: {
            select: { id: true, name: true, country: true, qualityIndex: true }
          },
          hierarchy: {
            select: { id: true, name: true, level: true }
          }
        }
      })
    : [];

  // Merge without duplicates
  const output = [...subordinateUsers];
  const seen = new Set(output.map(u => u.id));

  for (const viewer of subordinateViewers) {
    if (!seen.has(viewer.id)) output.push(viewer);
  }

  return output;
}

/* -------------------------------------------------------------
 *  RECURSIVE: GET ALL DESCENDANT HIERARCHY LEVELS
 * ------------------------------------------------------------- */
async function getSubordinateLevels(hierarchyId: number): Promise<{ id: number }[]> {
  const children = await prisma.hierarchyLevel.findMany({
    where: { parentId: hierarchyId },
    select: { id: true },
  });

  let all = [...children];

  for (const child of children) {
    const sub = await getSubordinateLevels(child.id);
    all = all.concat(sub);
  }

  return all;
}

/* -------------------------------------------------------------
 *  GET ALLOWED BUILDINGS FOR USER
 * ------------------------------------------------------------- */
export async function getAllowedBuildings(userId: number) {
  const permissions = await prisma.userPermission.findMany({
    where: { userId, canBuild: true },
    include: {
      category: {
        include: { buildings: true }
      }
    }
  });

  return permissions.map(p => ({
    categoryId: p.categoryId,
    categoryName: p.category.name,
    description: p.category.description,
    buildings: p.category.buildings.map(b => ({
      id: b.id,
      name: b.name,
      level: b.level,
      sizeX: b.sizeX,
      sizeY: b.sizeY,
      powerUsage: b.powerUsage,
      powerOutput: b.powerOutput,
      waterUsage: b.waterUsage,
      waterOutput: b.waterOutput,
    }))
  }));
}

/* -------------------------------------------------------------
 *  GET EFFECTIVE PERMISSIONS (DIRECT + ANCESTOR)
 * ------------------------------------------------------------- */
export async function getEffectivePermissions(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hierarchyId: true }
  });

  if (!user) throw new HttpError(404, 'User not found');
  if (!user.hierarchyId) throw new HttpError(400, 'User has no hierarchy assignment');

  /* ---------------------------------------------------------
   * Find ancestors (walk up the parent chain)
   * --------------------------------------------------------- */
  const ancestorIds: number[] = [];
  let current = user.hierarchyId;

  while (current) {
    const h = await prisma.hierarchyLevel.findUnique({
      where: { id: current },
      select: { parentId: true }
    });

    if (!h?.parentId) break;

    ancestorIds.push(h.parentId);
    current = h.parentId;
  }

  // Users on ancestor levels
  const ancestorUsers = await prisma.user.findMany({
    where: { hierarchyId: { in: ancestorIds } },
    select: { id: true },
  });
  const ancestorUserIds = ancestorUsers.map(u => u.id);

  /* ---------------------------------------------------------
   * Load all categories so the result always includes them
   * --------------------------------------------------------- */
  const categories = await prisma.buildingCategory.findMany({
    select: { id: true, name: true, description: true },
  });

  /* ---------------------------------------------------------
   * Fetch all permissions affecting this user
   * --------------------------------------------------------- */
  const userIdsToCheck = [userId, ...ancestorUserIds];

  const permissions = await prisma.userPermission.findMany({
    where: { userId: { in: userIdsToCheck } },
    include: { category: true },
  });

  /* ---------------------------------------------------------
   * Build output map
   * --------------------------------------------------------- */
  const result = new Map<
    number,
    {
      categoryId: number;
      categoryName: string;
      description?: string;
      effectiveCanBuild: boolean;
      directCanBuild: boolean;
    }
  >();

  // Initialize map with all categories
  for (const c of categories) {
    result.set(c.id, {
      categoryId: c.id,
      categoryName: c.name,
      description: c.description ?? undefined,
      effectiveCanBuild: false,
      directCanBuild: false,
    });
  }

  // Apply permission rows
  for (const p of permissions) {
    const isDirect = p.userId === userId;
    const entry = result.get(p.categoryId);

    if (!entry) {
      // Category missing? Unexpected but safe fallback.
      result.set(p.categoryId, {
        categoryId: p.categoryId,
        categoryName: p.category?.name ?? `Category ${p.categoryId}`,
        description: p.category?.description ?? undefined,
        effectiveCanBuild: !!p.canBuild,
        directCanBuild: isDirect ? !!p.canBuild : false,
      });
      continue;
    }

    entry.effectiveCanBuild ||= !!p.canBuild;
    if (isDirect) entry.directCanBuild = !!p.canBuild;
  }

  return [...result.values()];
}
