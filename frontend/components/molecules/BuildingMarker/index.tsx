import React from 'react';
import { Placed, Img } from './styles';

type Building = { name?: string; file?: string };
type Placement = { id?: number; buildingId: number; gx: number; gy: number };

export default function BuildingMarker({
  placement,
  building,
  isoX,
  isoY,
  imgSrc,
  onClick,
}: {
  placement: Placement;
  building?: Building;
  isoX: number;
  isoY: number;
  imgSrc?: string;
  onClick?: (placement: Placement) => void;
}) {
  return (
    <Placed
      key={`${placement.buildingId}-${placement.gx}-${placement.gy}-${placement.id ?? ''}`}
      style={{ left: `calc(50% + ${isoX}px)`, top: `${isoY}px` }}
      onClick={() => onClick?.(placement)}
      title={building?.name}
    >
      <Img src={imgSrc || building?.file} alt={building?.name} />
    </Placed>
  );
}