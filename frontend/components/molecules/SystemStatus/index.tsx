import React, { useEffect, useRef, useState } from 'react';
import {
  Wrapper,
  Row,
  Label,
  SingleLight,
  StatusText,
  ErrorText,
  Props,
  SystemStatusState,
} from './styles';


// -------------------------------------------------------
// Component
// -------------------------------------------------------

export default function SystemStatus({
  pollIntervalMs = 5000,
  maxReconnectAttempts = 6,
  className,
}: Props) {
  const [status, setStatus] = useState<SystemStatusState>({
    api: 'unknown',
    db: 'unknown',
  });

  const [connectingAttempts, setConnectingAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const destroyedRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  // -------------------------------------------------------
  // WebSocket logic
  // -------------------------------------------------------
  useEffect(() => {
    const fallback =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000';

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || fallback).replace(/\/$/, '');
    // the API base points at the host root; API endpoints are mounted under /api
    // so make the socket path match: /api/system-status
    const wsUrl = apiBase.replace(/^http/, 'ws') + '/api/system-status';

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (destroyedRef.current) return;
      attemptsRef.current += 1;
      setConnectingAttempts(attemptsRef.current);

      const base = Math.min(30000, 1000 * 2 ** (attemptsRef.current - 1));
      const jitter = Math.floor(Math.random() * 300);
      const delay = base + jitter;
      reconnectTimerRef.current = window.setTimeout(connect, delay);

      console.warn(`SystemStatus reconnect attempt ${attemptsRef.current} in ${delay}ms`);
    };

    const connect = () => {
      const WSConstructor =
        (globalThis as any).WebSocket ??
        (typeof WebSocket !== 'undefined' ? WebSocket : undefined);

      if (!WSConstructor) return;
      if (destroyedRef.current) return;

      try {
        const ws = new WSConstructor(wsUrl) as WebSocket;
        wsRef.current = ws;

        ws.onopen = () => {
          attemptsRef.current = 0;
          setConnectingAttempts(0);
        };

        ws.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data) as SystemStatusState;
            setStatus(update);
          } catch {}
        };

        ws.onclose = () => {
          clearReconnectTimer();
          if (!destroyedRef.current) scheduleReconnect();
        };

        ws.onerror = () => {
          if (!reconnectTimerRef.current) scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      destroyedRef.current = true;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [pollIntervalMs]);

  const connectionFailed =
    connectingAttempts >= maxReconnectAttempts &&
    connectingAttempts > 0;

  return (
    <Wrapper className={className} aria-live="polite">
      
      <Row>
        <Label>API</Label>
        <SingleLight status={status.api} />
        <StatusText>{status.api}</StatusText>
      </Row>

      <Row>
        <Label>DB</Label>
        <SingleLight status={status.db} />
        <StatusText>{status.db}</StatusText>
      </Row>

      {connectionFailed && <ErrorText>connection failed</ErrorText>}
    </Wrapper>
  );
}
