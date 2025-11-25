import { Request, Response, NextFunction } from 'express';
import * as UserService from '../services/user.service.js';

/* ======================================================================
 * Utility — Safe ID parsing
 * ====================================================================== */
function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

/* ======================================================================
 * GET /api/users
 * ====================================================================== */
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserService.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * GET /api/users/mayors (public)
 * ====================================================================== */
export async function listMayors(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await UserService.listMayors();

    // Enrich response for frontend: mark mayors who have notes
    const result = data.map((m: any) => ({
      ...m,
      hasNotes: (m.notes?.length ?? 0) > 0,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * GET /api/users/:id
 * ====================================================================== */
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await UserService.getById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * POST /api/users
 * ADMIN ONLY
 * ====================================================================== */
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * PUT /api/users/:id
 * ====================================================================== */
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    const updated = await UserService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * DELETE /api/users/:id
 * ADMIN ONLY
 * ====================================================================== */
export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    await UserService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/* ======================================================================
 * PUT /api/users/:id/permissions
 * Requires: requireHierarchyWriteAccess
 * ====================================================================== */
export async function updateUserPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    // Normalize the permissions payload
    const permissions = Array.isArray(req.body?.permissions)
      ? req.body.permissions
      : [];

    const sanitizedPermissions = permissions
      .filter((p: any) => p && typeof p.categoryId === 'number')
      .map((p: any) => ({
        categoryId: p.categoryId,
        canBuild: !!p.canBuild,
      }));

    const updated = await UserService.updatePermissions(id, sanitizedPermissions);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
