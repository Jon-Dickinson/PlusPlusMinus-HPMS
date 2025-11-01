// Purpose: verify token, attach req.user, require roles

import express, { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';

export const verifyToken: RequestHandler = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing Authorization' });
    const token = auth.slice(7);

    // jwt.verify can return a string or JwtPayload. Treat as unknown first, then narrow.
    const verified = jwt.verify(token, JWT_SECRET) as unknown;
    const payload =
      typeof verified === 'string'
        ? ({ sub: Number(verified) } as JwtPayload & { sub?: string | number })
        : (verified as JwtPayload & { sub?: string | number });

    const rawSub = payload.sub;
    const userId =
      typeof rawSub === 'string' ? parseInt(rawSub, 10) : (rawSub as number | undefined);
    if (!userId || Number.isNaN(userId))
      return res.status(401).json({ error: 'Invalid token subject' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    // attach minimal user info
    const rolesFromPayload = Array.isArray(payload.roles) ? (payload.roles as string[]) : undefined;
    const roles =
      rolesFromPayload ??
      (await prisma.userRole.findMany({ where: { userId }, include: { role: true } })).map(
        (r: { role: { name: string } }) => r.role.name,
      );
    (req as any).user = { id: user.id, roles };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (user.roles && user.roles.includes('ADMIN')) return next(); // admin bypass
    const ok =
      Array.isArray(user.roles) && user.roles.some((r: string) => allowedRoles.includes(r));
    if (!ok) return res.status(403).json({ error: 'Insufficient role' });
    next();
  };
};
