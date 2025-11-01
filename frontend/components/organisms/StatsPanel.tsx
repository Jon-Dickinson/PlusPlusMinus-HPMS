import React from 'react';
import { useCity } from './CityContext';

export default function StatsPanel() {
  const { totals, getTotals, grid } = useCity();

  // compute totals on render (getTotals reads the up-to-date totals state)
  // make the shape explicit so Object.entries yields numbers instead of unknown
  const computed: Record<string, number> = (getTotals ? getTotals() : totals) || {};

  return (
    <aside className="w-64 p-4 border-l border-gray-300">
      <h3 className="text-sm font-semibold mb-2">City Totals</h3>
      {Object.keys(computed).length === 0 ? (
        <div className="text-xs text-gray-500">No buildings yet</div>
      ) : (
        <ul className="text-sm space-y-1">
          {Object.entries(computed).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="capitalize text-gray-700">{k}</span>
              <span className="font-medium">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
