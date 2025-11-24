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
    const eff = await HierarchyService.getEffectivePermissions(userId);
    res.json(eff);
  } catch (err) {
    next(err);
  }
}