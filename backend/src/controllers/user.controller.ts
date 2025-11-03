import { Request, Response, NextFunction } from 'express';
import * as UserService from '../services/user.service.js';

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserService.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}


export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const user = await UserService.getById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const updated = await UserService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await UserService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}