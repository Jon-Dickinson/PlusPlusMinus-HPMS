import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

router.get('/me', verifyToken, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  res.json({ user });
});

// Example: admin-only user list
router.get('/admin/list', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  res.json({ users });
});

export default router;
