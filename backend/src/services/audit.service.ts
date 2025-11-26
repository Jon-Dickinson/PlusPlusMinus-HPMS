import { prisma } from '../db.js';

export interface AuditQueryOptions {
  targetUserId?: number;
  action?: string;
  decision?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export async function queryAudits(opts: AuditQueryOptions) {
  const { targetUserId, action, decision, startDate, endDate, limit = 25, offset = 0 } = opts;

  const where: any = {};
  if (typeof targetUserId !== 'undefined') where.targetUserId = targetUserId;
  if (action) where.action = action;
  if (decision) where.decision = decision;
  if (startDate || endDate) where.createdAt = {} as any;
  if (startDate) where.createdAt.gte = new Date(startDate);
  if (endDate) where.createdAt.lte = new Date(endDate);

  // Avoid opening a DB transaction for read-only queries — run in parallel
  const [items, total] = await Promise.all([
    prisma.permissionQueryAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        callerId: true,
        callerRole: true,
        targetUserId: true,
        targetRole: true,
        categoryId: true,
        endpoint: true,
        action: true,
        decision: true,
        reason: true,
        durationMs: true,
        requestId: true,
        createdAt: true,
      },
    }),
    prisma.permissionQueryAudit.count({ where }),
  ]);

  return { total, items };
}

export async function createAudit(payload: any) {
  // Simple creation helper. Payload should be sanitized by caller.
  return prisma.permissionQueryAudit.create({ data: payload });
}
