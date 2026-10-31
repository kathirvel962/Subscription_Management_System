import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { isPostgresConnected } from './config/db.js';
import apiRouter from './routes/api.js';
import { logger } from './utils/logger.js';
import { sendError, sendSuccess } from './utils/responseHelper.js';

export const app = express();

// Security and standard middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseMode: isPostgresConnected ? 'PostgreSQL (Prisma)' : 'In-Memory (Resilient Local Store)',
      version: '1.0.0',
      system: 'Brightloop Subscription Management Engine',
    },
    'System operational.'
  );
});

// Mount primary API v1 router
app.use('/api/v1', apiRouter);

// Serve static compiled frontend if available
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../dist/client');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return next();
    }
    return res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// 404 Not Found Catch-All for unmatched API routes
app.use((req: Request, res: Response) => {
  return sendError(res, `Endpoint ${req.method} ${req.originalUrl} not found.`, 404);
});

// Global Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled Exception: ${err.message}`, err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, status);
});

export default app;
