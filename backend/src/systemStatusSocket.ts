import { WebSocketServer } from 'ws';
import { checkApi, checkDb } from './statusChecks.js';

export function attachSystemStatusSocket(server: any) {
  const wss = new WebSocketServer({ server, path: '/system-status' });

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
