import React, { useState, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useCity } from '../CityContext';
import { CellContainer, CountIndicator } from './styles';
import BuildingItem from './BuildingItem';
import buildings from '../../../data/buildings.json';

interface GridCellProps {
  index: number;
  buildings: any[];
  addBuilding: (index: number, id: number) => boolean;
  moveBuilding: (src: number, dest: number, id: number) => boolean;
}

function buildingsLookup(id: any) {
  return buildings.find((b: any) => b.id === id) || null;
}

export default function GridCell({
  index,
  buildings: cellBuildings,
  addBuilding,
  moveBuilding,
}: GridCellProps) {
  const { canEdit } = useCity();
  const [isBouncing, setIsBouncing] = useState(false);

  const dropConfig = useMemo(() => ({
    accept: ['BUILDING', 'MOVE_BUILDING'],
    canDrop: () => canEdit,
    drop: (item: any) => {
      
      if (typeof item?.sourceIndex === 'number') {
        const ok = moveBuilding(item.sourceIndex, index, item.id);
        if (ok) {
          setIsBouncing(true);
          setTimeout(() => setIsBouncing(false), 360);
        }
        return;
      }

      const ok = addBuilding(index, item.id);
      if (ok) {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 360);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('city:update'));
        }
      }
    },
    collect: (monitor: any) => ({ isOver: !!monitor.isOver() }),
  }), [canEdit, index, addBuilding, moveBuilding]);

  const [{ isOver }, drop] = useDrop(dropConfig);

  const topId = cellBuildings && cellBuildings.length > 0 ? cellBuildings[cellBuildings.length - 1] : null;
  const topBuilding = topId ? buildingsLookup(topId) : null;

  return (
    <CellContainer ref={drop} isOver={isOver} className={isBouncing ? 'cell-bounce' : ''}>
      {cellBuildings && cellBuildings.length > 0
        ? cellBuildings.map((id: number, idx: number) => {
            const building = buildingsLookup(id);
            const size = 48;
            const offset = idx * 14;
            return (
              <BuildingItem
                key={idx}
                id={id}
                buildingIndex={idx}
                cellIndex={index}
                building={building}
                size={size}
                offset={offset}
              />
            );
          })
        : null}

      {!topBuilding && cellBuildings.length > 0 && (
        <CountIndicator>{`${cellBuildings.length}x`}</CountIndicator>
      )}
    </CellContainer>
  );
}