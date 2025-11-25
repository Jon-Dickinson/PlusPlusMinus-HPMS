import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service.js';
import { registerRefined } from '../validators/auth.validator.js';

/**
 * Register a new user (ADMIN, MAYOR, or VIEWER)
 * - Performs full Zod validation
 * - Delegates domain logic to AuthService
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request against refined schema (MAYOR-specific rules included)
    const validatedData = registerRefined.parse(req.body);

    if (!validatedData.role) {
      throw new Error('Role is required');
    }
    const payload = await AuthService.register({ ...validatedData, role: validatedData.role });

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * Login controller
 * - Accepts either username or email + password
 * - Delegates full logic to AuthService
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;

    const payload = await AuthService.login({
      username: username ?? undefined,
      email: email ?? undefined,
      password,
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
}
