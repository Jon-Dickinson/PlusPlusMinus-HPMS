import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';

/**
 * Allow access to a target user's subordinate listing only if:
 * - requester is ADMIN, OR
 * - requester is the same user (owner), OR
 * - requester is an ancestor in the hierarchy of the target user
 */
export async function requireHierarchyReadAccess(req: Request, res: Response, next: NextFunction) {
  const caller = (req as any).user;
  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  // Admins can always proceed
  if (caller.role === 'ADMIN') return next();

  const targetUserId = Number(req.params.userId);
  if (!targetUserId) return res.status(400).json({ error: 'Invalid user id' });

  // Allow owner
  if (caller.id === targetUserId) return next();

  // Load both users' hierarchy assignments
  const [callerUser, targetUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: caller.id }, select: { hierarchyId: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { hierarchyId: true } })
  ]);

  if (!callerUser) return res.status(401).json({ error: 'Caller user not found' });
  if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

  if (!callerUser.hierarchyId || !targetUser.hierarchyId) {
    return res.status(403).json({ error: 'Hierarchy assignment missing' });
  }

  // If caller is ancestor of target - allow
  const isAncestor = await checkIsAncestor(callerUser.hierarchyId, targetUser.hierarchyId);
  if (isAncestor) return next();

  return res.status(403).json({ error: 'Forbidden' });
}

export async function requireHierarchyWriteAccess(req: Request, res: Response, next: NextFunction) {
  // For write access we'll follow the same rules as read: ADMIN OR owner OR ancestor
  // This allows mayors who are ancestors to manage subordinate users.
  const caller = (req as any).user;
  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  if (caller.role === 'ADMIN') return next();

  const targetUserId = Number(req.params.id || req.params.userId);
  if (!targetUserId) return res.status(400).json({ error: 'Invalid user id' });

  if (caller.id === targetUserId) return next();

  const [callerUser, targetUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: caller.id }, select: { hierarchyId: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { hierarchyId: true } })
  ]);

  if (!callerUser) return res.status(401).json({ error: 'Caller user not found' });
  if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

  if (!callerUser.hierarchyId || !targetUser.hierarchyId) {
    return res.status(403).json({ error: 'Hierarchy assignment missing' });
  }

  const isAncestor = await checkIsAncestor(callerUser.hierarchyId, targetUser.hierarchyId);
  if (isAncestor) return next();

  return res.status(403).json({ error: 'Forbidden' });
}

async function checkIsAncestor(candidateAncestorId: number, targetId: number): Promise<boolean> {
  // Walk down the tree starting from the candidate to see if we reach target
  // Start from the candidate's children — a node is not an ancestor of itself
  const children = await prisma.hierarchyLevel.findMany({ where: { parentId: candidateAncestorId }, select: { id: true } });
  const stack = children.map(c => c.id);
  while (stack.length) {
    const current = stack.pop() as number;
    if (current === targetId) return true;

    const children = await prisma.hierarchyLevel.findMany({ where: { parentId: current }, select: { id: true } });
    for (const c of children) stack.push(c.id);
  }

  return false;
}

export default requireHierarchyReadAccess;
