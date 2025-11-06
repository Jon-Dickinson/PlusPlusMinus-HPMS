import React from 'react';
import styled from 'styled-components';
// Grid overlay inlined from previous GridMap component (removed redundancy)
import BuildingMarker from './BuildingMarker';

type Building = { name?: string; file?: string };
type Placement = { id?: number; buildingId: number; gx: number; gy: number };
type RenderedItem = { p: Placement; b?: Building; isoX: number; isoY: number; imgSrc?: string };

export default function MapView({
  gridCols,
  gridRows,
  areaW,
  areaH,
  rendered,
  onSelect,
  scale = 1,
}: {
  gridCols: number;
  gridRows: number;
  areaW: number;
  areaH: number;
  rendered: RenderedItem[];
  onSelect: (p: Placement) => void;
  scale?: number;
}) {
  const cells = Array.from({ length: gridCols * gridRows });

  return (
    <Scale $scale={scale}>
      <GridOverlay />
      <PlacementBounds $w={areaW} $h={areaH} />
      <GridCells $cols={gridCols} $rows={gridRows} $w={areaW} $h={areaH}>
        {cells.map((_, i) => (
          <Cell key={i} />
        ))}
      </GridCells>
      <MapArea>
        {rendered.map(({ p, b, isoX, isoY, imgSrc }) => (
          <BuildingMarker
            key={p.id ?? `${p.buildingId}-${p.gx}-${p.gy}`}
            p={p}
            b={b}
            isoX={isoX}
            isoY={isoY}
            imgSrc={imgSrc}
            onClick={onSelect}
          />
        ))}
      </MapArea>
    </Scale>
  );
}

const Scale = styled.div<{ $scale: number }>`
  position: relative;
  left: 50%;
  top: 50%;
  transform: ${(p) => `translate(-50%, -50%) scale(${p.$scale})`};
  width: 100%;
  height: 420px;
  overflow: visible;
`;

const GridOverlay = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: 100%;
  height: 540px;
  background-size: contain;
  background-image: url('/grid.svg');
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: none;
  user-select: none;
`;

/* Slider UI has been moved to the parent container (e.g. CityMap or Dashboard).
   MapView only accepts a `scale` prop to control the visual scale. */

const MapArea = styled.div`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 420px;
  overflow: visible;
  border: 1px solid red;
`;

const GridCells = styled.div<{ $cols: number; $rows: number; $w: number; $h: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
  display: grid;
  grid-template-columns: ${(p) => `repeat(${p.$cols}, 1fr)`};
  grid-template-rows: ${(p) => `repeat(${p.$rows}, 1fr)`};
  z-index: 2;
  pointer-events: none;
`;

const Cell = styled.div`
  box-sizing: border-box;
`;

const PlacementBounds = styled.div<{ $w: number; $h: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 1px solid red;
  z-index: 2;
  pointer-events: none;
`;
