import { CityTotals } from '../../../types/city';

export const getSafeTotals = (maybe: Partial<CityTotals> | undefined): CityTotals => ({
  powerUsage: maybe?.powerUsage ?? 0,
  powerOutput: maybe?.powerOutput ?? 0,
  waterUsage: maybe?.waterUsage ?? 0,
  waterOutput: maybe?.waterOutput ?? 0,
  houses: maybe?.houses ?? 0,
  employed: maybe?.employed ?? 0,
  capacity: maybe?.capacity ?? 0,
  foodProduction: maybe?.foodProduction ?? 0,
  qualityIndex: maybe?.qualityIndex ?? 0,
});