import { Request, Response, NextFunction } from 'express';
import * as HierarchyService from '../services/hierarchy.service.js';
import { prisma } from '../db.js';

export async function getHierarchyTree(req: Request, res: Response, next: NextFunction) {
  try {
    const tree = await HierarchyService.getHierarchyTree();
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

export async function getUserSubordinates(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const caller = (req as any).user;

    // Admins should not be blocked by missing hierarchy edges — but the
    // endpoint should still return 404 if the target user does not exist.
    if (caller?.role === 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      // If the target user has no hierarchy assignment, admins should see an
      // empty subordinate list (no hierarchy-dependent data should block them).
      if (!target.hierarchyId) return res.json([]);
    }

    const subordinates = await HierarchyService.getUserSubordinates(userId);
    res.json(subordinates);
  } catch (err) {
    next(err);
  }
}

export async function getAllowedBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    // If the caller is ADMIN, grant access to all building categories and buildings
    const caller = (req as any).user;
    if (caller?.role === 'ADMIN') {
      // Ensure target user exists — admin bypass should not silently accept
      // non-existent targets.
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      const categories = await prisma.buildingCategory.findMany({ include: { buildings: true } });
      const allowedBuildings = categories.map((c: any) => ({
        categoryId: c.id,
        categoryName: c.name,
        description: c.description,
        buildings: c.buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
          level: b.level,
          sizeX: b.sizeX,
          sizeY: b.sizeY,
          powerUsage: b.powerUsage,
          powerOutput: b.powerOutput,
          waterUsage: b.waterUsage,
          waterOutput: b.waterOutput
        }))
      }));
      return res.json(allowedBuildings);
    }

    const allowedBuildings = await HierarchyService.getAllowedBuildings(userId);
    res.json(allowedBuildings);
  } catch (err) {
    next(err);
  }
}

export async function getEffectivePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const caller = (req as any).user;

    // Admin should be allowed to request effective permissions even for
    // users that are missing hierarchy edges. Validate that the target user
    // exists; if not, return 404. Otherwise, compute effective permissions
    // using direct permissions if no hierarchy assignment exists.
    if (caller?.role === 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      if (!target.hierarchyId) {
        // Build effective permissions from the user's direct permissions only
        const categories = await prisma.buildingCategory.findMany({ select: { id: true, name: true, description: true } });
        const permissions = await prisma.userPermission.findMany({ where: { userId }, include: { category: true } });

        const map = new Map<number, any>();
        for (const c of categories) {
          map.set(c.id, {
            categoryId: c.id,
            categoryName: c.name,
            description: c.description ?? undefined,
            effectiveCanBuild: false,
            directCanBuild: false
          });
        }

        for (const p of permissions) {
          const existing = map.get(p.categoryId);
          const isDirect = p.userId === userId;
          if (!existing) {
            map.set(p.categoryId, {
              categoryId: p.categoryId,
              categoryName: p.category?.name ?? `Category ${p.categoryId}`,
              description: p.category?.description ?? undefined,
              effectiveCanBuild: !!p.canBuild,
              directCanBuild: isDirect ? !!p.canBuild : false,
            });
          } else {
            existing.effectiveCanBuild = existing.effectiveCanBuild || !!p.canBuild;
            if (isDirect) existing.directCanBuild = !!p.canBuild;
          }
        }

        return res.json(Array.from(map.values()));
      }
    }

    const eff = await HierarchyService.getEffectivePermissions(userId);
    res.json(eff);
  } catch (err) {
    next(err);
  }
}