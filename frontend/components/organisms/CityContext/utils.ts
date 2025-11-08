import { CityTotals } from '../../../types/city';
import { Totals } from './types';
import buildings from '../../../data/buildings.json';

export function computeTotalsFromGrid(grid: number[][]): Totals {
  if (!Array.isArray(grid) || !grid.every(Array.isArray)) return {};
  return grid.reduce((acc, arr) => acc.concat(arr), []).reduce((acc: Totals, id: number) => {
    const building: any = buildings.find((building: any) => building.id === id) || {};
    const resources: Record<string, number> = building.resources || {};
    for (const [key, val] of Object.entries(resources)) {
      acc[key] = (acc[key] || 0) + (val as number);
    }
    return acc;
  }, {} as Totals);
}

function calculateResourceRatio(supply: number, demand: number): number {
  if (demand <= 0) return 1;
  return Math.min(1, supply / demand);
}

function applyEmploymentPenalty(
  powerRatio: number,
  waterRatio: number,
  serviceRatio: number,
  foodRatio: number,
  employed: number,
  houses: number
): { powerRatio: number; waterRatio: number; serviceRatio: number; foodRatio: number } {
  if (employed <= houses || employed <= 0) {
    return { powerRatio, waterRatio, serviceRatio, foodRatio };
  }

  const penalty = houses / employed;
  return {
    powerRatio: powerRatio * penalty,
    waterRatio: waterRatio * penalty,
    serviceRatio: serviceRatio * penalty,
    foodRatio: foodRatio * penalty,
  };
}

function calculateQualityIndex(resourceTotals: Totals, houses: number): number {
  const powerUsage = resourceTotals['power'] || 0;
  const powerOutput = resourceTotals['powerOutput'] || 0;
  const waterUsage = resourceTotals['water'] || 0;
  const waterOutput = resourceTotals['waterOutput'] || 0;
  const serviceCoverage = resourceTotals['serviceCoverage'] || 0;
  const foodProduction = resourceTotals['foodProduction'] || 0;
  const employed = resourceTotals['employment'] || 0;

  let powerRatio = calculateResourceRatio(powerOutput, powerUsage);
  let waterRatio = calculateResourceRatio(waterOutput, waterUsage);
  let serviceRatio = calculateResourceRatio(serviceCoverage, houses);
  let foodRatio = calculateResourceRatio(foodProduction, houses);

  const adjustedRatios = applyEmploymentPenalty(
    powerRatio,
    waterRatio,
    serviceRatio,
    foodRatio,
    employed,
    houses
  );

  const avgRatio = (adjustedRatios.powerRatio + adjustedRatios.waterRatio + adjustedRatios.serviceRatio + adjustedRatios.foodRatio) / 4;
  const percent = Math.floor(avgRatio * 100);
  return Math.max(0, Math.min(100, percent));
}

// normalize resource keys from building definitions to the CityTotals shape
export function normalizeTotals(resourceTotals: Totals, grid: number[][]): CityTotals {
  if (!Array.isArray(grid) || !grid.every(Array.isArray)) {
    return createEmptyCityTotals();
  }

  const buildingCount = grid.reduce((acc, arr) => acc.concat(arr), []).length;
  const serviceCoverage = resourceTotals['serviceCoverage'] || 0;
  const foodProduction = resourceTotals['foodProduction'] || 0;
  const houses = resourceTotals['population'] || 0;

  // If there are no buildings yet, treat quality as 0% (default)
  if (buildingCount === 0) {
    return createEmptyCityTotals();
  }

  const normalized: CityTotals = {
    powerUsage: resourceTotals['power'] || 0,
    powerOutput: resourceTotals['powerOutput'] || 0,
    waterUsage: resourceTotals['water'] || 0,
    waterOutput: resourceTotals['waterOutput'] || 0,
    houses: houses,
    employed: resourceTotals['employment'] || 0,
    capacity: serviceCoverage,
    foodProduction: foodProduction,
    qualityIndex: calculateQualityIndex(resourceTotals, houses),
  };

  return normalized;
}

function createEmptyCityTotals(): CityTotals {
  return {
    powerUsage: 0,
    powerOutput: 0,
    waterUsage: 0,
    waterOutput: 0,
    houses: 0,
    employed: 0,
    capacity: 0,
    foodProduction: 0,
    qualityIndex: 0,
  };
}