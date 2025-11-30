export const BUILDING_PERMISSIONS = {
  NATIONAL_LEVEL: 'all' as const,
  CITY_LEVEL: ['commercial', 'emergency', 'energy', 'utilities', 'residential', 'agriculture'] as const,
  SUBURB_LEVEL: ['residential', 'agriculture'] as const,
} as const;

export type BuildingPermissions = typeof BUILDING_PERMISSIONS;
