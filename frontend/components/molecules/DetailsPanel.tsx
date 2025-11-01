import React from 'react';
import styled from 'styled-components';

type Building = { name?: string; stats?: Record<string, any> };
type Placement = { id?: number; buildingId: number; gx: number; gy: number };

export default function DetailsPanel({
  selected,
  getBuilding,
  onClose,
}: {
  selected: Placement | null;
  getBuilding: (id: number) => Building | undefined;
  onClose: () => void;
}) {
  if (!selected) return null;
  const building = getBuilding(selected.buildingId);
  return (
    <Details role="dialog">
      <button onClick={onClose}>Close</button>
      <h3>{building?.name}</h3>
      <div>
        Coords: {selected.gx}, {selected.gy}
      </div>
      <pre>{JSON.stringify(building?.stats ?? {}, null, 2)}</pre>
    </Details>
  );
}

const Details = styled.aside`
  position: absolute;
  right: 18px;
  top: 18px;
  width: 320px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.12);
  z-index: 30;
  pre {
    white-space: pre-wrap;
    font-size: 12px;
  }
`;
