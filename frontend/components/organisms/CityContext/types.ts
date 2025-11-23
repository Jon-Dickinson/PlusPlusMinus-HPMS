import { CityTotals } from '../../../types/city';

export type Cell = number[];

export type Totals = Record<string, number>;

export type CityContextType = {
  grid: number[][];
  // Returns true when a building was added, false when rejected (different type present)
  addBuildingToCell: (index: number, buildingId: number) => boolean;
  // Move a single building instance from one cell to another. Returns true when moved.
  moveBuilding: (sourceIndex: number, destIndex: number, buildingId: number) => boolean;
  // Remove a single instance of a building from the given source cell
  removeBuildingFromCell: (sourceIndex: number, buildingId: number) => boolean;
  // returns a normalized CityTotals shape for UI consumers
  getTotals: () => CityTotals;
  // raw resource totals map (kept for other consumers that index by resource keys)
  totals: Totals;
  // a running log of placed building types (strings)
  buildingLog: string[];
  // clear the building log
  clearBuildingLog: () => void;
  // Allows consumers to re-initialize the grid (e.g. after a save)
  initializeGrid: (initialGrid: number[][], initialBuildingLog?: string[]) => void;
  // True while CityProvider is fetching/initializing data from API
  isLoading: boolean;
  canEdit: boolean;
};

export interface CityProviderProps {
  children: React.ReactNode;
  initialCityData?: any;
  canEdit?: boolean;
}