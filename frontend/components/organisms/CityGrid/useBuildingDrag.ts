import { useDrag } from 'react-dnd';

export default function useBuildingDrag({ id, cellIndex, buildingIndex, canEdit, removeBuildingFromCell }: any) {
  return useDrag(
    () => ({
      type: 'MOVE_BUILDING',
      item: { id, sourceIndex: cellIndex, buildingIndex },
      canDrag: () => canEdit,
      end: (item: any, monitor: any) => {
        if (!monitor.didDrop() && canEdit && item && typeof item.sourceIndex === 'number') {
          try {
            removeBuildingFromCell(item.sourceIndex, item.id);
          } catch {}
        }
      },
      collect: (monitor: any) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [id, cellIndex, buildingIndex, canEdit, removeBuildingFromCell],
  );
}
