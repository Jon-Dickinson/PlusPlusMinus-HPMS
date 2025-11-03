import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service.js';
import { registerRefined } from '../validators/auth.validator.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // validate mayor-specific requirements
    registerRefined.parse(req.body);
    const payload = await AuthService.register(req.body);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    const payload = await AuthService.login({ username, email, password });
    res.json(payload);
  } catch (err) {
    next(err);
  }
}
