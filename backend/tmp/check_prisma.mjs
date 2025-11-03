import { PrismaClient } from '@prisma/client';
(async () => {
  const p = new PrismaClient();
  console.log(Object.keys(p).sort());
  await p.$disconnect();
})();
