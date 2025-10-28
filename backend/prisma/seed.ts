// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash example passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const standardPassword = await bcrypt.hash('Standard@123', 10);
  const basicPassword = await bcrypt.hash('Basic@123', 10);

  // Create or update users (idempotent)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'standard@example.com' },
    update: {},
    create: {
      name: 'Standard User',
      email: 'standard@example.com',
      passwordHash: standardPassword,
      role: 'STANDARD',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'basic@example.com' },
    update: {},
    create: {
      name: 'Basic User',
      email: 'basic@example.com',
      passwordHash: basicPassword,
      role: 'BASIC',
      isActive: true,
    },
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
