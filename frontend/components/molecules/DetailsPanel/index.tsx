import React from 'react';
import { Details } from './styles';

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