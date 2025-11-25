import { Request, Response, NextFunction } from 'express';
import * as HierarchyService from '../services/hierarchy.service.js';
import { prisma } from '../db.js';

/* ======================================================================
 * Utility: Safe ID Parsing
 * ====================================================================== */
function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

/* ======================================================================
 * GET: Hierarchy Tree
 * ====================================================================== */
export async function getHierarchyTree(req: Request, res: Response, next: NextFunction) {
  try {
    const tree = await HierarchyService.getHierarchyTree();
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * GET: Subordinates of a User
 * Applies ADMIN bypass logic
 * ====================================================================== */
export async function getUserSubordinates(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

    const caller = (req as any).user;

    // ADMIN bypass: can fetch subordinates even if hierarchy edges missing
    if (caller?.role === 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      // If target has no hierarchy assignment → return no subordinate info
      if (!target.hierarchyId) return res.json([]);

      // Otherwise compute using service
      const subs = await HierarchyService.getUserSubordinates(userId);
      return res.json(subs);
    }

    // Standard user / mayor logic
    const subs = await HierarchyService.getUserSubordinates(userId);
    res.json(subs);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * GET: Allowed Buildings for a User
 * ADMIN returns ALL categories & buildings
 * ====================================================================== */
export async function getAllowedBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

    const caller = (req as any).user;

    if (caller?.role === 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      const categories = await prisma.buildingCategory.findMany({
        include: { buildings: true }
      });

      const formatted = categories.map((c: any) => ({
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

      return res.json(formatted);
    }

    const allowed = await HierarchyService.getAllowedBuildings(userId);
    res.json(allowed);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * GET: Effective Permissions for a User
 * ADMIN bypass: build effective permissions even without hierarchy edges
 * ====================================================================== */
export async function getEffectivePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

    const caller = (req as any).user;

    if (caller?.role === 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return res.status(404).json({ error: 'Target user not found' });

      // If missing hierarchy → compute direct-only permissions
      if (!target.hierarchyId) {
        const categories = await prisma.buildingCategory.findMany({
          select: { id: true, name: true, description: true }
        });

        const directPermissions = await prisma.userPermission.findMany({
          where: { userId },
          include: { category: true }
        });

        const map = new Map<number, any>();

        // Initialize every category
        for (const c of categories) {
          map.set(c.id, {
            categoryId: c.id,
            categoryName: c.name,
            description: c.description ?? undefined,
            effectiveCanBuild: false,
            directCanBuild: false
          });
        }

        // Populate direct permissions
        for (const p of directPermissions) {
          const e = map.get(p.categoryId);

          const isDirect = p.userId === userId;
          const can = !!p.canBuild;

          if (e) {
            e.effectiveCanBuild ||= can;
            if (isDirect) e.directCanBuild = can;
          } else {
            // fallback entry
            map.set(p.categoryId, {
              categoryId: p.categoryId,
              categoryName: p.category?.name ?? `Category ${p.categoryId}`,
              description: p.category?.description ?? undefined,
              effectiveCanBuild: can,
              directCanBuild: isDirect ? can : false
            });
          }
        }

        return res.json(Array.from(map.values()));
      }
    }

    // Standard logic (includes ancestor inheritance)
    const eff = await HierarchyService.getEffectivePermissions(userId);
    res.json(eff);
  } catch (err) {
    next(err);
  }
}
