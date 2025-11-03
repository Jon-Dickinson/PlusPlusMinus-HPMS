import { PrismaClient } from '@prisma/client';
(async() => {
  const p = new PrismaClient();
  try {
    const r = await p.buildingCategory.findFirst({ where: { name: 'commercial' } });
    console.log('OK', r);
  } catch(e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
})();
