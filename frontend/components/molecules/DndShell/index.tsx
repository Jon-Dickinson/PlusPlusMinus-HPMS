'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragDropCursorController from './DragDropCursorController';

export default function DndShell({ children }: { children: React.ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropCursorController />
      {children}
    </DndProvider>
  );
}