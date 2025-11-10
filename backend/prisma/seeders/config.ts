/**
 * Seed Configuration
 * 
 * This file contains all the configuration settings and constants
 * used throughout the seeding process.
 */

export const SEED_CONFIG = {
  // Default password for all test users
  DEFAULT_PASSWORD: 'Password123!',
  
  // Number of users to create at each level
  USER_COUNTS: {
    ADMIN: 1,
    NATIONAL_MAYORS: 2,
    CITY_MAYORS_PER_CITY: 2,
    SUBURB_MAYORS_PER_SUBURB: 2,
    VIEWERS: 5
  },
  
  // Hierarchy structure
  HIERARCHY: {
    NATIONAL: { level: 1, name: 'National' },
    CITY: { level: 2, cities: ['City A', 'City B'] },
    SUBURB: { 
      level: 3, 
      suburbs: [
        { name: 'Suburb A1', parentCity: 'City A' },
        { name: 'Suburb A2', parentCity: 'City A' },
        { name: 'Suburb B1', parentCity: 'City B' },
        { name: 'Suburb B2', parentCity: 'City B' }
      ]
    }
  },
  
  // Building permissions by hierarchy level
  BUILDING_PERMISSIONS: {
    NATIONAL_LEVEL: 'all', // All building categories
    CITY_LEVEL: ['commercial', 'emergency', 'energy', 'utilities', 'residential', 'agriculture'],
    SUBURB_LEVEL: ['residential', 'agriculture']
  },
  
  // Demo city settings
  CITY_SETTINGS: {
    DEFAULT_COUNTRY: 'Demo Country',
    QUALITY_INDEX_RANGE: { min: 0, max: 100 },
    INITIAL_GRID_STATE: {},
    INITIAL_BUILDING_LOG: []
  }
} as const;

export type SeedConfig = typeof SEED_CONFIG;