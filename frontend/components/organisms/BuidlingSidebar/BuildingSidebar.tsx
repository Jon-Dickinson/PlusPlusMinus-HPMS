'use client';

import React from 'react';
import buildings from '../../../data/buildings.json';
import { LeftColumn } from './styles';
import DraggableBuilding from '../DraggableBuilding';

export default function BuildingSidebar() {
  return (
    <LeftColumn>
      {buildings.map((b: any) => (
        <DraggableBuilding key={b.id} building={b} />
      ))}
    </LeftColumn>
  );
}
