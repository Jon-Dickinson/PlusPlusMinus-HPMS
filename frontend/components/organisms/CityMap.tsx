// CityMap.tsx
// Reworked: the old isometric city map has been replaced with a grid-based CityBuilder.
// This file now exports a simple wrapper so consumers (e.g. `pages/dashboard.tsx`) can
// continue importing `CityMap` while the implementation uses the new grid components.

'use client';

import React from 'react';
import CityGrid from './CityGrid';
import styled from 'styled-components';

export default function CityMap({ scale = 1 }: { scale?: number }) {
  return (
    <Wrap>
      <ScaleWrap style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <GridContainer>
          <CityGrid />
        </GridContainer>
      </ScaleWrap>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScaleWrap = styled.div`
  width: 100%;
`;

const GridContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
`;
