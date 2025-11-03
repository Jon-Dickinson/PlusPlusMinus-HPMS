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
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
      nationality: 'United Kingdom',
      homeCity: 'London',
    },
  });

  const mayor = await prisma.user.upsert({
    where: { email: 'mayor@example.com' },
    update: {},
    create: {
      firstName: 'Michael',
      lastName: 'Mayor',
      email: 'mayor@example.com',
      password: passwordHash,
      role: 'MAYOR',
      nationality: 'South Africa',
      homeCity: 'Cape Town',
      cities: {
        create: {
          name: 'Sunrise Bay',
          country: 'South Africa',
          population: 300,
          powerUsage: 150,
          waterUsage: 120,
          resourceLimit: 1000,
          buildLogs: {
            create: [
              { action: 'Placed Residential Block', value: 100 },
              { action: 'Built Water Plant', value: 50 },
            ],
          },
          notes: {
            create: [
              { content: 'Started developing near the bay area.' },
              { content: 'Next step: expand power generation.' },
            ],
          },
        },
      },
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      firstName: 'Victor',
      lastName: 'Viewer',
      email: 'viewer@example.com',
      password: passwordHash,
      role: 'VIEWER',
      nationality: 'USA',
      homeCity: 'Boston',
    },
  });

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
    { role: 'Admin', email: admin.email, password: 'Password123!' },
    { role: 'Mayor', email: mayor.email, password: 'Password123!' },
    { role: 'Viewer', email: viewer.email, password: 'Password123!' },
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
