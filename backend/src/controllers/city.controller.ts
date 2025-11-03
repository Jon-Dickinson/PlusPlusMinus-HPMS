import { Request, Response, NextFunction } from 'express';
import * as CityService from '../services/city.service.js';

export async function listCities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await CityService.listCities();
    res.json(data);
  } catch (err) {
    next(err);
  }
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
