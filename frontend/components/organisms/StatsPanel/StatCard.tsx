// components/StatCard/StatCard.tsx

import React, { useEffect, useState } from 'react';
import { Card, Header, IconWrapper, StatsRow, Stat } from './styles';
import { StatCardProps } from './StatCard.types';

export default function StatCard({
  title,
  icon,
  iconColor,
  stats,
  warn,
}: StatCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Card warn={warn}>
      <Header>
        <IconWrapper color={iconColor}>{icon}</IconWrapper>

        <StatsRow>
          {stats.map((stat, i) => {
            const value =
              typeof stat.value === 'number' && mounted
                ? stat.value.toLocaleString()
                : stat.value;

            return (
              <Stat
                key={i}
                color={stat.color}
                outlined={stat.outlined}
                outlineColor={stat.outlineColor}
                rightAlign={i % 2 === 1}
              >
                {stat.label}: {value}
              </Stat>
            );
          })}
        </StatsRow>
      </Header>
    </Card>
  );
}
