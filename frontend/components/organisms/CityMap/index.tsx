// CityMap.tsx
// Reworked: the old isometric city map has been replaced with a grid-based CityBuilder.
// This file now exports a simple wrapper so consumers (e.g. `pages/dashboard.tsx`) can
// continue importing `CityMap` while the implementation uses the new grid components.

'use client';

import React from 'react';
import CityGrid from '../CityGrid';
import styled from 'styled-components';

export default function CityMap() {
  return (
    <Wrap>
      <GridContainer>
        <CityGrid />
      </GridContainer>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  display: flex;
  z-index: 1000;
`;

const GridContainer = styled.div`
  display: flex;
  padding: 0;
`;