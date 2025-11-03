import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const token = await AuthService.login(req.body);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}
