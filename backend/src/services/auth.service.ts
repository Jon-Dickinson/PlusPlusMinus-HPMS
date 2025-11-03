import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function register(data: {
  firstName: string; lastName: string; username: string; email: string; password: string;
  role: 'MAYOR'|'VIEWER'; cityName?: string; country?: string;
}) {
  const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
  if (existingUsername) throw new Error('Username already exists');

  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new Error('Email already exists');

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: hashed,
      role: data.role,
    },
  });

  if (data.role === 'MAYOR') {
    if (!data.cityName || !data.country) throw new Error('cityName and country required for MAYOR');
    await prisma.city.create({
      data: {
        name: data.cityName,
        country: data.country,
        mayorId: user.id,
      },
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, role: user.role } };
}

export async function login({ username, email, password }: { username?: string; email?: string; password?: string }) {
  if (!password) throw new Error('Password is required');
  if (!username && !email) throw new Error('Username or email is required');

  const where = username ? { username } : { email };
  const user = await prisma.user.findFirst({
    where,
    include: {
      city: true,
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}
