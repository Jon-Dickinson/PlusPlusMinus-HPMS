import { useCity } from './CityContext';
import React from 'react';
import styled from 'styled-components';
import { Zap, Droplet, Home, Wrench, Leaf } from 'lucide-react';
import { CityTotals } from '../../types/city';

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding-top: 10px;
`;

const Card = styled.div<{ warn?: boolean }>`
  height: calc((100vh - 60px) / 6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 18px;
  margin: 12px 20px;
  min-width: 360px;
  border-radius: 5px;
  transition: filter 0.2s ease-in-out, border-color 0.15s ease-in-out;
  border: 2px solid #0068FF;
  background-color: #ffffff;

  ${({ warn }) =>
    warn &&
    `
      border-color: #ef4444;
    `}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const IconWrapper = styled.div<{ color?: string }>`
  color: ${({ color }) => color || '#000'};
  svg {
    width: 28px;
    height: 28px;
    stroke-width: 2;
  }
`;

const Title = styled.h3`
  font-weight: 600;
  font-size: 14px;
  color: #111;
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #111;
`;

const Stat = styled.span<{ color?: string; outlined?: boolean; outlineColor?: string }>`
  color: ${({ color }) => color || '#000'};
  ${({ outlined, outlineColor }) =>
    outlined &&
    `
      border: 1px solid ${outlineColor || '#ef4444'};
      border-radius: 8px;
      padding: 2px 6px;
    `}
`;

const getSafeTotals = (maybe: Partial<CityTotals> | undefined): CityTotals => ({
  powerUsage: maybe?.powerUsage ?? 0,
  powerOutput: maybe?.powerOutput ?? 0,
  waterUsage: maybe?.waterUsage ?? 0,
  waterOutput: maybe?.waterOutput ?? 0,
  houses: maybe?.houses ?? 0,
  employed: maybe?.employed ?? 0,
  capacity: maybe?.capacity ?? 0,
  foodProduction: maybe?.foodProduction ?? 0,
  qualityIndex: maybe?.qualityIndex ?? 0,
});

export default function StatsPanel(): JSX.Element {
  const { totals, getTotals } = useCity();
  const raw = (typeof getTotals === 'function' ? getTotals() : totals) as Partial<CityTotals> | undefined;
  const t = getSafeTotals(raw);

  const powerOver = t.powerUsage > t.powerOutput;
  const waterOver = t.waterUsage > t.waterOutput;
  const serviceShort = t.capacity < t.houses;
  const foodShort = t.foodProduction < t.houses;

  return (
    <Panel>
      {/* ────────── POWER ────────── */}
      <Card warn={powerOver}>
        <Header>
          <Title>Power</Title>
          <IconWrapper color="#FFD52B">
            <Zap />
          </IconWrapper>
        </Header>
        <StatsRow>
       
          <Stat>Output: {t.powerOutput.toLocaleString()}</Stat>
           <Stat color={powerOver ? '#ef4444' : '#16a34a'}>
            Usage: {t.powerUsage.toLocaleString()}
          </Stat>
        </StatsRow>
      </Card>

      {/* ────────── WATER ────────── */}
      <Card warn={waterOver}>
        <Header>
          <Title>Water</Title>
          <IconWrapper color="#0068FF">
            <Droplet />
          </IconWrapper>
        </Header>
        <StatsRow>
          
          <Stat>Output: {t.waterOutput.toLocaleString()}</Stat>
        <Stat color={waterOver ? '#ef4444' : '#0ea5e9'}>
            Usage: {t.waterUsage.toLocaleString()}
          </Stat>
        </StatsRow>
      </Card>

      {/* ────────── POPULATION ────────── */}
      <Card warn={serviceShort}>
        <Header>
          <Title>Population</Title>
          <IconWrapper color="#2FBF4A">
            <Home />
          </IconWrapper>
        </Header>
        <StatsRow>
          <Stat outlined outlineColor={serviceShort ? '#ef4444' : '#16a34a'}>
            Houses: {t.houses.toLocaleString()}
          </Stat>
          <Stat>Employed: {t.employed.toLocaleString()}</Stat>
        </StatsRow>
      </Card>

      {/* ────────── SERVICES ────────── */}
      <Card>
        <Header>
          <Title>Services</Title>
          <IconWrapper color="#EE3E36">
            <Wrench />
          </IconWrapper>
        </Header>
        <StatsRow>
          <Stat color={serviceShort ? '#ef4444' : '#0ea5e9'}>
            Capacity: {t.capacity.toLocaleString()}
          </Stat>
          <Stat color="#ef4444">
            Quality Index: {Math.round(t.qualityIndex)}%
          </Stat>
        </StatsRow>
      </Card>

      {/* ────────── FOOD ────────── */}
      <Card warn={foodShort}>
        <Header>
          <Title>Food</Title>
          <IconWrapper color="#704214">
            <Leaf />
          </IconWrapper>
        </Header>
        <StatsRow>
          <Stat color={foodShort ? '#ef4444' : '#16a34a'}>
            Production: {t.foodProduction.toLocaleString()}
          </Stat>
          <Stat>Demand: {t.houses.toLocaleString()}</Stat>
        </StatsRow>
      </Card>
    </Panel>
  );
}
