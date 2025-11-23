import { useState, useCallback } from 'react';
import { Cell, Totals } from './types';
import { computeTotalsFromGrid } from './utils';
import buildings from '../../../data/buildings.json';

export function useGridOperations(canEdit: boolean) {
  const INITIAL_CELLS = 100; // default grid size

  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: INITIAL_CELLS }, () => [])
  );

  const [totals, setTotals] = useState<Totals>({});

  const [buildingLog, setBuildingLog] = useState<string[]>([]);

  const addBuildingToCell = useCallback((index: number, buildingId: number): boolean => {
    if (!canEdit) return false;
    let added = false;
    setGrid((prev: number[][]) => {
      const next = prev.map((cell: number[], cellIndex: number) => {
        if (cellIndex !== index) return cell;
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
        // record placed building in the building log (single-word label)
        try {
          const building: any = buildings.find((building: any) => building.id === buildingId) || null;
          const label = building && building.name ? String(building.name).split(/\s+/)[0] : String(buildingId);
          setBuildingLog((prevLog) => [label, ...prevLog]);
        } catch (error) {
          // ignore logging errors
        }
      }
      return next;
    });
    return added;
  }, [canEdit]);

  const moveBuilding = useCallback((sourceIndex: number, destIndex: number, buildingId: number): boolean => {
    if (!canEdit) return false;
    let moved = false;
    setGrid((prev: number[][]) => {
      // shallow copy each cell
      const next = prev.map((cell) => [...cell]);

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
  }, [canEdit]);

  const removeBuildingFromCell = useCallback((sourceIndex: number, buildingId: number): boolean => {
    if (!canEdit) return false;
    let removed = false;
    setGrid((prev: number[][]) => {
      const next = prev.map((cell) => [...cell]);
      const srcCell = next[sourceIndex] || [];

      // find last instance index of buildingId
      const srcPos = srcCell.lastIndexOf(buildingId);
      if (srcPos === -1) return prev; // nothing to remove

      srcCell.splice(srcPos, 1);
      next[sourceIndex] = srcCell;
      removed = true;

      if (removed) {
        setTotals(computeTotalsFromGrid(next));
      }

      return next;
    });

    return removed;
  }, [canEdit]);

  const clearBuildingLog = useCallback(() => {
    setBuildingLog([]);
  }, []);

  const initializeGrid = useCallback((initialGrid: number[][], initialBuildingLog: string[] = []) => {
    setGrid(initialGrid);
    setTotals(computeTotalsFromGrid(initialGrid));
    setBuildingLog(initialBuildingLog);
  }, []);

  return {
    grid,
    totals,
    buildingLog,
    addBuildingToCell,
    moveBuilding,
    removeBuildingFromCell,
    clearBuildingLog,
    initializeGrid,
  };
}