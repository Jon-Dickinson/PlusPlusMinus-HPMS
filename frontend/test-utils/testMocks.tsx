// Test mocks for components that cause issues in test environment
import React from 'react';

// Mock SystemStatus component to avoid WebSocket issues in tests
export const MockSystemStatus = () => (
  <div data-testid="system-status">
    <div>API: unknown</div>
    <div>DB: unknown</div>
  </div>
);

// Mock router for tests
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  back: vi.fn(),
  forward: vi.fn(),
  reload: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock SystemStatus globally for tests
vi.mock('../components/molecules/SystemStatus', () => ({
  __esModule: true,
  default: MockSystemStatus,
}));

// Mock WebSocket for tests
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: class MockWebSocket {
    constructor(url: string) {
      setTimeout(() => {
        this.onopen?.({});
      }, 100);
    }
    onopen: ((event: any) => void) | null = null;
    onclose: ((event: any) => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    close() {}
    send() {}
    readyState = 1;
    CONNECTING = 0;
    OPEN = 1;
    CLOSING = 2;
    CLOSED = 3;
  },
});