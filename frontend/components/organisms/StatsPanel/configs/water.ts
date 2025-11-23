import { StatCardConfig } from '../StatCard.types';

export const waterConfig: StatCardConfig<any> = {
  title: 'Water',
  iconSrc: '/icons/water-pump.svg',
  iconAlt: 'Water',
  iconColor: '#0068FF',

  warnCondition: ({ waterOutput, waterUsage }) => waterUsage > waterOutput,

  stats: ({ waterOutput, waterUsage }) => {
    const exceeds = waterUsage > waterOutput;

    return [
      { label: 'Output', value: waterOutput },
      {
        label: 'Usage',
        value: waterUsage,
        color: exceeds ? '#ef4444' : '#0ea5e9',
      },
    ];
  },
};
