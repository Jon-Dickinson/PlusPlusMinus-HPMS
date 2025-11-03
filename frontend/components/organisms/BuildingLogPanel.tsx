import React from 'react';
import styled from 'styled-components';
import { useCity } from './CityContext';

const LogBoxHeading = styled.h4`
  color: #ffffff;
  margin: 20px 0 10px;
  font-weight: 400;
`;

const LogBox = styled.div`
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;
  padding: 1rem;
  color: #ffffff;
  overflow-y: auto;
  max-height: 50vh;
`;

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
