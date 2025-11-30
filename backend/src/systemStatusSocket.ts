import { WebSocketServer } from 'ws';
import { checkApi, checkDb } from './statusChecks.js';

export function attachSystemStatusSocket(server: any) {
  const wss = new WebSocketServer({ server, path: '/system-status' });

  // Debug: log incoming HTTP upgrade requests so we can diagnose handshake failures
  try {
    server.on('upgrade', (req: any, socket: any, head: any) => {
      try {
        const ip = req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
        console.log('WS upgrade request', { url: req.url, headers: req.headers, remoteAddr: ip });
      } catch (e) {
        console.warn('Failed to log upgrade request', e);
      }
    });
  } catch (e) {
    // ignore if server doesn't support 'upgrade' (shouldn't happen)
  }

  wss.on('error', (err) => {
    console.error('WebSocketServer error', err);
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to system-status websocket');

    let active = true;

    async function sendStatus() {
      if (!active) return;
      const api = await checkApi();
      const db = await checkDb();
      try {
        ws.send(JSON.stringify({ api, db }));
      } catch (e) {
        // ignore broken socket
      }
    }

    // Send once immediately then every 5 seconds
    void sendStatus();
    const interval = setInterval(sendStatus, 5000);

    ws.on('close', () => {
      active = false;
      clearInterval(interval);
    });
  });
}

export default attachSystemStatusSocket;
