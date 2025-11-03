const {PrismaClient} = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  console.log(Object.keys(p).sort());
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
