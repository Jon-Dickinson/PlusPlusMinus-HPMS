import express from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const router = express.Router()

// load openapi doc
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docPath = path.join(__dirname, '../../docs/openapi.json')
let spec: any = {}
try {
  spec = JSON.parse(fs.readFileSync(docPath, 'utf8'))
} catch (err) {
  console.error('Failed to load OpenAPI doc for Swagger UI:', err)
}

router.use('/', swaggerUi.serve, swaggerUi.setup(spec))

export default router
