import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/experiments
router.get('/', (req, res) => {
  const { search, status, projectId } = req.query;
  let sql = `
    SELECT e.*, p.name as project_name, pr.name as protocol_name
    FROM experiments e
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN protocols pr ON e.protocol_id = pr.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'ALL') {
    sql += ' AND e.status = ?';
    params.push(status);
  }

  if (projectId && projectId !== 'ALL') {
    sql += ' AND e.project_id = ?';
    params.push(projectId);
  }

  if (search) {
    sql += ' AND (e.name LIKE ? OR e.code LIKE ? OR e.id LIKE ? OR e.researcher LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY e.created_at DESC';

  const rows = db.prepare(sql).all(...params);

  // Attach observations and sample count
  const obsStmt = db.prepare('SELECT timestamp, note, recorded_by FROM experiment_observations WHERE experiment_id = ? ORDER BY timestamp ASC');
  const sampleStmt = db.prepare('SELECT id FROM samples WHERE associated_experiment_id = ?');
  const datasetStmt = db.prepare('SELECT id FROM datasets WHERE associated_experiment_id = ?');

  const mapped = rows.map((e) => {
    let params = {};
    try {
      params = e.parameters_json ? JSON.parse(e.parameters_json) : {};
    } catch {
      params = {};
    }

    const observations = obsStmt.all(e.id);
    const sampleIds = sampleStmt.all(e.id).map(s => s.id);
    const datasetIds = datasetStmt.all(e.id).map(d => d.id);

    return {
      id: e.id,
      code: e.code,
      name: e.name,
      projectId: e.project_id,
      projectName: e.project_name || 'Unassigned Project',
      protocolId: e.protocol_id,
      protocolName: e.protocol_name || 'Laboratory SOP',
      protocolVersion: e.protocol_version,
      researcher: e.researcher,
      operator: e.operator,
      startDate: e.start_date,
      completionDate: e.completion_date,
      status: e.status,
      description: e.description,
      parameters: params,
      observations,
      sampleIds,
      datasetIds
    };
  });

  res.json({ success: true, data: mapped });
});

// GET /api/experiments/:id
router.get('/:id', (req, res) => {
  const e = db.prepare(`
    SELECT e.*, p.name as project_name, pr.name as protocol_name
    FROM experiments e
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN protocols pr ON e.protocol_id = pr.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!e) {
    return res.status(404).json({ success: false, error: 'Experiment not found.' });
  }

  const observations = db.prepare('SELECT timestamp, note, recorded_by FROM experiment_observations WHERE experiment_id = ? ORDER BY timestamp ASC').all(e.id);
  const samples = db.prepare('SELECT * FROM samples WHERE associated_experiment_id = ?').all(e.id);
  const datasets = db.prepare('SELECT * FROM datasets WHERE associated_experiment_id = ?').all(e.id);

  let params = {};
  try {
    params = e.parameters_json ? JSON.parse(e.parameters_json) : {};
  } catch {
    params = {};
  }

  res.json({
    success: true,
    data: {
      id: e.id,
      code: e.code,
      name: e.name,
      projectId: e.project_id,
      projectName: e.project_name,
      protocolId: e.protocol_id,
      protocolName: e.protocol_name,
      protocolVersion: e.protocol_version,
      researcher: e.researcher,
      operator: e.operator,
      startDate: e.start_date,
      completionDate: e.completion_date,
      status: e.status,
      description: e.description,
      parameters: params,
      observations,
      samples,
      datasets
    }
  });
});

