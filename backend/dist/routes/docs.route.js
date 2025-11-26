import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
const router = express.Router();
// Load the OpenAPI document from the repository docs folder.
// Prefer `openapi.json` (the canonical spec we update), fall back to `swagger.json` for older deployments.
// Use process.cwd() so this works both in dev (ts-node) and after build.
function loadSwaggerDoc() {
    const base = path.join(process.cwd(), 'docs');
    const candidates = ['openapi.json', 'swagger.json'];
    for (const name of candidates) {
        try {
            const p = path.join(base, name);
            if (fs.existsSync(p)) {
                const raw = fs.readFileSync(p, 'utf8');
                return JSON.parse(raw);
            }
        }
        catch (e) {
            // ignore and try next one
            continue;
        }
    }
    // fallback: return a minimal document
    return {
        openapi: '3.0.0',
        info: { title: 'API', version: '0.0.0' },
        paths: {},
    };
}
const swaggerDocument = loadSwaggerDoc();
// Raw JSON for tooling - provide an explicit JSON endpoint before serving the UI so tools can fetch it
router.get('/json', (req, res) => {
    res.json(swaggerDocument);
});
// Serve Swagger UI at /api/docs
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
export default router;
