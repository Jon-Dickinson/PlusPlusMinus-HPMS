import React, { useEffect } from 'react';
import MainTemplate from '../templates/MainTemplate';
import CityMap from '../components/organisms/CityMap';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import BuildingSidebar from '../components/organisms/BuildingSidebar';
import { CityProvider } from '../components/organisms/CityContext';
import Link from 'next/link';
import StatsPanel from '../components/organisms/StatsPanel';

const MapWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0ff;
`;

const Sidebar = styled.div`
  position: relative;
  padding-top: 60px;
    align-items: center;
  justify-content: center;
  flex: 0 0 10%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  height: 100%;
  width: 100%;
`;


export default function Dashboard() {
  const { user } = useAuth();
  const [serverTime, setServerTime] = React.useState<string | null>(null);

  useEffect(() => {
    // example call to backend
    axios.instance
      .get('/buildings')
      .then(() => setServerTime(new Date().toISOString()))
      .catch(() => {});
  }, []);

  return (
    <MainTemplate>
      <MapWrap>
        <CityProvider>
          <Sidebar>
            <StatsPanel />
         
          
            </Sidebar>
            <BuildingSidebar />
          <MapPanel>{user && <CityMap />}</MapPanel>
        </CityProvider>
      </MapWrap>
    </MainTemplate>
  );
}
