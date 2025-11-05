/**
 * ENHANCEMENT INSTRUCTION FOR GITHUB COPILOT
 *
 * GOAL:
 * Display the current total value (from city totals) next to each draggable building type in the sidebar.
 *
 * LOGIC:
 * - For each building, show its icon (colored block or SVG) AND a small numeric value to its right.
 * - The numeric value represents that building type’s contribution in the current city totals.
 *   Example:
 *   - Residential block shows the total "population" value (starts at 0).
 *   - Power Station shows total "powerOutput".
 *   - Factory shows total "employment".
 *   - Farm shows total "foodProduction".
 * - When the user drags and drops that building onto the grid, the sidebar number updates automatically.
 *
 * HOW TO IMPLEMENT:
 * 1. Import `useCity` from CityContext to access `totals` and `grid`.
 * 2. For each building, derive its relevant resource key (based on building.category or resources shape).
 *    e.g. pick the first key from building.resources as the display metric.
 * 3. Display that value next to the building name inside the sidebar.
 * 4. When totals change (CityContext updates), re-render to show the new number.
 *
 * UI DETAILS:
 * - Align building icon + name on left, number on right.
 * - Number starts at 0 when no buildings of that type are placed.
 * - Use small gray text for the number, e.g. `text-gray-500 text-xs`.
 * - Add a subtle transition when the number changes.
 *
 * EXAMPLE:
 * [🟩 Residential] 100
 * [⚡ Power Station] 250
 *
 * DO NOT:
 * - Create new state for totals; read directly from CityContext.
 * - Modify drag/drop behavior.
 *
 * PURPOSE:
 * This visually links each draggable building with its contribution to city stats in real time.
 */

'use client';

import buildings from '../../data/buildings.json';
import { useDrag } from 'react-dnd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCity } from './CityContext';

const LeftColumn = styled.div`
  position: relative;
  padding-top: 80px;
  height: 100%;
  display: flex;
  width: 100%;
  max-width: 110px;
  padding-right: 10px;
  gap: 5px;
  align-items: center;
  flex-direction: column;
`;

const IconContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: calc((100vh / 9) - 30px);
  min-height: 60px;
`;

function imageForBuilding(building: any) {
  if (!building) return '';
  if (building.icon) return building.icon;
  if ((building as any).file) {
    const parts = (building as any).file.split('/');
    const basename = parts[parts.length - 1];
    return basename ? `/buildings/${basename}` : (building as any).file;
  }
  const slug = (building.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `/buildings/${slug}.svg`;
}

export default function BuildingSidebar() {
  return (
    <LeftColumn>
      {buildings.map((b: any) => (
        <DraggableBuilding key={b.id} building={b} />
      ))}
    </LeftColumn>
  );
}

function DraggableBuilding({ building }: { building: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div>
        <img
          src={imageForBuilding(building)}
          alt={building.name}
          title={building.name}
          style={{ width: 40, height: 40 }}
        />
      </div>
    );
  }

  return <DraggableBuildingClient building={building} />;
}

function DraggableBuildingClient({ building }: { building: any }) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'BUILDING',
    item: { id: building.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  // read totals from context (re-renders when totals update)
  const { totals } = useCity();

  // pick the first resource key from the building definition (if any)
  const resources = building.resources || {};
  const resourceKey = Object.keys(resources)[0] || null;
  const displayValue = resourceKey ? totals[resourceKey] || 0 : 0;

  // register a transparent drag preview using the building image bitmap
  // this prevents the browser from rendering the element's surrounding
  // background into the drag image and preserves PNG/SVG transparency.
  useEffect(() => {
    if (!preview) return;
    const img = new Image();
    // ensure same-origin so the canvas/image can be used as drag preview
    img.crossOrigin = 'anonymous';
    img.src = imageForBuilding(building);
    const handleLoad = () => {
      try {
        // center the preview under the cursor
        preview(img, { offsetX: img.width / 2, offsetY: img.height / 2 });
      } catch (e) {
        // some backends may throw; ignore silently
      }
    };
    img.addEventListener('load', handleLoad);
    return () => img.removeEventListener('load', handleLoad);
  }, [preview, building]);

  return (
    <IconContainer
      role="group"
      aria-label={building.name}
      title={building.name}
      style={{
        opacity: isDragging ? 0.6 : 1,
        backgroundColor: 'transparent',
        marginBottom: 10,
      }}
    >
      {/* drag handle: only this element is draggable */}
      <div
        ref={drag}
        style={{
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
        }}
      >
        
          <img
            src={imageForBuilding(building)}
            alt={building.name}
            style={{
              width: 56,
              height: 56,
              objectFit: 'contain',
              display: 'block',
              border: 'none',
              background: 'transparent',
            }}
          />
         
      </div>

      {/* property values removed per UX request */}
    </IconContainer>
  );
}
