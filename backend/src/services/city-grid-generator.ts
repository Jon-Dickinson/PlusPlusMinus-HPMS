/**
 * Runtime CityGridGenerator
 * This file is a copy of the seeder generator implementation so runtime code
 * can import it from `src/` without leaving the TypeScript `rootDir`.
 */

// Building data structure matching frontend buildings.json
interface Building {
  id: number;
  name: string;
  category: string;
  resources: {
    power?: number;
    powerOutput?: number;
    water?: number;
    waterOutput?: number;
    employment?: number;
    population?: number;
    serviceCoverage?: number;
    foodProduction?: number;
  };
}

const BUILDINGS: Building[] = [
  { id: 1, name: 'Commercial Complex', category: 'commercial', resources: { power: 30, water: 15, employment: 50 } },
  { id: 2, name: 'Emergency Services', category: 'emergency', resources: { power: 20, water: 10, employment: 15, serviceCoverage: 80 } },
  { id: 3, name: 'Factory', category: 'industrial', resources: { power: 50, water: 20, employment: 60 } },
  { id: 4, name: 'Farm', category: 'agriculture', resources: { power: 10, water: 25, employment: 20, foodProduction: 70 } },
  { id: 5, name: 'Government Office', category: 'government', resources: { power: 25, water: 10, employment: 30, serviceCoverage: 80 } },
  { id: 6, name: 'Power Station', category: 'energy', resources: { powerOutput: 250, water: 40, employment: 35 } },
  { id: 7, name: 'Residential Housing', category: 'residential', resources: { power: 80, water: 40, population: 100 } },
  { id: 8, name: 'Water Pump Station', category: 'utilities', resources: { power: 25, waterOutput: 250, employment: 10 } },
];

const HIERARCHY_PERMISSIONS = {
  NATIONAL_LEVEL: 'all',
  CITY_LEVEL: ['commercial', 'emergency', 'energy', 'utilities', 'residential', 'agriculture'],
  SUBURB_LEVEL: ['residential', 'agriculture'],
};

interface CityGridResult {
  gridState: number[][];
  buildingLog: string[];
  qualityIndex: number;
}

export class CityGridGenerator {
  private readonly GRID_SIZE = 100;

  generateCityGrid(hierarchyLevel: number): CityGridResult {
    const allowedBuildings = this.getAllowedBuildings(hierarchyLevel);
    const gridState = this.createEmptyGrid();
    const buildingLog: string[] = [];

    const buildingCounts = this.calculateBuildingCounts(hierarchyLevel);

    this.placeBuildingsInGrid(gridState, allowedBuildings, buildingCounts, buildingLog);

    const qualityIndex = this.calculateQualityIndex(gridState);

    return { gridState, buildingLog: buildingLog.reverse(), qualityIndex };
  }

  public calculateQualityIndexFromGrid(gridState: number[][]): number {
    return this.calculateQualityIndex(gridState);
  }

  private createEmptyGrid(): number[][] {
    return Array.from({ length: this.GRID_SIZE }, () => []);
  }

  private getAllowedBuildings(hierarchyLevel: number): Building[] {
    let allowedCategories: string[];
    switch (hierarchyLevel) {
      case 1:
        return BUILDINGS;
      case 2:
        allowedCategories = HIERARCHY_PERMISSIONS.CITY_LEVEL;
        break;
      case 3:
        allowedCategories = HIERARCHY_PERMISSIONS.SUBURB_LEVEL;
        break;
      default:
        allowedCategories = HIERARCHY_PERMISSIONS.SUBURB_LEVEL;
    }
    return BUILDINGS.filter(b => allowedCategories.includes(b.category));
  }

  private calculateBuildingCounts(hierarchyLevel: number): Record<string, number> {
    switch (hierarchyLevel) {
      case 1:
        return { residential: 8, commercial: 4, industrial: 3, energy: 2, utilities: 2, emergency: 2, government: 2, agriculture: 3 };
      case 2:
        return { residential: 5, commercial: 3, energy: 1, utilities: 1, emergency: 1, agriculture: 4 };
      case 3:
        return { residential: 3, agriculture: 2 };
      default:
        return { residential: 2, agriculture: 1 };
    }
  }

  private placeBuildingsInGrid(gridState: number[][], allowedBuildings: Building[], buildingCounts: Record<string, number>, buildingLog: string[]): void {
    const availableCells = Array.from({ length: this.GRID_SIZE }, (_, i) => i);
    this.shuffleArray(availableCells);
    let cellIndex = 0;

    for (const [category, count] of Object.entries(buildingCounts)) {
      const categoryBuildings = allowedBuildings.filter(b => b.category === category);

      for (let i = 0; i < count && cellIndex < availableCells.length; i++) {
        if (categoryBuildings.length === 0) continue;
        const building = categoryBuildings[Math.floor(Math.random() * categoryBuildings.length)];
        const targetCell = availableCells[cellIndex];
        const instanceCount = Math.random() < 0.3 ? 2 : 1;
        for (let j = 0; j < instanceCount; j++) {
          gridState[targetCell].push(building.id);
          buildingLog.push(building.name.split(' ')[0]);
        }
        cellIndex++;
      }
    }
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private calculateQualityIndex(gridState: number[][]): number {
    const resourceTotals = this.computeTotalsFromGrid(gridState);
    const houses = resourceTotals.population || 0;

    const buildingCount = gridState.reduce((acc, cell) => acc + cell.length, 0);
    if (buildingCount === 0) return 15;

    const powerUsage = resourceTotals.power || 0;
    const powerOutput = resourceTotals.powerOutput || 0;
    const waterUsage = resourceTotals.water || 0;
    const waterOutput = resourceTotals.waterOutput || 0;
    const serviceCoverage = resourceTotals.serviceCoverage || 0;
    const foodProduction = resourceTotals.foodProduction || 0;
    const employed = resourceTotals.employment || 0;

    const powerRatio = this.calculateResourceRatio(powerOutput, powerUsage);
    const waterRatio = this.calculateResourceRatio(waterOutput, waterUsage);
    const serviceRatio = this.calculateResourceRatio(serviceCoverage, houses);
    const foodRatio = this.calculateResourceRatio(foodProduction, houses);

    const adjustedRatios = this.applyEmploymentPenalty(powerRatio, waterRatio, serviceRatio, foodRatio, employed, houses);

    const avgRatio = (adjustedRatios.powerRatio + adjustedRatios.waterRatio + adjustedRatios.serviceRatio + adjustedRatios.foodRatio) / 4;

    const percent = Math.floor(avgRatio * 100);
    return Math.min(100, percent);
  }

  private computeTotalsFromGrid(gridState: number[][]): Record<string, number> {
    const allBuildingIds = gridState.reduce((acc, cell) => acc.concat(cell), [] as number[]);

    return allBuildingIds.reduce((totals: Record<string, number>, buildingId: number) => {
      const building = BUILDINGS.find(b => b.id === buildingId);
      if (!building) return totals;
      for (const [resource, value] of Object.entries(building.resources)) {
        totals[resource] = (totals[resource] || 0) + (value as number);
      }
      return totals;
    }, {});
  }

  private calculateResourceRatio(supply: number, demand: number): number {
    if (demand <= 0) return 1;
    return Math.min(1, supply / demand);
  }

  private applyEmploymentPenalty(powerRatio: number, waterRatio: number, serviceRatio: number, foodRatio: number, employed: number, houses: number) {
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
}
