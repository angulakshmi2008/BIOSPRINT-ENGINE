import express from 'express';
import fs from 'fs';
import db, { uploadsDir } from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';
import { seedDevelopmentFixtures } from '../db/seed.js';

const router = express.Router();

// GET /api/settings
router.get('/', (req, res) => {
  const settingsRows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const r of settingsRows) {
    settings[r.key] = r.value === 'true' ? true : r.value === 'false' ? false : r.value;
  }

  // Calculate actual storage usage on disk
  let totalUploadBytes = 0;
  try {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      const stat = fs.statSync(`${uploadsDir}/${f}`);
      totalUploadBytes += stat.size;
    }
  } catch {}

  const usedGB = Math.round((totalUploadBytes / (1024 * 1024 * 1024)) * 100) / 100;
  const limitGB = Number(settings.storageQuotaLimitGB) || 500;

  res.json({
    success: true,
    data: {
      preferences: {
        defaultStorageTemp: settings.defaultStorageTemp || '-80°C Ultra-Low Freezer',
        sequencingQCThreshold: settings.sequencingQCThreshold || 'Q30 (99.9% base accuracy)',
        autoProvenanceHashing: settings.autoProvenanceHashing ?? true,
        requireProtocolVersionTagging: settings.requireProtocolVersionTagging ?? true,
        enforceFAIRCompliance: settings.enforceFAIRCompliance ?? true,
        storageQuotaLimitGB: limitGB,
        storageQuotaUsedGB: usedGB
      }
    }
  });
});

// PUT /api/settings
router.put('/', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { preferences } = req.body;
  if (!preferences) {
    return res.status(400).json({ success: false, error: 'No preferences payload provided.' });
  }

  const upsertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  for (const [k, v] of Object.entries(preferences)) {
    upsertStmt.run(k, String(v));
  }

  recordAuditLog('settings_updated', 'Laboratory Policies Updated', JSON.stringify(preferences), req, 'settings', 'global');

  res.json({ success: true, message: 'Settings successfully updated.' });
});

// POST /api/settings/reset (Factory Reset - Clears to clean Zero State)
router.post('/reset', requireRole(['System Administrator']), (req, res) => {
  console.log('[BioSprint Admin] Executing Factory Reset to clean zero-state...');

  db.exec(`
    DELETE FROM results;
    DELETE FROM analyses;
    DELETE FROM datasets;
    DELETE FROM experiment_observations;
    DELETE FROM samples;
    DELETE FROM experiments;
    DELETE FROM protocols;
    DELETE FROM projects;
  `);

  // Clear uploaded physical files
  try {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      fs.unlinkSync(`${uploadsDir}/${f}`);
    }
  } catch {}

  recordAuditLog('factory_reset', 'Laboratory State Reset to Zero-State', 'All research entities cleared.', req, 'system', 'all');

  res.json({ success: true, message: 'System research records successfully reset to pristine zero state.' });
});

// POST /api/settings/seed (Load Test Fixtures for demonstration/testing)
router.post('/seed', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  seedDevelopmentFixtures();
  recordAuditLog('fixtures_seeded', 'Loaded Development Test Fixtures', 'Sample CRISPR/GBM records seeded for testing.', req, 'system', 'test');
  res.json({ success: true, message: 'Test fixtures loaded successfully.' });
});

export default router;
