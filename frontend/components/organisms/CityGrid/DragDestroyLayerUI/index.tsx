import React from 'react';
import { useDragLayerState } from './hooks';
import ExplosionIcon from './ExplosionIcon';
import { Layer, Icon } from './styles';

export default function DragDestroyLayer() {
  const { isDragging, clientOffset, targetIds, item } = useDragLayerState();
  const offTarget = !targetIds || targetIds.length === 0;

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let timer: any;
    const isMoveFromGrid = !!(item && typeof item.sourceIndex === 'number');

    if (!isDragging || !clientOffset || !offTarget || !isMoveFromGrid) {
      setVisible(false);
      return () => {};
    }

    timer = setTimeout(() => setVisible(true), 120);

    return () => clearTimeout(timer);
  }, [isDragging, clientOffset, offTarget, item]);

  if (!isDragging || !clientOffset || !visible) return null;

  return (
    <Layer data-testid="drag-destroy-layer">
      <Icon x={clientOffset.x} y={clientOffset.y} aria-hidden>
        <ExplosionIcon />
      </Icon>
    </Layer>
  );
}
