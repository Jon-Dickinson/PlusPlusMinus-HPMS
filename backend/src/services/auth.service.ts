import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// UserRole may not be exported from @prisma/client in this setup; use string literals for role defaults

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export async function register(data: any) {
  if (!data.password) throw new Error('Password is required');
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { ...data, password: hashed, role: data.role ?? 'VIEWER' },
  });
  return sanitizeUser(user);
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
  return token;
}
