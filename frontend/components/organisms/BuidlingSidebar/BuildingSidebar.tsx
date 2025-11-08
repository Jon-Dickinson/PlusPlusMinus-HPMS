'use client';

import React from 'react';
import buildings from '../../../data/buildings.json';
import { LeftColumn } from './styles';
import DraggableBuilding from '../DraggableBuilding';

export default function BuildingSidebar() {
  return (
    <LeftColumn>
      {buildings.map((building: any) => (
        <DraggableBuilding key={building.id} building={building} />
      ))}
    </LeftColumn>
  );
}
