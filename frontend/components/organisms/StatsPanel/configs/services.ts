import { StatCardConfig } from '../StatCard.types';

export const servicesConfig: StatCardConfig<any> = {
  title: 'Services',
  iconSrc: '/icons/government.svg',
  iconAlt: 'Services',
  iconColor: '#EE3E36',

  stats: ({ capacity, houses, qualityIndex }) => {
    const serviceShort = capacity < houses;

    const qualityColor =
      qualityIndex <= 50
        ? '#ef4444'
        : qualityIndex <= 69
        ? '#FFD52B'
        : '#16a34a';

    return [
      {
        label: 'Capacity',
        value: capacity,
        color: serviceShort ? '#ef4444' : '#0ea5e9',
      },
      {
        label: 'Quality Index',
        value: `${Math.round(qualityIndex)}%`,
        color: qualityColor,
      },
    ];
  },
};
