/**
 * Main Seed Orchestrator
 * 
 * Coordinates all seeding operations in the correct order:
 * 1. Hierarchy Levels
 * 2. Users 
 * 3. Cities
 * 4. Buildings & Categories
 * 5. Building Permissions
 * 6. Summary Report
 */

/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { HierarchySeeder } from './seeders/hierarchy.seeder.js';
import { UserSeeder } from './seeders/user-assets/user.seeder.js';
import { CitySeeder } from './seeders/city-assets/city.seeder.js';
import { BuildingSeeder } from './seeders/city-assets/building.seeder.js';
import { SummaryReporter } from './seeders/summary.reporter.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Initialize all seeders
    const hierarchySeeder = new HierarchySeeder(prisma);
    const userSeeder = new UserSeeder(prisma);
    const citySeeder = new CitySeeder(prisma);
    const buildingSeeder = new BuildingSeeder(prisma);
    const summaryReporter = new SummaryReporter(prisma);

    // Step 1: Create hierarchy structure
    console.log('STEP 1: Setting up hierarchy structure...');
    const hierarchyData = await hierarchySeeder.seedHierarchy();
    console.log('Hierarchy structure created successfully\n');

    // Step 2: Create users
    console.log('STEP 2: Creating user accounts...');
    const users = await userSeeder.seedUsers(hierarchyData);
    console.log('User accounts created successfully\n');

    // Step 3: Create cities for mayors
    console.log('STEP 3: Creating cities for mayors...');
    const cities = await citySeeder.seedCities(users, hierarchyData);
    console.log('Cities created successfully\n');

    // Step 4: Setup buildings and categories
    console.log('STEP 4: Setting up buildings and categories...');
    await buildingSeeder.seedBuildings();
    console.log('Buildings and categories setup successfully\n');

    // Step 5: Assign building permissions
    console.log('STEP 5: Assigning building permissions...');
    await buildingSeeder.seedBuildingPermissions(users);
    console.log('Building permissions assigned successfully\n');

    // Step 6: Generate summary report
    console.log('STEP 6: Generating summary report...');
    await summaryReporter.generateSeedSummary(users, cities);

    console.log('\n' + '='.repeat(60));
    console.log('SEED PROCESS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Seed process failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Fatal error during seed process:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  });