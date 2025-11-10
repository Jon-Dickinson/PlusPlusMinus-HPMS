import { Request, Response, NextFunction } from 'express';
import * as HierarchyService from '../services/hierarchy.service.js';

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
    const allowedBuildings = await HierarchyService.getAllowedBuildings(userId);
    res.json(allowedBuildings);
  } catch (err) {
    next(err);
  }
}