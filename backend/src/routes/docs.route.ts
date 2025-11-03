import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load the OpenAPI document from the repository docs folder.
// Use process.cwd() so this works both in dev (ts-node) and after build.
function loadSwaggerDoc() {
  try {
    const p = path.join(process.cwd(), 'docs', 'swagger.json');
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // fallback: return a minimal document
    return {
      openapi: '3.0.0',
      info: { title: 'API', version: '0.0.0' },
      paths: {},
    };
  }
}

const swaggerDocument = loadSwaggerDoc();

// Serve Swagger UI at /api/docs
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Raw JSON for tooling
router.get('/json', (req, res) => {
  res.json(swaggerDocument);
});

export default router;
