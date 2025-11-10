import * as jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'dev-secret';
export function requireAuth(req, res, next) {
    const raw = req.headers.authorization || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, SECRET);
        // normalize payload to ensure controllers can use req.user.id
        req.user = { id: payload.id ?? payload.userId, role: payload.role };
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
// export a compat name used across routes
export const authMiddleware = requireAuth;
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}
