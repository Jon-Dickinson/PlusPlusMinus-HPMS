import { PrismaClient } from '@prisma/client';

async function checkCityData() {
  const prisma = new PrismaClient();
  
  try {
    const city = await prisma.city.findFirst({
      include: { mayor: true }
    });
    
    console.log('City Name:', city?.name);
    console.log('Mayor:', city?.mayor?.firstName, city?.mayor?.lastName);
    console.log('Quality Index:', city?.qualityIndex);
    console.log('Grid State Type:', typeof city?.gridState);
    console.log('Grid State:', city?.gridState);
    console.log('Building Log Type:', typeof city?.buildingLog);
    console.log('Building Log:', city?.buildingLog);
    
    // Try to parse the JSON
    if (city?.gridState) {
      try {
        const gridData = JSON.parse(city.gridState);
        console.log('Parsed Grid Data:', gridData);
        console.log('Grid length:', Array.isArray(gridData) ? gridData.length : 'Not an array');
      } catch (e) {
        console.log('Failed to parse grid state as JSON:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCityData();