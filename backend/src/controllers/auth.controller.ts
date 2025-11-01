import { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, roleName, structureId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const parsedStructureId = structureId != null ? Number(structureId) : undefined;

    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      roleName,
      structureId: parsedStructureId,
    });
    return res
      .status(201)
      .json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err instanceof Error ? err.message : 'Registration failed' });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const { user, token } = await authService.authenticateUser(email, password);
    return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : 'Authentication failed' });
  }
};
