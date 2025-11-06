import React from 'react';
import { useCity } from '../CityContext';

export default function QualityIndex() {
  const { getTotals } = useCity();
  const totals = getTotals();
  const percent = Math.max(0, Math.min(100, Number(totals.qualityIndex || 0)));

  let color = '#FAC902';
  if (percent <= 50) color = '#FF2226';
  else if (percent >= 80) color = '#28B216';

  return (
    <span style={{ color, fontSize: '2rem', fontWeight: 500 }}>{percent}%</span>
  );
}