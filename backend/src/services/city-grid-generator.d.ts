export declare class CityGridGenerator {
  /**
   * Generate a full city grid for the given hierarchy level.
   *
   * @param level - 1 = National, 2 = City, 3 = Suburb
   * @returns An object containing:
   *   - gridState: a 2D grid mapping building IDs into each cell
   *   - buildingLog: history of placed buildings
   *   - qualityIndex: number from 0–100 representing infrastructure quality
   */
  generateCityGrid(
    level: number
  ): {
    gridState: number[][];
    buildingLog: string[];
    qualityIndex: number;
  };

  /**
   * Calculates the quality index (0–100) from an existing gridState.
   */
  calculateQualityIndexFromGrid(gridState: number[][]): number;
}
