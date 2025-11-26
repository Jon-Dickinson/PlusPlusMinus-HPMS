import * as UserService from '../services/user.service.js';
import * as AuditService from '../services/audit.service.js';
/* ======================================================================
 * Utility — Safe ID parsing
 * ====================================================================== */
function parseId(value) {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
}
/* ======================================================================
 * GET /api/users
 * ====================================================================== */
export async function getAllUsers(req, res, next) {
    try {
        const users = await UserService.getAll();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * GET /api/users/mayors (public)
 * ====================================================================== */
export async function listMayors(_req, res, next) {
    try {
        const data = await UserService.listMayors();
        // Enrich response for frontend: mark mayors who have notes
        const result = data.map((m) => ({
            ...m,
            hasNotes: (m.notes?.length ?? 0) > 0,
        }));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * GET /api/users/:id
 * ====================================================================== */
export async function getUserById(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'Invalid user ID' });
        const user = await UserService.getById(id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * POST /api/users
 * ADMIN ONLY
 * ====================================================================== */
export async function createUser(req, res, next) {
    try {
        const user = await UserService.create(req.body);
        res.status(201).json(user);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * PUT /api/users/:id
 * ====================================================================== */
export async function updateUser(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'Invalid user ID' });
        const updated = await UserService.update(id, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * DELETE /api/users/:id
 * ADMIN ONLY
 * ====================================================================== */
export async function deleteUser(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'Invalid user ID' });
        await UserService.remove(id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * PUT /api/users/:id/permissions
 * Requires: requireHierarchyWriteAccess
 * ====================================================================== */
export async function updateUserPermissions(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'Invalid user ID' });
        // Normalize the permissions payload
        const permissions = Array.isArray(req.body?.permissions)
            ? req.body.permissions
            : [];
        const sanitizedPermissions = permissions
            .filter((p) => p && typeof p.categoryId === 'number')
            .map((p) => ({
            categoryId: p.categoryId,
            canBuild: !!p.canBuild,
        }));
        const updated = await UserService.updatePermissions(id, sanitizedPermissions);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
}
/* ======================================================================
 * GET /api/users/:id/audits
 * Admin-only endpoint that returns paginated audit entries for a user
 * ====================================================================== */
export async function getUserAudits(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id))
            return res.status(400).json({ message: 'Invalid user ID' });
        // parse query params
        const limit = Math.max(1, Math.min(200, Number(req.query.limit ?? 25)));
        const offset = Math.max(0, Number(req.query.offset ?? 0));
        const action = typeof req.query.action === 'string' ? req.query.action : undefined;
        const decision = typeof req.query.decision === 'string' ? req.query.decision : undefined;
        const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
        const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
        const { total, items } = await AuditService.queryAudits({
            targetUserId: id,
            action,
            decision,
            startDate,
            endDate,
            limit,
            offset,
        });
        res.json({ total, items });
    }
    catch (err) {
        next(err);
    }
}
