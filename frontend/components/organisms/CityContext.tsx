// CityContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { CityTotals } from '../../types/city';
import buildings from '../../data/buildings.json';

type Totals = Record<string, number>;

export type Cell = number[];

type CityContextType = {
  grid: number[][];
  // Returns true when a building was added, false when rejected (different type present)
  addBuildingToCell: (index: number, buildingId: number) => boolean;
  // Move a single building instance from one cell to another. Returns true when moved.
  moveBuilding: (sourceIndex: number, destIndex: number, buildingId: number) => boolean;
  // returns a normalized CityTotals shape for UI consumers
  getTotals: () => CityTotals;
  // raw resource totals map (kept for other consumers that index by resource keys)
  totals: Totals;
};

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  // create distinct arrays for each cell
  // Start with 36 base cells (6x6). User requested 50 more blocks — add 50
  // extra empty cells so the grid grows without losing existing placements.
  const INITIAL_CELLS = 36 + 50; // 86 total
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: INITIAL_CELLS }, () => []));
  const [totals, setTotals] = useState<Totals>({});

  function computeTotalsFromGrid(g: number[][]) {
    return g.flat().reduce((acc: Totals, id: number) => {
      const b: any = buildings.find((b: any) => b.id === id) || {};
      const resources: Record<string, number> = b.resources || {};
      for (const [key, val] of Object.entries(resources)) {
        acc[key] = (acc[key] || 0) + (val as number);
      }
      return acc;
    }, {} as Totals);
  }

  // normalize resource keys from building definitions to the CityTotals shape
  function normalizeTotals(resourceTotals: Totals, g: number[][]): CityTotals {
    const buildingCount = g.flat().length;
    const serviceCoverage = resourceTotals['serviceCoverage'] || 0;
    const foodProduction = resourceTotals['foodProduction'] || 0;
    const houses = resourceTotals['population'] || 0;

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

  function addBuildingToCell(index: number, buildingId: number) {
    let added = false;
    setGrid((prev: number[][]) => {
      const next = prev.map((cell: number[], i: number) => {
        if (i !== index) return cell;
        // if the cell is empty, always allow
        if (!cell || cell.length === 0) {
          added = true;
          return [buildingId];
        }
        // allow only if all existing buildings in the cell are the same type
        const sameType = cell.every((id) => id === buildingId);
        if (sameType) {
          added = true;
          return [...cell, buildingId];
        }
        // reject adding a different building type into an occupied cell
        return cell;
      });
      if (added) {
        // update totals immediately based on new grid
        setTotals(computeTotalsFromGrid(next));
      }
      return next;
    });
    return added;
  }

  function moveBuilding(sourceIndex: number, destIndex: number, buildingId: number) {
    let moved = false;
    setGrid((prev: number[][]) => {
      // shallow copy each cell
      const next = prev.map((c) => [...c]);

      const srcCell = next[sourceIndex] || [];
      const destCell = next[destIndex] || [];

      // ensure source actually contains the building
      const srcPos = srcCell.lastIndexOf(buildingId);
      if (srcPos === -1) return prev;

      // destination rules: allow if empty or contains same type
      if (destCell.length > 0 && !destCell.every((id) => id === buildingId)) {
        return prev;
      }

      // remove one instance from source
      srcCell.splice(srcPos, 1);

      // add to destination
      destCell.push(buildingId);

      // write back
      next[sourceIndex] = srcCell;
      next[destIndex] = destCell;

      moved = true;
      // update totals immediately
      setTotals(computeTotalsFromGrid(next));
      return next;
    });
    return moved;
  }

  function getTotals() {
    // return computed totals in the CityTotals shape (derived from raw resource totals)
    return normalizeTotals(totals, grid);
  }

  return (
    <CityContext.Provider value={{ grid, addBuildingToCell, moveBuilding, getTotals, totals }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity(): CityContextType {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within a CityProvider');
  return ctx;
}
