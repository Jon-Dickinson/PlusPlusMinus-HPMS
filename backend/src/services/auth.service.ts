import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

type RegisterInput = { name: string; email: string; password: string; roleName?: string; structureId?: number | null };

export async function registerUser(input: RegisterInput) {
  const { name, email, password, roleName, structureId } = input;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, structureId: structureId ?? null },
  });

  // If a roleName was provided, link the role to the user
  if (roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // cleanup created user to avoid orphaned account
      await prisma.user.delete({ where: { id: user.id } });
      throw new Error(`Role not found: ${roleName}`);
    }

    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  const token = await generateTokenForUser(user.id);
  return { user, token };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const token = await generateTokenForUser(user.id);
  return { user, token };
}

async function generateTokenForUser(userId: number) {
  // load roles for token claims
  const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } });
  const roleNames = roles.map((r: { role: { name: string } }) => r.role.name);

  const payload = { sub: userId, roles: roleNames };
  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
  const token = jwt.sign(payload as Record<string, unknown>, JWT_SECRET as Secret, signOptions);
  return token;
}

export { JWT_SECRET };