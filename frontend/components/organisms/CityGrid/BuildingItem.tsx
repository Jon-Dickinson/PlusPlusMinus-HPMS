import React from 'react';
import useBuildingDrag from './useBuildingDrag';
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
  const { canEdit, removeBuildingFromCell } = useCity();
  const [{ isDragging }, drag] = useBuildingDrag({ id, cellIndex, buildingIndex, canEdit, removeBuildingFromCell });

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