import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force demo environment variables BEFORE any DB imports
process.env.PORT = process.env.PORT || '5001';
process.env.DB_FILE = 'data/biosprint_demo.db';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';
process.env.IS_DEMO_MODE = 'true';

dotenv.config();

import db from './db/index.js';
import { runMigrations } from './db/migrate.js';
import { seedDemoDatabase } from './db/seedDemo.js';
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

// Initialize DB schema on isolated demo database
runMigrations();

// Auto-seed demo database if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('[BioSprint Demo] Fresh demo database detected. Auto-seeding demonstration personas and records...');
  seedDemoDatabase(db);
}

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: [
    CLIENT_ORIGIN,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Authentication filter
app.use(authenticateToken);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'Faculty Demonstration Environment',
    service: 'BioSprint Engine Demo Server',
    database: 'data/biosprint_demo.db (ISOLATED)',
    port: PORT,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Demo Reset Endpoint
app.post('/api/demo/reset', (req, res) => {
  try {
    seedDemoDatabase(db);
    res.json({
      success: true,
      message: 'Faculty demonstration database (biosprint_demo.db) successfully restored to baseline records.'
    });
  } catch (err) {
    console.error('[Demo Reset Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Standard API Routes
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
  res.status(404).json({ success: false, error: `Demo API route '${req.method} ${req.url}' not found.` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[BioSprint Demo Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Demo Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🧪 BioSprint Engine — FACULTY DEMO BACKEND SERVER   `);
  console.log(`  Running on: http://localhost:${PORT}                 `);
  console.log(`  Health Check: http://localhost:${PORT}/health        `);
  console.log(`  Database: server/data/biosprint_demo.db (ISOLATED)   `);
  console.log(`  Client Allowed Origin: ${CLIENT_ORIGIN}              `);
  console.log(`  Demo Reset Endpoint: POST http://localhost:${PORT}/api/demo/reset `);
  console.log(`=======================================================`);
});
