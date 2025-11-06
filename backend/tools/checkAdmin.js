import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    console.log('Found user:', user);
  } catch (err) {
    console.error('Error querying user:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
