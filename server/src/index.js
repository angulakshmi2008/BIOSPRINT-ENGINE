import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment configuration
dotenv.config();

import { runMigrations } from './db/migrate.js';
import { authenticateToken, requireAuth } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import experimentsRoutes from './routes/experiments.js';
import protocolsRoutes from './routes/protocols.js';
import samplesRoutes from './routes/samples.js';
import datasetsRoutes from './routes/datasets.js';
import analysesRoutes from './routes/analyses.js';
import resultsRoutes from './routes/results.js';
import provenanceRoutes from './routes/provenance.js';
import reportsRoutes from './routes/reports.js';
import auditLogsRoutes from './routes/auditLogs.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema
runMigrations();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing localhost, configured CLIENT_ORIGIN, and Vercel domains
const rawClientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const configuredOrigins = rawClientOrigin
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://biosprint-engine.vercel.app'
];

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, mobile, or requests with no origin
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    const isAllowed =
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(normalizedOrigin) ||
      defaultAllowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`), false);
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Authentication filter (attaches user if token present)
app.use(authenticateToken);

// Health check endpoint for Cloud Probes (Docker, Render, Kubernetes, Frontend)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BioSprint Engine API Server',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', requireAuth, projectsRoutes);
app.use('/api/experiments', requireAuth, experimentsRoutes);
app.use('/api/protocols', requireAuth, protocolsRoutes);
app.use('/api/samples', requireAuth, samplesRoutes);
app.use('/api/datasets', requireAuth, datasetsRoutes);
app.use('/api/analyses', requireAuth, analysesRoutes);
app.use('/api/results', requireAuth, resultsRoutes);
app.use('/api/provenance', requireAuth, provenanceRoutes);
app.use('/api/reports', requireAuth, reportsRoutes);
app.use('/api/audit-logs', requireAuth, auditLogsRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `API route '${req.method} ${req.url}' not found.` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[BioSprint Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  BioSprint Engine REST API & Provenance Server       `);
  console.log(`  Running on: http://localhost:${PORT}                 `);
  console.log(`  Health Check: http://localhost:${PORT}/health        `);
  console.log(`  Client Allowed Origin: ${CLIENT_ORIGIN}              `);
  console.log(`=======================================================`);
});

export default app;
