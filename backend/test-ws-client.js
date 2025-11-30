const WebSocket = require('ws');

const url = process.env.WS_URL || 'ws://localhost:4000/system-status';
console.log('Connecting to', url);

const ws = new WebSocket(url);
ws.on('open', () => console.log('open'));
ws.on('message', (m) => console.log('message:', m.toString()));
ws.on('close', () => {
  console.log('closed');
  process.exit(0);
});
ws.on('error', (e) => {
  console.error('error', e && e.message ? e.message : e);
  process.exit(2);
});

// quit after 8 seconds if nothing else
setTimeout(() => {
  console.log('timeout, exiting');
  ws.terminate();
  process.exit(0);
}, 8000);
