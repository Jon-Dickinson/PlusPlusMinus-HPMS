import { Request, Response, NextFunction } from 'express';
import * as CityService from '../services/city.service.js';
import { getCityByUserId as serviceGetCityByUserId, saveCity as serviceSaveCity } from '../services/city.service.js';
import { saveCitySchema } from '../validators/city.validator.js';
export async function listCities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await CityService.listCities();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
export async function getCity(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const city = await serviceGetCityByUserId(userId);
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
}

export async function saveCitySnapshot(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const parsed = saveCitySchema.parse(req.body);
  const updated = await serviceSaveCity(userId, parsed);
  res.json(updated);
}
export async function getCityById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const city = await CityService.getById(id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (err) {
    next(err);
  }
}

export async function getCityByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const city = await CityService.getByMayorId(userId);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (err) {
    next(err);
  }
}

export async function saveCityByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    // auth/permissions are enforced by middleware (requireRoleOrOwner)
    const updated = await CityService.saveByMayorId(userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function createCity(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await CityService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const updated = await CityService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCity(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await CityService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getBuildLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const logs = await CityService.getBuildLogs(cityId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function addBuildLog(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const log = await CityService.addBuildLog(cityId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const notes = await CityService.getNotes(cityId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const note = await CityService.addNote(cityId, req.body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function updateCityData(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const userId = (req as any).user.id;
    const updatedCity = await CityService.updateCityData(cityId, userId, req.body);
    res.json(updatedCity);
  } catch (err) {
    next(err);
  }
}

export async function getCityData(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = Number(req.params.id);
    const data = await CityService.getCityData(cityId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
