import { PrismaClient } from '@prisma/client';

async function checkMultipleCities() {
  const prisma = new PrismaClient();
  
  try {
    const cities = await prisma.city.findMany({
      include: { mayor: true },
      take: 5
    });
    
    cities.forEach((city, index) => {
      console.log(`\n=== CITY ${index + 1} ===`);
      console.log('City Name:', city.name);
      console.log('Mayor:', city.mayor?.firstName, city.mayor?.lastName);
      console.log('Quality Index:', city.qualityIndex);
      
      try {
        const gridData = JSON.parse(city.gridState);
        const buildingLog = JSON.parse(city.buildingLog);
        
        console.log('Total Grid Cells:', gridData.length);
        console.log('Occupied Cells:', gridData.filter(cell => cell.length > 0).length);
        console.log('Total Buildings Placed:', gridData.reduce((acc, cell) => acc + cell.length, 0));
        console.log('Building Types in Log:', buildingLog.slice(0, 5), '...'); // First 5 buildings
      } catch (e) {
        console.log('Failed to parse city data');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMultipleCities();