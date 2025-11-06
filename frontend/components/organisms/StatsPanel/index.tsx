import React from 'react';
import { useCity } from '../CityContext';
import { Panel } from './styles';
import { getSafeTotals } from './utils';
import {
  PowerStatCard,
  WaterStatCard,
  PopulationStatCard,
  ServicesStatCard,
  FoodStatCard,
} from './StatCard';

export default function StatsPanel(): JSX.Element {
  const { totals, getTotals } = useCity();
  const raw = (typeof getTotals === 'function' ? getTotals() : totals) as any;
  const t = getSafeTotals(raw);

  return (
    <Panel>
      <PowerStatCard powerOutput={t.powerOutput} powerUsage={t.powerUsage} />
      <WaterStatCard waterOutput={t.waterOutput} waterUsage={t.waterUsage} />
      <PopulationStatCard houses={t.houses} employed={t.employed} />
      <ServicesStatCard capacity={t.capacity} houses={t.houses} qualityIndex={t.qualityIndex} />
      <FoodStatCard foodProduction={t.foodProduction} houses={t.houses} />
    </Panel>
  );
}