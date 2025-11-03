import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    const raw = fs.readFileSync(new URL('../prisma/data/buildings.json', import.meta.url));
    const buildings = JSON.parse(raw.toString());
    console.log('Seeding', buildings.length, 'buildings');

    const names = Array.from(new Set(buildings.map(b=>b.category).filter(Boolean)));
    const categoryMap = {};
    for (const name of names) {
      let rec = await prisma.buildingCategory.findFirst({ where: { name } });
      if (!rec) rec = await prisma.buildingCategory.create({ data: { name } });
      categoryMap[name] = rec;
    }

    for (const b of buildings) {
      const category = categoryMap[b.category] ?? (await prisma.buildingCategory.upsert({ where: { name: b.category || 'Uncategorized' }, update: {}, create: { name: b.category || 'Uncategorized' } }));
      const where = { name: b.name, categoryId: category.id };
      let building = await prisma.building.findFirst({ where });
      if (!building) {
        building = await prisma.building.create({ data: { name: b.name, color: b.color ?? '#000', icon: b.icon ?? '', categoryId: category.id } });
      }
      const resources = b.resources || {};
      for (const key of Object.keys(resources)) {
        const value = Number(resources[key] ?? 0);
        const r = await prisma.buildingResource.findFirst({ where: { buildingId: building.id, key } });
        if (!r) {
          await prisma.buildingResource.create({ data: { buildingId: building.id, key, value } });
        } else {
          await prisma.buildingResource.update({ where: { id: r.id }, data: { value } });
        }
      }
    }

    console.log('✅ Simple seed complete');
  } catch (e) {
    console.error('Simple seed failed', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
