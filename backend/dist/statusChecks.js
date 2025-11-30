import { prisma } from './db.js';
/**
 * Basic API health check — calls self /health endpoint
 */
export async function checkApi() {
    try {
        // SELF_URL should be the full base URL for the running app (eg: http://localhost:3000)
        const port = process.env.PORT || '3000';
        const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
        const base = process.env.SELF_URL || `http://${host}:${port}`;
        const url = `${base.replace(/\/$/, '')}/health`;
        const res = await fetch(url);
        if (!res.ok)
            return 'offline';
        return 'online';
    }
    catch (e) {
        return 'offline';
    }
}
/**
 * Basic DB check — run a small query to verify connectivity
 */
export async function checkDb() {
    try {
        // tiny query to validate connectivity
        await prisma.$queryRaw `SELECT 1`;
        return 'online';
    }
    catch (e) {
        return 'offline';
    }
}
export default { checkApi, checkDb };
