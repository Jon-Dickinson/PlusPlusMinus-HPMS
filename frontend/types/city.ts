// Centralized types for city-wide data
export interface CityTotals {
  powerUsage: number;
  powerOutput: number;
  waterUsage: number;
  waterOutput: number;
  houses: number;
  employed: number;
  capacity: number;
  qualityIndex: number;
  foodProduction: number;
}

export type City = {
  id: number;
  name: string;
  country: string;
  mayorId: number;
  gridState: any;
  buildingLog: any;
}
