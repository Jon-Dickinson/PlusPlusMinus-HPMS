const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const b = await prisma.building.findFirst({ where: { id: 1 } });
    console.log(JSON.stringify(b, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
