import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const PASSWORD = process.env.PASSWORD || 'Password123!';

// Define the mayors and their cities you want created
const PAYLOAD = [
  { username: 'mayor_a', email: 'mayor_a@example.com', firstName: 'Ava', lastName: 'Mayor', cityName: 'Aveland', country: 'Freedonia' },
  { username: 'mayor_b', email: 'mayor_b@example.com', firstName: 'Ben', lastName: 'Mayor', cityName: 'Benville', country: 'Freedonia' },
  { username: 'mayor_c', email: 'mayor_c@example.com', firstName: 'Cara', lastName: 'Mayor', cityName: 'Caraville', country: 'Freedonia' },
];

async function ensureMayorWithCity(spec) {
  // Find existing mayor by username or email
  let mayor = await prisma.user.findFirst({ where: { OR: [{ username: spec.username }, { email: spec.email }] } });

  if (!mayor) {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    mayor = await prisma.user.create({
      data: {
        username: spec.username,
        email: spec.email,
        firstName: spec.firstName,
        lastName: spec.lastName,
        password: hashed,
        role: 'MAYOR',
      },
    });
    console.log(`Created mayor ${mayor.username} <${mayor.email}> (id=${mayor.id})`);
  } else {
    console.log(`Found existing mayor ${mayor.username} <${mayor.email}> (id=${mayor.id})`);
  }

  // Ensure this mayor has a City (one-to-one)
  const existingCity = await prisma.city.findFirst({ where: { mayorId: mayor.id } });
  if (existingCity) {
    console.log(`Mayor ${mayor.username} already has city '${existingCity.name}' (id=${existingCity.id})`);
    return { mayor, city: existingCity };
  }

  const city = await prisma.city.create({
    data: {
      name: spec.cityName,
      country: spec.country,
      mayorId: mayor.id,
    },
  });
  console.log(`Created city '${city.name}' for mayor ${mayor.username} (city id=${city.id})`);
  return { mayor, city };
}

async function main() {
  try {
    console.log('Creating mayors and linking cities (idempotent). Password for all users:', PASSWORD);
    const results = [];
    for (const spec of PAYLOAD) {
      const r = await ensureMayorWithCity(spec);
      results.push(r);
    }

    console.log('\nSummary:');
    results.forEach((r) => {
      console.log(`Mayor: username=${r.mayor.username} email=${r.mayor.email} password=${PASSWORD} / City: ${r.city.name} (${r.city.country})`);
    });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
