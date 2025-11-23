import React from 'react';
import { useDragLayer } from 'react-dnd';

export default function DragDropCursorController() {
  const { isDragging, clientOffset } = useDragLayer((m: any) => ({
    isDragging: m.isDragging(),
    clientOffset: m.getClientOffset(),
  }));

  React.useEffect(() => {
    if (!isDragging || !clientOffset) return;

    function setMove(e: DragEvent) {
      try {
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      } catch {}
    }

    window.addEventListener('dragover', setMove, true);
    window.addEventListener('dragenter', setMove, true);

    return () => {
      window.removeEventListener('dragover', setMove, true);
      window.removeEventListener('dragenter', setMove, true);
    };
  }, [isDragging, clientOffset]);

  return null;
}
