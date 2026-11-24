import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/analyses
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM analyses WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR id LIKE ? OR pipeline_version LIKE ? OR analyst LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);

  const mapped = rows.map((a) => {
    let parameters = {};
    let metrics = {};
    try { parameters = a.parameters_json ? JSON.parse(a.parameters_json) : {}; } catch {}
    try { metrics = a.metrics_json ? JSON.parse(a.metrics_json) : {}; } catch {}

    return {
      id: a.id,
      name: a.name,
      pipelineVersion: a.pipeline_version,
      associatedExperiment: a.associated_experiment_id,
      datasetId: a.dataset_id,
      analyst: a.analyst,
      executionDate: a.execution_date,
      methods: a.methods,
      parameters,
      metrics,
      status: a.status
    };
  });

  res.json({ success: true, data: mapped });
});

// POST /api/analyses
router.post('/', requireRole(['Principal Investigator', 'Bioinformatics Analyst', 'Research Scientist', 'System Administrator']), (req, res) => {
  const { name, pipelineVersion, associatedExperiment, datasetId, analyst, executionDate, methods, parameters, metrics } = req.body;

  if (!name || !associatedExperiment) {
    return res.status(400).json({ success: false, error: 'Analysis title and associated experiment are required.' });
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM analyses').get();
  const id = `ANA-${new Date().getFullYear()}-${String(countRow.count + 1).padStart(3, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO analyses (id, name, pipeline_version, associated_experiment_id, dataset_id, analyst, execution_date, methods, parameters_json, metrics_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name,
    pipelineVersion || 'Nextflow / Bioconductor BioSprint Pipeline v2.4',
    associatedExperiment,
    datasetId || null,
    analyst || req.user.fullName,
    executionDate || new Date().toISOString().split('T')[0],
    methods || 'Standard alignment and differential expression pipeline.',
    JSON.stringify(parameters || {}),
    JSON.stringify(metrics || {}),
    'Completed'
  );

  recordAuditLog('analysis_executed', `Analysis ${id} Completed`, `${name} (${pipelineVersion})`, req, 'analysis', id);

  res.status(201).json({
    success: true,
    data: {
      id,
      name,
      pipelineVersion: pipelineVersion || 'Nextflow / Bioconductor BioSprint Pipeline v2.4',
      associatedExperiment,
      datasetId,
      analyst: analyst || req.user.fullName,
      executionDate: executionDate || new Date().toISOString().split('T')[0],
      methods,
      parameters: parameters || {},
      metrics: metrics || {},
      status: 'Completed'
    }
  });
});

// DELETE /api/analyses/:id
router.delete('/:id', requireRole(['Principal Investigator', 'Bioinformatics Analyst', 'System Administrator']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM analyses WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Analysis not found.' });
  }

  db.prepare('DELETE FROM analyses WHERE id = ?').run(id);
  recordAuditLog('analysis_deleted', `Analysis ${id} Removed`, `${existing.name}`, req, 'analysis', id);

  res.json({ success: true, message: `Analysis ${id} deleted.` });
});

export default router;
