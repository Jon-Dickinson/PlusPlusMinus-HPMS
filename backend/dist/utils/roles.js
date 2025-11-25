export const ALL_ROLES = ['ADMIN', 'MAYOR', 'VIEWER'];
/* ======================================================================
 * Internal helper — Strong ID parsing
 * ====================================================================== */
function parseId(value) {
    if (typeof value !== 'string' && typeof value !== 'number')
        return null;
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
}
/* ======================================================================
 * requireRoles(...roles)
 * Require one or more roles to access a route
 * ====================================================================== */
export function requireRoles(...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!allowed.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
}
/* ======================================================================
 * requireRoleOrOwner(paramName, ...roles)
 *
 * Allows:
 *   - Any user with an allowed role
 *   - OR the "owner", matched by req.params[paramName] or req.body[paramName]
 *
 * Usage:
 *   requireRoleOrOwner('userId', 'ADMIN')
 * ====================================================================== */
export function requireRoleOrOwner(paramName, ...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Allow if user has one of the required roles
        if (allowed.includes(user.role)) {
            return next();
        }
        // Allow if user is the "owner"
        const rawOwnerId = req.params?.[paramName] ??
            req.body?.[paramName] ??
            null;
        const ownerId = parseId(rawOwnerId);
        if (ownerId !== null && ownerId === user.id) {
            return next();
        }
        return res.status(403).json({ message: 'Forbidden' });
    };
}
