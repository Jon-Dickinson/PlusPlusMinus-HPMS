import React from 'react';
import { useCity } from '../CityContext';
import { LogBoxHeading, LogBox } from './styles';

export default function BuildingLogPanel() {
  const { buildingLog } = useCity();

  return (
    <>
      <LogBoxHeading>Building Log</LogBoxHeading>
      <LogBox>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {buildingLog && buildingLog.length > 0 ? (
            buildingLog.map((label, idx) => (
              <li key={idx} style={{ fontSize: 13, padding: '0.25rem 0' }}>
                {label}
              </li>
            ))
          ) : (
            <li style={{ fontSize: 13, padding: '0.25rem 0', opacity: 0.6 }}>No placements yet</li>
          )}
        </ul>
      </LogBox>
    </>
  );
}