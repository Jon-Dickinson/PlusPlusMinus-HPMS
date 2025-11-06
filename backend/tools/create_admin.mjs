import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = process.env.EMAIL || 'admin@example.com';
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'Password123!';

async function main() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashed, role: 'ADMIN', username: USERNAME },
      });
      console.log(`Updated existing admin: ${EMAIL} (username set to ${USERNAME})`);
    } else {
      const u = await prisma.user.create({
        data: {
          username: USERNAME,
          email: EMAIL,
          firstName: 'Admin',
          lastName: 'User',
          password: hashed,
          role: 'ADMIN',
        },
      });
      console.log(`Created admin user: ${u.username} <${u.email}> (id=${u.id})`);
    }

    console.log(`Credentials: email=${EMAIL} username=${USERNAME} password=${PASSWORD}`);
  } catch (e) {
    console.error('Error creating admin:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
