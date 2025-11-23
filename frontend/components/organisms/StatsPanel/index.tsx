export { default as StatCard } from './StatCard';
export { createStatCard } from './createStatCard';

// Configs
export { powerConfig } from './configs/power';
export { waterConfig } from './configs/water';
export { populationConfig } from './configs/population';
export { servicesConfig } from './configs/services';
export { foodConfig } from './configs/food';

// Pre-built components
import { createStatCard } from './createStatCard';

import { powerConfig } from './configs/power';
import { waterConfig } from './configs/water';
import { populationConfig } from './configs/population';
import { servicesConfig } from './configs/services';
import { foodConfig } from './configs/food';

export const PowerStatCard = createStatCard(powerConfig);
export const WaterStatCard = createStatCard(waterConfig);
export const PopulationStatCard = createStatCard(populationConfig);
export const ServicesStatCard = createStatCard(servicesConfig);
export const FoodStatCard = createStatCard(foodConfig);

// Main StatsPanel component
import React from 'react';
import { useCity } from '../CityContext';

const StatsPanel: React.FC = () => {
  const cityContext = useCity();
  if (!cityContext) return null;

  const totals = cityContext.getTotals();

  return (
    <div>
      <PowerStatCard powerOutput={totals.powerOutput} powerUsage={totals.powerUsage} />
      <WaterStatCard waterOutput={totals.waterOutput} waterUsage={totals.waterUsage} />
      <PopulationStatCard houses={totals.houses} employed={totals.employed} />
      <ServicesStatCard capacity={totals.capacity} houses={totals.houses} qualityIndex={totals.qualityIndex} />
      <FoodStatCard foodProduction={totals.foodProduction} houses={totals.houses} />
    </div>
  );
};

export default StatsPanel;
