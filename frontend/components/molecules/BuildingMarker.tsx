import React from 'react';
import styled from 'styled-components';

type Building = { name?: string; file?: string };
type Placement = { id?: number; buildingId: number; gx: number; gy: number };

export default function BuildingMarker({
  p,
  b,
  isoX,
  isoY,
  imgSrc,
  onClick,
}: {
  p: Placement;
  b?: Building;
  isoX: number;
  isoY: number;
  imgSrc?: string;
  onClick?: (p: Placement) => void;
}) {
  return (
    <Placed
      key={`${p.buildingId}-${p.gx}-${p.gy}-${p.id ?? ''}`}
      style={{ left: `calc(50% + ${isoX}px)`, top: `${isoY}px` }}
      onClick={() => onClick?.(p)}
      title={b?.name}
    >
      <Img src={imgSrc || b?.file} alt={b?.name} />
    </Placed>
  );
}

const Placed = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 3;
  cursor: pointer;
  transition: transform 120ms ease, filter 120ms ease;
  &:hover {
    transform: translate(-50%, -100%) scale(1.03);
    filter: drop-shadow(0 8px 16px rgba(2, 6, 23, 0.12));
  }
`;

const Img = styled.img`
  width: auto;
  height: auto;
  display: block;
  pointer-events: none;
`;
