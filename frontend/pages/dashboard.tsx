import React, { useEffect, useState } from 'react';
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
`;

const RightColumn = styled.div`
  position: relative;
  padding-top: 100px;
  right: 0;
  width: 500px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
  box-sizing: border-box;
`;

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  height: 100%;
  width: 100%;
  padding: 20px;
`;

const SliderContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 1200;
  overflow: visible;
`;

const VerticalRange = styled.input.attrs({ type: 'range' })`
  transform: rotate(-90deg);
  transform-origin: center;
  width: 160px;
  height: 28px;
  display: block;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  overflow: visible;

  &::-webkit-slider-runnable-track {
    height: 6px;
    background: #e1e1e1;
    border-radius: 3px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #004aee;
    border-radius: 50%;
    margin-top: -5px;
    border: none;
  }

  &::-moz-range-track {
    height: 6px;
    background: #e1e1e1;
    border-radius: 3px;
  }
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #004aee;
    border-radius: 50%;
    border: none;
  }

  &:focus {
    outline: none;
  }
`;

export default function Dashboard() {
  const { user } = useAuth();
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);

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
          <RightColumn>
            <StatsPanel />
          </RightColumn>
          <BuildingSidebar />
          <MapPanel>{user && <CityMap scale={scale} />}</MapPanel>

          <SliderContainer>
            <VerticalRange
              min={50}
              max={150}
              step={1}
              value={Math.round(scale * 100)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setScale(Number(e.currentTarget.value) / 100)
              }
              aria-label="Map scale"
            />
          </SliderContainer>
        </CityProvider>
      </MapWrap>
    </MainTemplate>
  );
}
