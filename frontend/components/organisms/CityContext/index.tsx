import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
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
    removeBuildingFromCell,
  } = useGridOperations(canEdit);

  const [isLoading, setIsLoading] = useState(false);

  // Initialize from initialCityData if provided
  useEffect(() => {
    if (initialCityData?.gridState && Array.isArray(initialCityData.gridState) && initialCityData.gridState.every(Array.isArray)) {
      const initialBuildingLog = initialCityData?.buildingLog || [];
      initializeGrid(initialCityData.gridState, initialBuildingLog);
      setIsLoading(false);
    }
  }, [initialCityData, initializeGrid]);

  // Load data from API if city ID is provided
  useEffect(() => {
    if (initialCityData?.id) {
      setIsLoading(true);
      loadCityData(String(initialCityData.id))
        .then(data => {
          if (data.gridState && Array.isArray(data.gridState)) {
            const apiBuildingLog = data.buildingLog && Array.isArray(data.buildingLog) ? data.buildingLog : [];
            // Avoid overwriting an already-initialized non-empty grid with an empty payload
            if (grid.length > 0 && (Array.isArray(data.gridState) && data.gridState.length === 0)) {
              // keep existing grid
            } else {
              initializeGrid(data.gridState, apiBuildingLog);
            }
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Failed to load city data', error);
          setIsLoading(false);
        });
    }
  }, [initialCityData?.id, initializeGrid]);

  // If no initialCityData was passed but the authenticated user has a city,
  // fetch that city so Mayors (City/National/Suburb) see their data on refresh.
  const { user } = useAuth();
  useEffect(() => {
    if (!initialCityData?.id && user?.city?.id) {
      setIsLoading(true);
      loadCityData(String(user.city.id))
        .then(data => {
          if (data.gridState && Array.isArray(data.gridState)) {
            const apiBuildingLog = data.buildingLog && Array.isArray(data.buildingLog) ? data.buildingLog : [];
            // Avoid overwriting an already-initialized non-empty grid with an empty payload
            if (grid.length > 0 && (Array.isArray(data.gridState) && data.gridState.length === 0)) {
              // keep existing grid
            } else {
              initializeGrid(data.gridState, apiBuildingLog);
            }
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Failed to load city data for authenticated user', error);
          setIsLoading(false);
        });
    }
  }, [initialCityData?.id, user?.city?.id, initializeGrid]);

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
        removeBuildingFromCell,
        initializeGrid,
        getTotals,
        totals,
        buildingLog,
        clearBuildingLog,
        isLoading,
        canEdit,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity(): CityContextType {
  const cityContext = useContext(CityContext);
  if (!cityContext) throw new Error('useCity must be used within a CityProvider');
  return cityContext;
}