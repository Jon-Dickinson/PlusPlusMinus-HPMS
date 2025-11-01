// CityGrid.tsx
import { useDrop, useDrag } from 'react-dnd';
import { useCity, Cell } from './CityContext';
import buildings from '../../data/buildings.json';
import { useState } from 'react';

export default function CityGrid() {
  const { grid, addBuildingToCell, moveBuilding } = useCity();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8, padding: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', maxWidth: 1100 }}>
      {grid.map((cell: Cell, index: number) => (
        <GridCell key={index} index={index} buildings={cell} addBuilding={addBuildingToCell} moveBuilding={moveBuilding} />
      ))}
    </div>
  );
}

function GridCell({ index, buildings, addBuilding, moveBuilding }: { index: number; buildings: Cell; addBuilding: (index:number, id:number)=>boolean; moveBuilding: (src:number, dest:number, id:number)=>boolean }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['BUILDING', 'MOVE_BUILDING'],
    drop: (item: any) => {
      // if item has a sourceIndex it's a move within the grid
      if (typeof item?.sourceIndex === 'number') {
        const ok = moveBuilding(item.sourceIndex, index, item.id)
        if (ok) {
          triggerBounce()
        }
        return
      }

      // otherwise it's a palette drop
      const ok = addBuilding(index, item.id);
      if (ok) {
        triggerBounce();
        if (typeof window !== 'undefined') {
          const ev = new CustomEvent('city:update');
          window.dispatchEvent(ev);
        }
      }
    },
    collect: (monitor: any) => ({ isOver: !!monitor.isOver() }),
  }));

  const [bounced, setBounced] = useState(false);

  function triggerBounce() {
    setBounced(true);
    window.setTimeout(() => setBounced(false), 400);
  }

  // derive a color from the topmost building in this cell
  const topId = buildings && buildings.length > 0 ? buildings[buildings.length - 1] : null;
  const topBuilding = topId ? buildingsLookup(topId) : null;

  function imagePath(file: string | undefined) {
    if (!file) return '';
    const parts = file.split('/');
    const basename = parts[parts.length - 1];
    return basename ? `/buildings/${basename}` : file;
  }

  // cell container is relative so stacked items can be absolutely positioned
  return (
    <div
      ref={drop}
      style={{
        width: 100,
        height: 100,
        border: '1px solid #9CA3AF',
        borderRadius: 6,
        backgroundColor: isOver ? '#e0f7fa' : 'white',
        position: 'relative',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={bounced ? 'cell-bounce' : ''}
    >
      {buildings && buildings.length > 0 ? (
        buildings.map((id: number, idx: number) => {
          const b = buildingsLookup(id)
          const size = 64
          // spacing between stacked building images (kept slightly larger)
          const offset = idx * 18
          return (
            <BuildingItem key={idx} id={id} idx={idx} cellIndex={index} b={b} size={size} offset={offset} />
          )
        })
      ) : null}

      {(!topBuilding && buildings.length > 0) && (
        <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 12, color: '#374151' }}>{`${buildings.length}x`}</div>
      )}
    </div>
  );
}

function buildingsLookup(id: any) {
  return buildings.find((b: any) => b.id === id) || null;
}

function BuildingItem({ id, idx, cellIndex, b, size, offset }: { id: number; idx: number; cellIndex: number; b: any; size: number; offset: number }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MOVE_BUILDING',
    item: { id, sourceIndex: cellIndex, idx },
    collect: (monitor: any) => ({ isDragging: !!monitor.isDragging() }),
  }), [id, cellIndex, idx]);

  return (
    <div
      ref={drag}
      style={{ position: 'absolute', bottom: offset, left: '50%', transform: `translateX(-50%)`, zIndex: idx + 1, opacity: isDragging ? 0.4 : 1 }}
    >
      {b ? (
        <img src={(b as any).icon ? (b as any).icon : ((b as any).file || '')} alt={(b as any).name || ''} style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
      ) : (
        <div style={{ width: size, height: size, backgroundColor: b?.color || '#999' }} />
      )}
    </div>
  )
}
