import React, { useState, useEffect } from 'react';
import { useCity } from '../CityContext';
import { GridContainer, PlaceholderBox } from './styles';
import DragDestroyLayer from './DragDestroyLayer';
import GridCell from './GridCell';

interface GridInnerProps {
  children?: React.ReactNode;
}

export default function GridInner({ children }: GridInnerProps) {
  const { grid, addBuildingToCell, moveBuilding, isLoading } = useCity();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <GridContainer>
        {isClient ? (
          isLoading ? (
            Array.from({ length: grid.length || 100 }).map((_, index) => (
              <PlaceholderBox key={index} />
            ))
          ) : (
            grid.map((cell: any, index: number) => (
              <React.Suspense key={index} fallback={<PlaceholderBox />}>
                <GridCell
                  index={index}
                  buildings={cell}
                  addBuilding={addBuildingToCell}
                  moveBuilding={moveBuilding}
                />
              </React.Suspense>
            ))
          )
        ) : null}
      </GridContainer>
      {children}
      <DragDestroyLayer />
    </>
  );
}