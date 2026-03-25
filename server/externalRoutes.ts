/**
 * externalRoutes.ts
 *
 * Single-responsibility loader that mounts the external survey router
 * onto an Express application instance.
 *
 * Usage (in any entry point OTHER than index.ts):
 *
 *   import { mountExternalRoutes } from './externalRoutes.js';
 *   mountExternalRoutes(app);
 *
 * Or if you prefer to mount directly inside index.ts at a later date (optional):
 *
 *   import externalRouter from './externalCreate.js';
 *   app.use('/', externalRouter);
 */

import { Express } from 'express';
import externalRouter from './externalCreate.js';

export function mountExternalRoutes(app: Express): void {
    app.use('/', externalRouter);
    console.log('✅ External routes mounted: POST /external/create, GET /external/router');
}
