import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient, buildingJson: any[]) {
  const names = Array.from(new Set(buildingJson.map((b) => b.category).filter(Boolean)));
  const map: Record<string, { id: number; name: string }> = {};

  for (const name of names) {
    if (!name) continue;
    // try find existing
    let rec = await prisma.buildingCategory.findFirst({ where: { name } });
    if (!rec) {
      rec = await prisma.buildingCategory.create({ data: { name } });
    }
    map[name] = { id: rec.id, name: rec.name };
  }

  return map;
}
