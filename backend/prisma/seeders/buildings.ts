import { PrismaClient } from '@prisma/client';
import { parseSize } from './parseSize.js';
import { asNumber } from './utils.js';

export async function seedBuildings(prisma: PrismaClient, buildingJson: any[], categoryMap: Record<string, any>) {
  const created: any[] = [];

  for (const b of buildingJson) {
    const categoryName = b.category || 'Uncategorized';
    const category = categoryMap[categoryName];
    const size = parseSize(b.size || b.footprint || '1 x 1 - 1');

    // Try to avoid duplicates by name + category
    let existing = await prisma.building.findFirst({
      where: { name: b.name, categoryId: category?.id ?? undefined },
    });

    if (!existing) {
      existing = await prisma.building.create({
        data: {
          name: b.name,
          file: b.file || null,
          categoryId: category?.id ?? null,
          sizeX: size.x,
          sizeY: size.y,
          blocks: size.blocks,
          employs: asNumber(b.employs, 0),
          houses: asNumber(b.houses, 0),
          services: asNumber(b.services, 0),
          waterUsage: asNumber(b.waterUsage, 0),
          powerUsage: asNumber(b.powerUsage, 0),
          powerOutput: asNumber(b.powerOutput, 0),
          waterOutput: asNumber(b.waterOutput, 0),
          feeds: asNumber(b.feeds, 0),
        },
      });
    }

    created.push(existing);
  }

  return created;
}
