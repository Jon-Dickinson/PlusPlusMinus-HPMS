// CityContext.tsx
import React, { createContext, useContext, useState } from 'react';
import buildings from '../../data/buildings.json';

type Totals = Record<string, number>;

export type Cell = number[];

 type CityContextType = {
  grid: number[][];
  // Returns true when a building was added, false when rejected (different type present)
  addBuildingToCell: (index: number, buildingId: number) => boolean;
    // Move a single building instance from one cell to another. Returns true when moved.
    moveBuilding: (sourceIndex: number, destIndex: number, buildingId: number) => boolean;
  getTotals: () => Totals;
  totals: Totals;
};

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  // create distinct arrays for each cell
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: 100 }, () => []));
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
    // return computed totals (keeps a stable, up-to-date value)
    return totals;
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
