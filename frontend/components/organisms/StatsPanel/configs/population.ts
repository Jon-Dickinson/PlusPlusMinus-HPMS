import { StatCardConfig } from '../StatCard.types';

export const populationConfig: StatCardConfig<any> = {
  title: 'Population',
  iconSrc: '/icons/residential.svg',
  iconAlt: 'Population',
  iconColor: '#2FBF4A',

  stats: ({ houses, employed }) => [
    {
      label: 'Houses',
      value: houses,
      outlined: true,
      outlineColor: '#16a34a',
    },
    { label: 'Employed', value: employed },
  ],
};
