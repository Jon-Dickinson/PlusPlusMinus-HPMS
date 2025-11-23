import React from 'react';
import StatCard from './StatCard';
import { StatCardConfig } from './StatCard.types';

export const createStatCard = <Props extends object>(
  config: StatCardConfig<Props>
) => {
  return (props: Props) => {
    const warn = config.warnCondition?.(props) ?? false;

    return (
      <StatCard
        title={config.title}
        icon={<img src={config.iconSrc} alt={config.iconAlt} />}
        iconColor={config.iconColor}
        warn={warn}
        stats={config.stats(props)}
      />
    );
  };
};
