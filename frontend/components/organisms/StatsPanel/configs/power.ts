import { StatCardConfig } from '../StatCard.types';

export const powerConfig: StatCardConfig<any> = {
  title: 'Power',
  iconSrc: '/icons/power-station.svg',
  iconAlt: 'Power',
  iconColor: '#FFD52B',

  warnCondition: ({ powerOutput, powerUsage }) => powerUsage > powerOutput,

  stats: ({ powerOutput, powerUsage }) => {
    const exceeds = powerUsage > powerOutput;

    return [
      { label: 'Output', value: powerOutput },
      {
        label: 'Usage',
        value: powerUsage,
        color: exceeds ? '#ef4444' : '#16a34a',
      },
    ];
  },
};
