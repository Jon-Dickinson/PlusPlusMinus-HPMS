import React, { useState, useEffect } from 'react';
import { useCity } from '../CityContext';
import { GridContainer } from './styles';
import GridCell from './GridCell';

interface GridInnerProps {
  children?: React.ReactNode;
}

export default function GridInner({ children }: GridInnerProps) {
  const { grid, addBuildingToCell, moveBuilding } = useCity();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <GridContainer>
        {isClient &&
          grid.map((cell: any, index: number) => (
            <React.Suspense
              key={index}
              fallback={<div style={{ minWidth: 78, minHeight: 78, margin: '2px' }} />}
            >
              <GridCell
                index={index}
                buildings={cell}
                addBuilding={addBuildingToCell}
                moveBuilding={moveBuilding}
              />
            </React.Suspense>
          ))}
      </GridContainer>
      {children}
    </>
  );
}