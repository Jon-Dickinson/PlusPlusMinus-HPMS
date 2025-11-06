import React, { createContext, useContext, useEffect } from 'react';
import { CityContextType, CityProviderProps } from './types';
import { normalizeTotals } from './utils';
import { loadCityData } from './api';
import { useGridOperations } from './hooks';

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({
  children,
  initialCityData,
  canEdit = false,
}: CityProviderProps) {
  const {
    grid,
    totals,
    buildingLog,
    addBuildingToCell,
    moveBuilding,
    clearBuildingLog,
    initializeGrid,
  } = useGridOperations(canEdit);

  // Initialize from initialCityData if provided
  useEffect(() => {
    if (initialCityData?.gridState && Array.isArray(initialCityData.gridState) && initialCityData.gridState.every(Array.isArray)) {
      const initialBuildingLog = initialCityData?.buildingLog || [];
      initializeGrid(initialCityData.gridState, initialBuildingLog);
    }
  }, [initialCityData, initializeGrid]);

  // Load data from API if city ID is provided
  useEffect(() => {
    if (initialCityData?.id) {
      loadCityData(initialCityData.id)
        .then(data => {
          if (data.gridState && Array.isArray(data.gridState)) {
            const apiBuildingLog = data.buildingLog && Array.isArray(data.buildingLog) ? data.buildingLog : [];
            initializeGrid(data.gridState, apiBuildingLog);
          }
        })
        .catch(error => {
          console.error('Failed to load city data', error);
        });
    }
  }, [initialCityData?.id, initializeGrid]);

  function getTotals() {
    // return computed totals in the CityTotals shape (derived from raw resource totals)
    return normalizeTotals(totals, grid);
  }

  return (
    <CityContext.Provider
      value={{
        grid,
        addBuildingToCell,
        moveBuilding,
        getTotals,
        totals,
        buildingLog,
        clearBuildingLog,
        canEdit,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity(): CityContextType {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within a CityProvider');
  return ctx;
}