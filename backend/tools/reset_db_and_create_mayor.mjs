import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = process.env.PASSWORD || 'Password123!';

async function clearAll() {
  // Delete in dependency order
  await prisma.buildLog.deleteMany();
  await prisma.buildingResource.deleteMany();
  await prisma.building.deleteMany();
  await prisma.buildingCategory.deleteMany();
  await prisma.note.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  try {
    console.log('Dropping data (deleteMany on all models) — this is irreversible for the current DB');
    await clearAll();

    // Create mayor
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const mayor = await prisma.user.create({
      data: {
        username: 'single_mayor',
        email: 'single_mayor@example.com',
        firstName: 'Solo',
        lastName: 'Mayor',
        password: hashed,
        role: 'MAYOR',
      },
    });

    // Create city for mayor
    const city = await prisma.city.create({
      data: {
        name: 'Singleton',
        country: 'Freedonia',
        mayorId: mayor.id,
      },
    });

    // Create two viewers linked to mayor
    const viewer1 = await prisma.user.create({
      data: {
        username: 'viewer_a',
        email: 'viewer_a@example.com',
        firstName: 'Viewer',
        lastName: 'A',
        password: hashed,
        role: 'VIEWER',
        mayorId: mayor.id,
      },
    });

    const viewer2 = await prisma.user.create({
      data: {
        username: 'viewer_b',
        email: 'viewer_b@example.com',
        firstName: 'Viewer',
        lastName: 'B',
        password: hashed,
        role: 'VIEWER',
        mayorId: mayor.id,
      },
    });

    console.log('\nCreated accounts:');
    console.log(`Mayor: username=${mayor.username} email=${mayor.email} password=${PASSWORD}`);
    console.log(`Viewer 1: username=${viewer1.username} email=${viewer1.email} password=${PASSWORD}`);
    console.log(`Viewer 2: username=${viewer2.username} email=${viewer2.email} password=${PASSWORD}`);

  } catch (e) {
    console.error('Error during reset/create:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
