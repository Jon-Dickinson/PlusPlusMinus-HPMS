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

function SystemStatusClient({
  maxReconnectAttempts = 5,
  className,
}: Props) {


  const [status, setStatus] = useState<SystemStatusState>({
    api: 'unknown',
    db: 'unknown',
  });

  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const getWebSocketUrl = () => {
      const fallback = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || fallback).replace(/\/$/, '');
      return apiBase.replace(/^http/, 'ws') + '/api/system-status';
    };

    const cleanup = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Component cleanup');
      }
      wsRef.current = null;
    };

    const attemptReconnect = () => {
      if (!mountedRef.current) return;
      
      reconnectAttemptsRef.current += 1;
      const newAttempts = reconnectAttemptsRef.current;
      setReconnectAttempts(newAttempts);

      if (newAttempts >= maxReconnectAttempts) {
        setConnectionState('failed');
        return;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s max
      const delay = Math.min(16000, 1000 * Math.pow(2, newAttempts - 1));
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, delay);
    };

    const connect = () => {
      if (!mountedRef.current) return;

      // Prevent multiple simultaneous connection attempts
      if (connectingRef.current) {
        console.log('SystemStatus: Already connecting, skipping');
        return;
      }

      // Check if WebSocket is available
      if (typeof WebSocket === 'undefined') {
        console.warn('SystemStatus: WebSocket not available');
        return;
      }

      // Close existing connection if any
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }

      connectingRef.current = true;
      setConnectionState('connecting');

      try {
        const ws = new WebSocket(getWebSocketUrl());
        wsRef.current = ws;

        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }, 10000); // 10 second connection timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          connectingRef.current = false;
          if (!mountedRef.current) {
            ws.close();
            return;
          }
          
          console.log('SystemStatus: WebSocket connected');
          setConnectionState('connected');
          reconnectAttemptsRef.current = 0;
          setReconnectAttempts(0);
        };

        ws.onmessage = (event) => {
          if (!mountedRef.current) return;
          
          try {
            const data = JSON.parse(event.data);
            if (data && typeof data === 'object' && ('api' in data || 'db' in data)) {
              setStatus(data as SystemStatusState);
            }
          } catch (error) {
            console.warn('SystemStatus: Failed to parse message:', error);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          connectingRef.current = false;
          if (!mountedRef.current) return;

          console.log('SystemStatus: WebSocket closed', event.code, event.reason);
          
          // Only attempt reconnect for unexpected closures
          if (event.code !== 1000 && event.code !== 1001) {
            setConnectionState('disconnected');
            attemptReconnect();
          } else {
            setConnectionState('disconnected');
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          connectingRef.current = false;
          if (!mountedRef.current) return;
          
          console.error('SystemStatus: WebSocket error:', error);
          setConnectionState('disconnected');
        };

      } catch (error) {
        connectingRef.current = false;
        console.error('SystemStatus: Failed to create WebSocket:', error);
        if (mountedRef.current) {
          attemptReconnect();
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []); // Empty dependency array - only run once

  const getStatusDisplay = () => {
    if (connectionState === 'failed') {
      return 'Connection Failed';
    }
    if (connectionState === 'connecting') {
      return reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Connecting...';
    }
    if (connectionState === 'disconnected') {
      return 'Disconnected';
    }
    return null;
  };

  const statusDisplay = getStatusDisplay();

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

      {statusDisplay && <ErrorText>{statusDisplay}</ErrorText>}
    </Wrapper>
  );
}

const SystemStatus = React.memo(function SystemStatus(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Wrapper className={props.className} aria-live="polite">
        <Row>
          <Label>API</Label>
          <SingleLight status="unknown" />
          <StatusText>unknown</StatusText>
        </Row>
        <Row>
          <Label>DB</Label>
          <SingleLight status="unknown" />
          <StatusText>unknown</StatusText>
        </Row>
      </Wrapper>
    );
  }

  return <SystemStatusClient {...props} />;
});

export default SystemStatus;
