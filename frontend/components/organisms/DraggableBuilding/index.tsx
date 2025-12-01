import React from 'react';
import { useDrag } from 'react-dnd';
import { useEffect, useState } from 'react';
import useDragPreview from './useDragPreview';
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

const dragCollector = (monitor: any) => ({ isDragging: !!monitor.isDragging() });

function DraggableBuildingClient({ building }: { building: any }) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'BUILDING',
    item: { id: building.id },
    collect: dragCollector,
  }));

  useCity();
  useDragPreview(preview, building, imageForBuilding);

  return (
    <IconContainer
      role="group"
      aria-label={building.name}
      title={building.name}
      style={{
        opacity: isDragging ? 0.6 : (building?.disabled ? 0.35 : 1),
        backgroundColor: 'transparent',
        marginBottom: 10,
      }}
      aria-disabled={building?.disabled ? 'true' : undefined}
    >
      <DragHandle ref={drag} isDragging={isDragging}>
        <BuildingImage
          src={imageForBuilding(building)}
          alt={building.name}
        />
      </DragHandle>

      
    </IconContainer>
  );
}

export default DraggableBuilding;