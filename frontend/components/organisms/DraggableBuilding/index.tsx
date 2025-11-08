'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { useEffect, useState } from 'react';
import { useCity } from '../CityContext';
import { IconContainer } from '../BuidlingSidebar/styles';
import { imageForBuilding } from '../BuidlingSidebar/buildingSidebarUtils';
import { DragHandle, BuildingImage, PlaceholderImage } from './styles';

function DraggableBuilding({ building }: { building: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div>
        <PlaceholderImage
          src={imageForBuilding(building)}
          alt={building.name}
          title={building.name}
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
  const { } = useCity();

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
      <DragHandle ref={drag}>
        <BuildingImage
          src={imageForBuilding(building)}
          alt={building.name}
        />
      </DragHandle>

      {/* property values removed per UX request */}
    </IconContainer>
  );
}

export default DraggableBuilding;