import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'categories.json');
const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

export default data;
