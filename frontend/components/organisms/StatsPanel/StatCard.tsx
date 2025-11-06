import React from 'react';
import { Zap, Droplet, Home, Wrench, Leaf } from 'lucide-react';
import { Card, Header, IconWrapper, Title, StatsRow, Stat } from './styles';

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  stats: Array<{
    label: string;
    value: number | string;
    color?: string;
    outlined?: boolean;
    outlineColor?: string;
  }>;
  warn?: boolean;
}

export default function StatCard({ title, icon, iconColor, stats, warn }: StatCardProps) {
  return (
    <Card warn={warn}>
      <Header>
        <Title>{title}</Title>
        <IconWrapper color={iconColor}>
          {icon}
        </IconWrapper>
      </Header>
      <StatsRow>
        {stats.map((stat, index) => (
          <Stat
            key={index}
            color={stat.color}
            outlined={stat.outlined}
            outlineColor={stat.outlineColor}
          >
            {stat.label}: {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </Stat>
        ))}
      </StatsRow>
    </Card>
  );
}

// Predefined stat cards for common use cases
export const PowerStatCard = ({ powerOutput, powerUsage }: { powerOutput: number; powerUsage: number }) => (
  <StatCard
    title="Power"
    icon={<Zap />}
    iconColor="#FFD52B"
    warn={powerUsage > powerOutput}
    stats={[
      { label: 'Output', value: powerOutput },
      { label: 'Usage', value: powerUsage, color: powerUsage > powerOutput ? '#ef4444' : '#16a34a' },
    ]}
  />
);

export const WaterStatCard = ({ waterOutput, waterUsage }: { waterOutput: number; waterUsage: number }) => (
  <StatCard
    title="Water"
    icon={<Droplet />}
    iconColor="#0068FF"
    warn={waterUsage > waterOutput}
    stats={[
      { label: 'Output', value: waterOutput },
      { label: 'Usage', value: waterUsage, color: waterUsage > waterOutput ? '#ef4444' : '#0ea5e9' },
    ]}
  />
);

export const PopulationStatCard = ({ houses, employed }: { houses: number; employed: number }) => (
  <StatCard
    title="Population"
    icon={<Home />}
    iconColor="#2FBF4A"
    stats={[
      { label: 'Houses', value: houses, outlined: true, outlineColor: '#16a34a' },
      { label: 'Employed', value: employed },
    ]}
  />
);

export const ServicesStatCard = ({ capacity, houses, qualityIndex }: { capacity: number; houses: number; qualityIndex: number }) => {
  const serviceShort = capacity < houses;
  const qualityColor = qualityIndex <= 50 ? '#ef4444' : qualityIndex <= 69 ? '#FFD52B' : '#16a34a';

  return (
    <StatCard
      title="Services"
      icon={<Wrench />}
      iconColor="#EE3E36"
      stats={[
        { label: 'Capacity', value: capacity, color: serviceShort ? '#ef4444' : '#0ea5e9' },
        { label: 'Quality Index', value: `${qualityIndex}%`, color: qualityColor },
      ]}
    />
  );
};

export const FoodStatCard = ({ foodProduction, houses }: { foodProduction: number; houses: number }) => (
  <StatCard
    title="Food"
    icon={<Leaf />}
    iconColor="#704214"
    warn={foodProduction < houses}
    stats={[
      { label: 'Production', value: foodProduction, color: foodProduction < houses ? '#ef4444' : '#16a34a' },
      { label: 'Demand', value: houses },
    ]}
  />
);