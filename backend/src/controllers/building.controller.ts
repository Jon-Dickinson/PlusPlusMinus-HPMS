import { Request, Response, NextFunction } from 'express';
import * as BuildingService from '../services/building.service.js';

/**
 * Retrieve all buildings.
 */
export async function getAllBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const buildings = await BuildingService.getAll();
    res.json(buildings);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve all building categories.
 */
export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await BuildingService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single building by ID.
 */
export async function getBuildingById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid building ID' });
    }

    const building = await BuildingService.getById(id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(building);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new building.
 */
export async function createBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await BuildingService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing building.
 */
export async function updateBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid building ID' });
    }

    const updated = await BuildingService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a building.
 */
export async function deleteBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid building ID' });
    }

    await BuildingService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Get buildings by category/type name.
 */
export async function getBuildingsByType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type;
    if (!type) {
      return res.status(400).json({ message: 'Missing building type' });
    }

    const data = await BuildingService.getByCategoryName(type);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
