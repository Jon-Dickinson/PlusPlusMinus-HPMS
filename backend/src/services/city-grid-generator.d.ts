export declare class CityGridGenerator {
  generateCityGrid(level: number): { gridState: number[][]; buildingLog: string[]; qualityIndex: number };
  calculateQualityIndexFromGrid(gridState: number[][]): number;
}
