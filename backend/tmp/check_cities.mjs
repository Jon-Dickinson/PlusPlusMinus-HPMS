import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCities() {
  try {
    const cities = await prisma.city.findMany({
      include: {
        mayor: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            hierarchy: {
              select: {
                name: true,
                level: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${cities.length} cities in the database:`);
    
    if (cities.length > 0) {
      console.table(cities.map(city => ({
        cityName: city.name,
        mayorName: `${city.mayor.firstName} ${city.mayor.lastName}`,
        mayorUsername: city.mayor.username,
        hierarchyLevel: city.mayor.hierarchy?.name || 'Unknown',
        qualityIndex: Math.round(city.qualityIndex * 100) / 100
      })));
    } else {
      console.log('No cities found. There might be an issue with the city seeder.');
      
      // Let's check if mayors exist
      const mayors = await prisma.user.findMany({
        where: { role: 'MAYOR' },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          hierarchyId: true
        }
      });
      
      console.log(`Found ${mayors.length} mayors without cities:`);
      mayors.forEach(mayor => {
        console.log(`- ${mayor.username}: ${mayor.firstName} ${mayor.lastName} (hierarchy: ${mayor.hierarchyId})`);
      });
    }

  } catch (error) {
    console.error('Error checking cities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCities();