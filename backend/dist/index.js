import 'dotenv/config';
import app from './server.js';
import { createServer } from 'node:http';
import attachSystemStatusSocket from './systemStatusSocket.js';
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
// Create an http server so we can attach WebSocket server to it
const server = createServer(app);
// attach system status websocket handler
attachSystemStatusSocket(server);
server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
