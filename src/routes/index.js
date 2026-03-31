import {Router} from 'express';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const router = Router();

// Rutas dinamicas (importación dinámica)
const __dirname = import.meta.dirname;
const routeFiles = readdirSync(__dirname).filter(
  file => file.endsWith('.route.js')
);

for (const file of routeFiles) {
  const routeName = file.replace('.route.js', '');
  const fileURL = pathToFileURL(join(__dirname, file)).href;  
  const routeModule = await import(fileURL);
  router.use(`/${routeName}`, routeModule.default);
  console.log(`Ruta /api/${routeName}`);
}

export default router;

