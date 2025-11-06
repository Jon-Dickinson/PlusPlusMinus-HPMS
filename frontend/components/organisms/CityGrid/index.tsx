import React from 'react';
import GridInner from './GridInner';
import LocalErrorBoundary from './LocalErrorBoundary';

export default function CityGrid() {
  return (
    <LocalErrorBoundary>
      <GridInner />
    </LocalErrorBoundary>
  );
}