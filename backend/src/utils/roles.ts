import { Request, Response, NextFunction } from 'express';

export type Role = 'ADMIN' | 'MAYOR' | 'VIEWER';

// middleware factory to require one or more roles
export function requireRoles(...allowed: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		if (!allowed.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
		next();
	};
}

export const ALL_ROLES: Role[] = ['ADMIN', 'MAYOR', 'VIEWER'];
