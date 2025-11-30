import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';

let lastInstance: FakeWebSocket | null = null;

// Simple mock WebSocket so component can be tested in happy-dom
class FakeWebSocket {
  public onmessage: ((ev: { data: string }) => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  public onclose: (() => void) | null = null;
  constructor(public url: string) {
    lastInstance = this;
  }
  close() {
    if (this.onclose) this.onclose();
  }
}

describe('SystemStatus', () => {
  let lastInstance: FakeWebSocket | null = null;

  beforeEach(() => {
    // @ts-ignore - attach a real constructor so `new WebSocket()` works
    // attach to globalThis so environments that look at window/WebSocket will find it
    (globalThis as any).WebSocket = FakeWebSocket as any;
  });

  afterEach(() => {
    // @ts-ignore
    delete global.WebSocket;
    lastInstance = null;
    vi.restoreAllMocks();
  });

  it('renders and updates when a websocket message is received', async () => {
    const { default: SystemStatus } = await import('../SystemStatus');
    render(<SystemStatus />);

    // let the effect create and wire the socket
    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => expect(lastInstance).not.toBeNull());

    // initially unknown
    expect(screen.getByText(/API:/)).toHaveTextContent('API: unknown');

    // simulate server message on the *current* socket instance
    lastInstance?.onmessage?.({ data: JSON.stringify({ api: 'online', db: 'online' }) });

    // DOM should update — wait for the updated text directly
    await screen.findByText('API: online');
    expect(screen.getByText(/DB:/)).toHaveTextContent('DB: online');
  });
});
