import { StatCardConfig } from '../StatCard.types';

export const foodConfig: StatCardConfig<any> = {
  title: 'Food',
  iconSrc: '/icons/farm.svg',
  iconAlt: 'Food',
  iconColor: '#704214',

  warnCondition: ({ foodProduction, houses }) => foodProduction < houses,

  stats: ({ foodProduction, houses }) => {
    const deficit = foodProduction < houses;

    return [
      {
        label: 'Production',
        value: foodProduction,
        color: deficit ? '#ef4444' : '#16a34a',
      },
      { label: 'Demand', value: houses },
    ];
  },
};