// POST /api/experiments
router.post('/', requireRole(['Principal Investigator', 'Research Scientist', 'System Administrator']), (req, res) => {
  const { name, code, projectId, protocolId, protocolVersion, researcher, operator, startDate, status, description, parameters } = req.body;

  if (!name || !projectId || !protocolId) {
    return res.status(400).json({ success: false, error: 'Experiment title, project ID, and protocol ID are required.' });
  }

  // Count to generate ID
  const countRow = db.prepare('SELECT COUNT(*) as count FROM experiments').get();
  const id = `EXP-${new Date().getFullYear()}-${String(countRow.count + 1).padStart(3, '0')}`;

  // Fetch protocol's current version if not supplied
  let version = protocolVersion;
  if (!version) {
    const prot = db.prepare('SELECT version FROM protocols WHERE id = ?').get(protocolId);
    version = prot?.version || 'v1.0';
  }

  const stmt = db.prepare(`
    INSERT INTO experiments (id, code, name, project_id, protocol_id, protocol_version, researcher, operator, start_date, status, description, parameters_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    code || id,
    name,
    projectId,
    protocolId,
    version,
    researcher || req.user.fullName,
    operator || researcher || req.user.fullName,
    startDate || new Date().toISOString().split('T')[0],
    status || 'In Progress',
    description || null,
    JSON.stringify(parameters || {})
  );

  // Initial observation log
  const obsStmt = db.prepare(`
    INSERT INTO experiment_observations (id, experiment_id, timestamp, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  const obsId = `OBS-${Date.now().toString(36)}`;
  const obsTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
  obsStmt.run(obsId, id, obsTime, 'Experiment initialized and parameters locked under SOP.', req.user.fullName);

  recordAuditLog('experiment_created', `Experiment ${id} Created`, `${name} under SOP ${version}`, req, 'experiment', id);

  res.status(201).json({
    success: true,
    data: {
      id,
      code: code || id,
      name,
      projectId,
      protocolId,
      protocolVersion: version,
      researcher: researcher || req.user.fullName,
      operator: operator || researcher || req.user.fullName,
      startDate: startDate || new Date().toISOString().split('T')[0],
      status: status || 'In Progress',
      description,
      parameters: parameters || {},
      observations: [{ timestamp: obsTime, note: 'Experiment initialized and parameters locked under SOP.', recorded_by: req.user.fullName }]
    }
  });
});

// POST /api/experiments/:id/observations
router.post('/:id/observations', (req, res) => {
  const { note } = req.body;
  const { id } = req.params;

  if (!note || !note.trim()) {
    return res.status(400).json({ success: false, error: 'Observation note text is required.' });
  }

  const exp = db.prepare('SELECT id FROM experiments WHERE id = ?').get(id);
  if (!exp) {
    return res.status(404).json({ success: false, error: 'Experiment not found.' });
  }

  const obsId = `OBS-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const author = req.user?.fullName || 'Senior Researcher';

  db.prepare(`
    INSERT INTO experiment_observations (id, experiment_id, timestamp, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(obsId, id, timestamp, note.trim(), author);

  recordAuditLog('observation_logged', `Observation Logged on ${id}`, note.trim(), req, 'experiment', id);

  res.status(201).json({
    success: true,
    data: { id: obsId, experiment_id: id, timestamp, note: note.trim(), recorded_by: author }
  });
});

// PUT /api/experiments/:id
router.put('/:id', requireRole(['Principal Investigator', 'Research Scientist', 'Bioinformatics Analyst', 'System Administrator']), (req, res) => {
  const { name, status, description, parameters, completionDate } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Experiment not found.' });
  }

  const stmt = db.prepare(`
    UPDATE experiments
    SET name = ?, status = ?, description = ?, parameters_json = ?, completion_date = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    name || existing.name,
    status || existing.status,
    description !== undefined ? description : existing.description,
    parameters ? JSON.stringify(parameters) : existing.parameters_json,
    completionDate !== undefined ? completionDate : existing.completion_date,
    id
  );

  recordAuditLog('experiment_updated', `Experiment ${id} Updated`, `Status: ${status || existing.status}`, req, 'experiment', id);

  res.json({ success: true, message: `Experiment ${id} updated.` });
});

// DELETE /api/experiments/:id
router.delete('/:id', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Experiment not found.' });
  }

  db.prepare('DELETE FROM experiments WHERE id = ?').run(id);
  recordAuditLog('experiment_deleted', `Experiment ${id} Deleted`, `${existing.name}`, req, 'experiment', id);

  res.json({ success: true, message: `Experiment ${id} deleted.` });
});

export default router;
