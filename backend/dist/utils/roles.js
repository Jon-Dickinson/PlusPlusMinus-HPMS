// middleware factory to require one or more roles
export function requireRoles(...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!allowed.includes(user.role))
            return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}
/**
 * Middleware factory that allows access to users who have one of the allowed roles
 * OR are the owner identified by a param or body field (e.g. userId).
 *
 * Usage: requireRoleOrOwner('userId', 'ADMIN')  -> allow ADMIN or owner matching req.params.userId
 */
export function requireRoleOrOwner(paramName, ...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        // allow by role
        if (allowed.includes(user.role))
            return next();
        // allow if owner (check params first, then body)
        const ownerIdRaw = req.params?.[paramName] ?? req.body?.[paramName];
        const ownerId = ownerIdRaw ? Number(ownerIdRaw) : NaN;
        if (!Number.isNaN(ownerId) && ownerId === user.id)
            return next();
        return res.status(403).json({ message: 'Forbidden' });
    };
}
export const ALL_ROLES = ['ADMIN', 'MAYOR', 'VIEWER'];
