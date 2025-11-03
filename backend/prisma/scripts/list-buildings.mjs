import { PrismaClient } from '@prisma/client';
(async () => {
  const prisma = new PrismaClient();
  try {
    const list = await prisma.building.findMany({ orderBy: { id: 'asc' } });
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
