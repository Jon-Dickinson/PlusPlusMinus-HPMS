import { CityTotals } from '../../../types/city';
import { Totals } from './types';
import buildings from '../../../data/buildings.json';

export function computeTotalsFromGrid(g: number[][]): Totals {
  if (!Array.isArray(g) || !g.every(Array.isArray)) return {};
  return g.reduce((acc, arr) => acc.concat(arr), []).reduce((acc: Totals, id: number) => {
    const b: any = buildings.find((b: any) => b.id === id) || {};
    const resources: Record<string, number> = b.resources || {};
    for (const [key, val] of Object.entries(resources)) {
      acc[key] = (acc[key] || 0) + (val as number);
    }
    return acc;
  }, {} as Totals);
}

// normalize resource keys from building definitions to the CityTotals shape
export function normalizeTotals(resourceTotals: Totals, g: number[][]): CityTotals {
  if (!Array.isArray(g) || !g.every(Array.isArray)) {
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
  const buildingCount = g.reduce((acc, arr) => acc.concat(arr), []).length;
  const serviceCoverage = resourceTotals['serviceCoverage'] || 0;
  const foodProduction = resourceTotals['foodProduction'] || 0;
  const houses = resourceTotals['population'] || 0;

  // If there are no buildings yet, treat quality as 0% (default)
  if (buildingCount === 0) {
    const empty: CityTotals = {
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
    return empty;
  }

  const normalized: CityTotals = {
    powerUsage: resourceTotals['power'] || 0,
    powerOutput: resourceTotals['powerOutput'] || 0,
    waterUsage: resourceTotals['water'] || 0,
    waterOutput: resourceTotals['waterOutput'] || 0,
    houses: houses,
    employed: resourceTotals['employment'] || 0,
    capacity: serviceCoverage,
    // food production
    foodProduction: foodProduction,
    // derive a more intuitive quality index (0-100) by averaging key adequacy scores:
    // - power: output vs usage
    // - water: output vs usage
    // - services: capacity vs houses
    // - food: production vs houses
    // Each sub-score is 0..100, where 100 means supply meets or exceeds demand.
    qualityIndex: (() => {
      // compute adequacy as decimals (0..1) to avoid early rounding artifacts
      const powerUsage = resourceTotals['power'] || 0;
      const powerOutput = resourceTotals['powerOutput'] || 0;
      const waterUsage = resourceTotals['water'] || 0;
      const waterOutput = resourceTotals['waterOutput'] || 0;

      let powerRatio = powerUsage <= 0 ? 1 : Math.min(1, powerOutput / powerUsage);
      let waterRatio = waterUsage <= 0 ? 1 : Math.min(1, waterOutput / waterUsage);

      let serviceRatio = houses <= 0 ? 1 : Math.min(1, serviceCoverage / houses);
      let foodRatio = houses <= 0 ? 1 : Math.min(1, foodProduction / houses);

      // If employment exceeds housing, apply a proportional penalty
      // so that over-employment reduces available adequacy across systems.
      const employed = resourceTotals['employment'] || 0;
      if (employed > houses && employed > 0) {
        const penalty = houses / employed; // value < 1
        powerRatio = powerRatio * penalty;
        waterRatio = waterRatio * penalty;
        serviceRatio = serviceRatio * penalty;
        foodRatio = foodRatio * penalty;
      }

      // average the ratios and convert to 0..100, use floor so a 99.5% average becomes 99%
      const avgRatio = (powerRatio + waterRatio + serviceRatio + foodRatio) / 4;
      const percent = Math.floor(avgRatio * 100);
      return Math.max(0, Math.min(100, percent));
    })(),
  };

  return normalized;
}