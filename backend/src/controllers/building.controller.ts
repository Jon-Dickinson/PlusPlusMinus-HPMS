import { Request, Response, NextFunction } from 'express';
import * as BuildingService from '../services/building.service.js';

export async function getAllBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const buildings = await BuildingService.getAll();
    res.json(buildings);
  } catch (err) {
    next(err);
  }
}

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await BuildingService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getBuildingById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const building = await BuildingService.getById(id);
    if (!building) return res.status(404).json({ message: 'Building not found' });
    res.json(building);
  } catch (err) {
    next(err);
  }
}

export async function createBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await BuildingService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const updated = await BuildingService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await BuildingService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
