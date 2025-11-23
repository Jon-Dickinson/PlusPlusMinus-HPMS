import { useDragLayer } from 'react-dnd';

export function useDragLayerState() {
  const { isDragging, clientOffset, itemType, targetIds, item } = useDragLayer((monitor) => {
    const m: any = monitor;
    return {
      isDragging: monitor.isDragging(),
      clientOffset: monitor.getClientOffset(),
      itemType: monitor.getItemType(),
      targetIds: typeof m.getTargetIds === 'function' ? m.getTargetIds() : [],
      item: typeof m.getItem === 'function' ? m.getItem() : undefined,
    };
  });

  return { isDragging, clientOffset, itemType, targetIds, item };
}
