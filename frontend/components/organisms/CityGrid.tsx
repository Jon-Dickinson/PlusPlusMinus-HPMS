// CityGrid.tsx — rebuilt to always display and integrate with CityContext and BuildingSidebar
import React, { useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useCity, Cell, CityProvider } from './CityContext';
import DndShell from '../molecules/DndShell';
import buildings from '../../data/buildings.json';
import BuildingPopup from './BuildingPopup';

export default function CityGrid() {
  // GridInner uses the CityContext hooks directly. If the app doesn't provide
  // a CityProvider (during refactors), we'll mount GridInner inside a local
  // provider via a small error-boundary fallback so the grid still appears.

  function GridInner() {
    const { grid, addBuildingToCell, moveBuilding } = useCity();
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [selectedBuildingData, setSelectedBuildingData] = useState<any | null>(null);

    async function handleBuildingClick(buildingId: number) {
      const local = buildings.find((b: any) => b.id === buildingId) || null;
      setSelectedBuildingId(buildingId);
      setSelectedBuildingData(local);

      try {
        const listRes = await fetch('/api/buildings');
        if (listRes.ok) {
          const listBody = await listRes.json();
          const list = listBody?.buildings ?? listBody ?? [];
          let found: any = null;
          if (local && local.name) {
            const lname = String(local.name).toLowerCase();
            found = list.find((x: any) => String(x.name || '').toLowerCase() === lname) || null;
          }
          if (!found && local) {
            const basename = String(((local as any).icon || (local as any).file) || '').split('/').pop();
            if (basename) {
              found = list.find((x: any) => String(x.file || '').endsWith(basename)) || null;
            }
          }
          if (found) {
            setSelectedBuildingData(found);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      try {
        const res = await fetch(`/api/buildings/${buildingId}`);
        if (res.ok) {
          const payload = await res.json();
          const body = payload?.building ?? payload;
          if (body && (!local || String(body.name || '').toLowerCase() === String(local.name || '').toLowerCase())) {
            setSelectedBuildingData(body);
          }
        }
      } catch (err) {
        // keep local
      }
    }

    return (
      <>
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            padding: 8,
            maxWidth: 964,
            minHeight: 420,
          }}
        >
          {grid.map((cell: Cell, index: number) => (
            <GridCell
              key={index}
              index={index}
              buildings={cell}
              addBuilding={addBuildingToCell}
              moveBuilding={moveBuilding}
              onBuildingClick={handleBuildingClick}
            />
          ))}
        </div>
        {selectedBuildingId && (
          <BuildingPopup
            id={selectedBuildingId}
            initialData={selectedBuildingData}
            onClose={() => {
              setSelectedBuildingId(null);
              setSelectedBuildingData(null);
            }}
          />
        )}
      </>
    );
  }

  // Local ErrorBoundary to catch missing provider/hook errors and recover by
  // rendering the grid inside a CityProvider + DndShell so the UI always shows.
  class LocalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error: any, info: any) {
      // swallow; we'll recover by rendering with providers
      // console.debug('CityGrid recovered from error', { error, info });
    }
    render() {
      if (this.state.hasError) {
        return (
          <CityProvider>
            <DndShell>
              {this.props.children}
            </DndShell>
          </CityProvider>
        );
      }
      return this.props.children as any;
    }
  }

  return (
    <LocalErrorBoundary>
      <DndShell>
        <GridInner />
      </DndShell>
    </LocalErrorBoundary>
  );
}

function GridCell({
  index,
  buildings,
  addBuilding,
  moveBuilding,
  onBuildingClick,
}: {
  index: number;
  buildings: Cell;
  addBuilding: (index: number, id: number) => boolean;
  moveBuilding: (src: number, dest: number, id: number) => boolean;
  onBuildingClick?: (id: number) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['BUILDING', 'MOVE_BUILDING'],
    drop: (item: any) => {
      // item from move has sourceIndex
      if (typeof item?.sourceIndex === 'number') {
        const ok = moveBuilding(item.sourceIndex, index, item.id);
        if (ok) {
          // noop for now — animation could be triggered
        }
        return;
      }

      const ok = addBuilding(index, item.id);
      if (ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('city:update'));
        }
      }
    },
    collect: (monitor: any) => ({ isOver: !!monitor.isOver() }),
  }));

  const topId = buildings && buildings.length > 0 ? buildings[buildings.length - 1] : null;
  const topBuilding = topId ? buildingsLookup(topId) : null;

  return (
    <div
      ref={drop}
      style={{
        minWidth: 74,
        minHeight: 74,
        margin: '2px',
        border: '1px solid #414E79',
        backgroundColor: isOver ? '#ffffff' : 'transparent',
        position: 'relative',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {buildings && buildings.length > 0
        ? buildings.map((id: number, idx: number) => {
            const b = buildingsLookup(id);
            const size = 52;
            const offset = idx * 14;
            return (
              <BuildingItem
                key={idx}
                id={id}
                idx={idx}
                cellIndex={index}
                b={b}
                size={size}
                offset={offset}
                onClick={onBuildingClick}
              />
            );
          })
        : null}

      {!topBuilding && buildings.length > 0 && (
        <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 12, color: '#374151' }}>{`${buildings.length}x`}</div>
      )}
    </div>
  );
}

function buildingsLookup(id: any) {
  return buildings.find((b: any) => b.id === id) || null;
}

function BuildingItem({
  id,
  idx,
  cellIndex,
  b,
  size,
  offset,
  onClick,
}: {
  id: number;
  idx: number;
  cellIndex: number;
  b: any;
  size: number;
  offset: number;
  onClick?: (id: number) => void;
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'MOVE_BUILDING',
      item: { id, sourceIndex: cellIndex, idx },
      collect: (monitor: any) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [id, cellIndex, idx],
  );

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        bottom: offset,
        left: '50%',
        transform: `translateX(-50%)`,
        zIndex: idx + 1,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {b ? (
        <img
          src={(b as any).icon ? (b as any).icon : (b as any).file || ''}
          alt={(b as any).name || ''}
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
            display: 'block',
          }}
          onClick={() => {
            if (onClick) onClick(id);
          }}
        />
      ) : (
        <div style={{ width: size, height: size, backgroundColor: '#e5e7eb' }} />
      )}
    </div>
  );
}