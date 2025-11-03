import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
  const users = await prisma.user.findMany({ select: { id: true, username: true, firstName: true, lastName: true } });
  console.log(JSON.stringify({ users }, null, 2));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await prisma.$disconnect();
  }
})();
