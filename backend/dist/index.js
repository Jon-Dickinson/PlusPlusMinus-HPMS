import 'dotenv/config';
import app from './server.js';
const PORT = Number(process.env.PORT) || 3000;
const HOST = 'localhost';
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
