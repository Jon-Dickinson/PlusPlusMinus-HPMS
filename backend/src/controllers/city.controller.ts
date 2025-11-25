import { Request, Response, NextFunction } from 'express';
import * as CityService from '../services/city.service.js';
import { saveCitySchema } from '../validators/city.validator.js';

/* ======================================================================
 * Utility: safely parse IDs
 * ====================================================================== */
function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

/* ======================================================================
 * City List & Basic CRUD
 * ====================================================================== */

export async function listCities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await CityService.listCities();
    res.json(data);
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

export async function getCityById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid city ID' });

    const city = await CityService.getById(id);
    if (!city) return res.status(404).json({ message: 'City not found' });

    res.json(city);
  } catch (err) {
    next(err);
  }
}

export async function updateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid city ID' });

    const updated = await CityService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCity(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid city ID' });

    await CityService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * Retrieve & Modify a Mayor's City
 * ====================================================================== */

export async function getCityByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const city = await CityService.getByMayorId(userId);
    if (!city) return res.status(404).json({ message: 'City not found' });

    res.json(city);
  } catch (err) {
    next(err);
  }
}

export async function saveCityByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseId(req.params.userId);
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    // Permissions are enforced by middleware
    const updated = await CityService.saveByMayorId(userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * Alternative “snapshot” endpoints (legacy API)
 * ====================================================================== */

export async function getCity(req: Request, res: Response) {
  const userId = parseId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

  const city = await CityService.getCityByUserId(userId);
  if (!city) return res.status(404).json({ error: 'City not found' });

  res.json(city);
}

export async function saveCitySnapshot(req: Request, res: Response) {
  const userId = parseId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

  const parsed = saveCitySchema.parse(req.body);
  const updated = await CityService.saveCity(userId, parsed);

  res.json(updated);
}

/* ======================================================================
 * City Logs
 * ====================================================================== */

export async function getBuildLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const logs = await CityService.getBuildLogs(cityId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function addBuildLog(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const log = await CityService.addBuildLog(cityId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * Notes for a City (owned by mayor)
 * ====================================================================== */

export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const notes = await CityService.getNotes(cityId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const note = await CityService.addNote(cityId, req.body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * Grid + BuildingLog + QualityIndex bundle
 * ====================================================================== */

export async function updateCityData(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const userId = (req as any).user.id;

    try {
      console.debug('updateCityData', { cityId, userId, payload: req.body });
    } catch {
      /* ignore logging failures */
    }

    const updated = await CityService.updateCityData(cityId, userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getCityData(req: Request, res: Response, next: NextFunction) {
  try {
    const cityId = parseId(req.params.id);
    if (!cityId) return res.status(400).json({ message: 'Invalid city ID' });

    const data = await CityService.getCityData(cityId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
