import React from 'react';
import { render, screen, cleanup, act } from '@testing-library/react';
import { vi } from 'vitest';

let mockMonitor: any = null;
vi.mock('react-dnd', () => ({
  useDragLayer: (selector: any) => selector(mockMonitor),
}));

afterEach(() => {
  cleanup();
  try {
    if (typeof document !== 'undefined' && document.body && document.body.style) {
      document.body.style.cursor = '';
    }
  } catch (e) {
    
  }
});

test('shows explosion after delay for off-grid move and does not change body cursor', async () => {
  vi.useFakeTimers();

  mockMonitor = {
    isDragging: () => true,
    getClientOffset: () => ({ x: 10, y: 10 }),
    getItemType: () => 'MOVE_BUILDING',
    getTargetIds: () => [],
    getItem: () => ({ sourceIndex: 1, id: 123 }),
  };

  const { default: DragDestroyLayer } = await import('../DragDestroyLayer');

  const { unmount } = render(<DragDestroyLayer />);

  expect(screen.queryByTestId('drag-destroy-layer')).toBeNull();

  act(() => vi.advanceTimersByTime(140));

  expect(screen.getByTestId('drag-destroy-layer')).toBeTruthy();
  expect(document.body.style.cursor).toBe('');

  unmount();
  expect(document.body.style.cursor).toBe('');

  vi.useRealTimers();
});

test('does nothing when not dragging', async () => {
  mockMonitor = {
    isDragging: () => false,
    getClientOffset: () => null,
    getItemType: () => null,
    getTargetIds: () => null,
  };

  const { default: DragDestroyLayer } = await import('../DragDestroyLayer');

  render(<DragDestroyLayer />);

  expect(screen.queryByTestId('drag-destroy-layer')).toBeNull();
  expect(document.body.style.cursor).toBe('');
});
