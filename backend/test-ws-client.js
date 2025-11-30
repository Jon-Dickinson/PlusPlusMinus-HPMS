#!/usr/bin/env node
// Simple WebSocket test client
// Usage: node test-ws-client.js wss://your-backend.up.railway.app/api/system-status

import WebSocket from 'ws';

const url = process.argv[2] || process.env.WS_URL || 'ws://localhost:4000/api/system-status';
console.log('Connecting to', url);

const ws = new WebSocket(url);

ws.on('open', () => console.log('open'));

ws.on('message', (m) => {
  try {
    const s = m.toString();
    console.log('msg', s);
  } catch (e) {
    console.log('msg (binary)');
  }
});

ws.on('close', (code, reason) => {
  console.log('closed', code, reason && reason.toString());
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('err', err && err.message ? err.message : err);
  process.exit(1);
});

// quit after 8 seconds if nothing else
setTimeout(() => {
  console.log('timeout, exiting');
  ws.terminate();
  process.exit(0);
}, 8000);
