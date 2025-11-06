/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting inline Prisma seed...');

  const PASSWORD = process.env.SEED_PASSWORD || 'Password123!';
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Ensure Admin (idempotent)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });
  console.log(`Ensured admin: ${admin.username} <${admin.email}>`);

  // Ensure Mayor (single_mayor) and attach a City (Singleton)
  const mayor = await prisma.user.upsert({
    where: { username: 'single_mayor' },
    update: {
      email: 'single_mayor@example.com',
      password: passwordHash,
      role: 'MAYOR',
      firstName: 'Solo',
      lastName: 'Mayor',
    },
    create: {
      username: 'single_mayor',
      email: 'single_mayor@example.com',
      password: passwordHash,
      role: 'MAYOR',
      firstName: 'Solo',
      lastName: 'Mayor',
    },
  });
  console.log(`Ensured mayor: ${mayor.username} <${mayor.email}>`);

  // City has unique mayorId in schema — use upsert by mayorId
  await prisma.city.upsert({
    where: { mayorId: mayor.id },
    update: { name: 'Singleton', country: 'Freedonia' },
    create: { name: 'Singleton', country: 'Freedonia', mayorId: mayor.id },
  });
  console.log(`Ensured city 'Singleton' for mayor ${mayor.username}`);

  // Ensure two viewers linked to single_mayor
  const viewerA = await prisma.user.upsert({
    where: { username: 'viewer_a' },
    update: {
      email: 'viewer_a@example.com',
      password: passwordHash,
      role: 'VIEWER',
      firstName: 'Viewer',
      lastName: 'A',
      mayorId: mayor.id,
    },
    create: {
      username: 'viewer_a',
      email: 'viewer_a@example.com',
      password: passwordHash,
      role: 'VIEWER',
      firstName: 'Viewer',
      lastName: 'A',
      mayorId: mayor.id,
    },
  });
  console.log(`Ensured viewer: ${viewerA.username} linked to mayor ${mayor.username}`);

  const viewerB = await prisma.user.upsert({
    where: { username: 'viewer_b' },
    update: {
      email: 'viewer_b@example.com',
      password: passwordHash,
      role: 'VIEWER',
      firstName: 'Viewer',
      lastName: 'B',
      mayorId: mayor.id,
    },
    create: {
      username: 'viewer_b',
      email: 'viewer_b@example.com',
      password: passwordHash,
      role: 'VIEWER',
      firstName: 'Viewer',
      lastName: 'B',
      mayorId: mayor.id,
    },
  });
  console.log(`Ensured viewer: ${viewerB.username} linked to mayor ${mayor.username}`);

  console.log('\n✅ Inline seed completed successfully.');
  console.table([
    { role: 'Admin', username: admin.username, email: admin.email, password: PASSWORD },
    { role: 'Mayor', username: mayor.username, email: mayor.email, password: PASSWORD },
    { role: 'Viewer 1', username: viewerA.username, email: viewerA.email, password: PASSWORD },
    { role: 'Viewer 2', username: viewerB.username, email: viewerB.email, password: PASSWORD },
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
 