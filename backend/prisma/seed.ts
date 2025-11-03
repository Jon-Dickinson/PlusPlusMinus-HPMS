import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Load JSON data
const buildings = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/buildings.json'), 'utf8')
);
const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8')
);

async function main() {
  console.log('🌱 Starting Prisma seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ─────────────── USERS ───────────────
  let admin = await prisma.user.findFirst({ where: ({ username: 'admin' } as any) });
  if (!admin) {
    admin = await prisma.user.create({ data: { firstName: 'Alice', lastName: 'Admin', username: 'admin', email: 'admin@example.com', password: passwordHash, role: 'ADMIN' } as any });
  }

  let mayor = await prisma.user.findFirst({ where: ({ username: 'mayor' } as any) });
  if (!mayor) {
    mayor = await prisma.user.create({ data: { firstName: 'Michael', lastName: 'Mayor', username: 'mayor', email: 'mayor@example.com', password: passwordHash, role: 'MAYOR' } as any });
  }

  // Create a city and assign the mayor
  let sunrise = await prisma.city.findFirst({ where: { name: 'Sunrise Bay' } as any });
  if (!sunrise) {
    sunrise = await prisma.city.create({ data: { name: 'Sunrise Bay', country: 'South Africa', qualityIndex: 42, mayorId: mayor.id, buildingLog: [ 'Placed Residential Block', 'Built Water Plant' ], gridState: null } as any });
  }

  // Create some user notes (Note now belongs to user)
  await prisma.note.create({ data: { userId: mayor.id, content: 'Started developing near the bay area.' } as any });
  await prisma.note.create({ data: { userId: mayor.id, content: 'Next step: expand power generation.' } as any });

  let viewer = await prisma.user.findFirst({ where: ({ username: 'viewer' } as any) });
  if (!viewer) {
    viewer = await prisma.user.create({ data: { firstName: 'Victor', lastName: 'Viewer', username: 'viewer', email: 'viewer@example.com', password: passwordHash, role: 'VIEWER' } as any });
  }

  // ─────────────── CATEGORIES ───────────────
  for (const category of categories) {
    await prisma.buildingCategory.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        description: category.description ?? '',
      },
    });
  }

  // ─────────────── BUILDINGS ───────────────
  for (const b of buildings) {
    const cat = await prisma.buildingCategory.findUnique({
      where: { name: b.category },
    });
    if (!cat) {
      console.warn(`⚠️ Missing category for building ${b.name}`);
      continue;
    }

    // Ensure building exists (use find/create because `name` is not a unique field in schema)
    let building = await prisma.building.findFirst({ where: { name: b.name } });
    if (!building) {
      building = await prisma.building.create({
        data: {
          name: b.name,
          categoryId: cat.id,
          // optional numeric defaults if provided in source data
          level: (b.level as number) || undefined,
          sizeX: (b.sizeX as number) || undefined,
          sizeY: (b.sizeY as number) || undefined,
          powerUsage: (b.powerUsage as number) || undefined,
          powerOutput: (b.powerOutput as number) || undefined,
          waterUsage: (b.waterUsage as number) || undefined,
          waterOutput: (b.waterOutput as number) || undefined,
        },
      });
    }

    // Handle resources -- schema uses `type` and `amount` fields
    if (b.resources) {
      for (const [key, value] of Object.entries(b.resources)) {
        const resType = key;
        const amount = Number(value) || 0;
        const existing = await prisma.buildingResource.findFirst({ where: { buildingId: building.id, type: resType } });
        if (existing) {
          await prisma.buildingResource.update({ where: { id: existing.id }, data: { amount } });
        } else {
          await prisma.buildingResource.create({ data: { buildingId: building.id, type: resType, amount } });
        }
      }
    }
  }

  console.log('✅ Seed completed successfully.');
  console.table([
    { role: 'Admin', username: (admin as any).username || 'admin', password: 'Password123!' },
    { role: 'Mayor', username: (mayor as any).username || 'mayor', password: 'Password123!' },
    { role: 'Viewer', username: (viewer as any).username || 'viewer', password: 'Password123!' },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
