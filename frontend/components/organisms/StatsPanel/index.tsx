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
  const safeTotals = getSafeTotals(raw);

  return (
    <Panel>
      <PowerStatCard powerOutput={safeTotals.powerOutput} powerUsage={safeTotals.powerUsage} />
      <WaterStatCard waterOutput={safeTotals.waterOutput} waterUsage={safeTotals.waterUsage} />
      <PopulationStatCard houses={safeTotals.houses} employed={safeTotals.employed} />
      <ServicesStatCard capacity={safeTotals.capacity} houses={safeTotals.houses} qualityIndex={safeTotals.qualityIndex} />
      <FoodStatCard foodProduction={safeTotals.foodProduction} houses={safeTotals.houses} />
    </Panel>
  );
}