import React from 'react';
import { useDrag } from 'react-dnd';
import { useCity } from '../CityContext';
import { BuildingItemContainer, BuildingImage, PlaceholderDiv } from './styles';

interface BuildingItemProps {
  id: number;
  buildingIndex: number;
  cellIndex: number;
  building: any;
  size: number;
  offset: number;
}

export default function BuildingItem({
  id,
  buildingIndex,
  cellIndex,
  building,
  size,
  offset,
}: BuildingItemProps) {
  const { canEdit } = useCity();
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'MOVE_BUILDING',
      item: { id, sourceIndex: cellIndex, buildingIndex },
      canDrag: () => canEdit,
      collect: (monitor: any) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [id, cellIndex, buildingIndex, canEdit],
  );

  return (
    <BuildingItemContainer ref={drag} offset={offset} buildingIndex={buildingIndex} isDragging={isDragging}>
      {building ? (
        <BuildingImage
          src={(building as any).icon ? (building as any).icon : (building as any).file || ''}
          alt={(building as any).name || ''}
          size={size}
        />
      ) : (
        <PlaceholderDiv size={size} />
      )}
    </BuildingItemContainer>
  );
}