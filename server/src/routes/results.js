import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/results
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM results WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR id LIKE ? OR experiment_id LIKE ? OR lead_scientist LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);

  const expStmt = db.prepare('SELECT name FROM experiments WHERE id = ?');

  const mapped = rows.map((r) => {
    const exp = r.experiment_id ? expStmt.get(r.experiment_id) : null;
    return {
      id: r.id,
      experimentId: r.experiment_id,
      experimentName: exp?.name || 'Assay Run',
      projectId: r.project_id,
      title: r.title,
      summary: r.summary,
      primaryMetric: r.primary_metric,
      secondaryMetric: r.secondary_metric,
      validationStatus: r.validation_status,
      leadScientist: r.lead_scientist,
      publishedDate: r.published_date,
      reproducibilityScore: r.reproducibility_score,
      conclusions: r.conclusions
    };
  });

  res.json({ success: true, data: mapped });
});

// POST /api/results
router.post('/', requireRole(['Principal Investigator', 'Research Scientist', 'System Administrator']), (req, res) => {
  const { experimentId, projectId, title, summary, primaryMetric, secondaryMetric, validationStatus, leadScientist, publishedDate, reproducibilityScore, conclusions } = req.body;

  if (!title || !primaryMetric) {
    return res.status(400).json({ success: false, error: 'Result title and primary metric are required.' });
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM results').get();
  const id = `RES-${new Date().getFullYear()}-${String(countRow.count + 1).padStart(3, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO results (id, experiment_id, project_id, title, summary, primary_metric, secondary_metric, validation_status, lead_scientist, published_date, reproducibility_score, conclusions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    experimentId || null,
    projectId || null,
    title,
    summary || '',
    primaryMetric,
    secondaryMetric || null,
    validationStatus || 'Validated',
    leadScientist || req.user.fullName,
    publishedDate || new Date().toISOString().split('T')[0],
    reproducibilityScore || '98.5%',
    conclusions || null
  );

  recordAuditLog('result_certified', `Result ${id} Certified`, `${title} (${primaryMetric})`, req, 'result', id);

  res.status(201).json({
    success: true,
    data: {
      id,
      experimentId,
      projectId,
      title,
      summary,
      primaryMetric,
      secondaryMetric,
      validationStatus: validationStatus || 'Validated',
      leadScientist: leadScientist || req.user.fullName,
      publishedDate: publishedDate || new Date().toISOString().split('T')[0],
      reproducibilityScore: reproducibilityScore || '98.5%',
      conclusions
    }
  });
});

// DELETE /api/results/:id
router.delete('/:id', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM results WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Result not found.' });
  }

  db.prepare('DELETE FROM results WHERE id = ?').run(id);
  recordAuditLog('result_deleted', `Result ${id} Removed`, `${existing.title}`, req, 'result', id);

  res.json({ success: true, message: `Result ${id} deleted.` });
});

export default router;
