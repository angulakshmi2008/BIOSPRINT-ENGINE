import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/projects
router.get('/', (req, res) => {
  const { search, status } = req.query;
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (status && status !== 'ALL') {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR code LIKE ? OR lead_researcher LIKE ? OR id LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);

  // Compute linked experiments count
  const expCountStmt = db.prepare('SELECT COUNT(*) as count FROM experiments WHERE project_id = ?');
  const sampleCountStmt = db.prepare('SELECT COUNT(*) as count FROM samples WHERE project_id = ?');

  const mapped = rows.map((p) => {
    const expCount = expCountStmt.get(p.id)?.count || 0;
    const sampleCount = sampleCountStmt.get(p.id)?.count || 0;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      leadResearcher: p.lead_researcher,
      department: p.department,
      startDate: p.start_date,
      targetEndDate: p.target_end_date,
      status: p.status,
      budget: p.budget,
      experimentsCount: expCount,
      samplesCount: sampleCount
    };
  });

  res.json({ success: true, data: mapped });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!p) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const experiments = db.prepare('SELECT id, name, status, start_date FROM experiments WHERE project_id = ?').all(p.id);

  res.json({
    success: true,
    data: {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      leadResearcher: p.lead_researcher,
      department: p.department,
      startDate: p.start_date,
      targetEndDate: p.target_end_date,
      status: p.status,
      budget: p.budget,
      experiments
    }
  });
});

// POST /api/projects
router.post('/', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { name, code, description, leadResearcher, department, startDate, targetEndDate, budget, status } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, error: 'Project title and code are required.' });
  }

  // Count existing projects to generate sequential ID
  const countRow = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  const id = `PRJ-${String(countRow.count + 1).padStart(3, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO projects (id, code, name, description, lead_researcher, department, start_date, target_end_date, status, budget)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(
      id,
      code.toUpperCase(),
      name,
      description || null,
      leadResearcher || req.user.fullName,
      department || req.user.department,
      startDate || new Date().toISOString().split('T')[0],
      targetEndDate || null,
      status || 'Active',
      budget || null
    );

    recordAuditLog('project_created', `Project ${id} Created`, `${name} (${code})`, req, 'project', id);

    res.status(201).json({
      success: true,
      data: {
        id,
        code: code.toUpperCase(),
        name,
        description,
        leadResearcher: leadResearcher || req.user.fullName,
        department,
        startDate,
        targetEndDate,
        status: status || 'Active',
        budget,
        experimentsCount: 0,
        samplesCount: 0
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: `Project code '${code}' is already registered.` });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { name, code, description, leadResearcher, department, startDate, targetEndDate, status, budget } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const stmt = db.prepare(`
    UPDATE projects
    SET name = ?, code = ?, description = ?, lead_researcher = ?, department = ?, start_date = ?, target_end_date = ?, status = ?, budget = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    name || existing.name,
    code ? code.toUpperCase() : existing.code,
    description !== undefined ? description : existing.description,
    leadResearcher || existing.lead_researcher,
    department || existing.department,
    startDate || existing.start_date,
    targetEndDate !== undefined ? targetEndDate : existing.target_end_date,
    status || existing.status,
    budget !== undefined ? budget : existing.budget,
    id
  );

  recordAuditLog('project_updated', `Project ${id} Updated`, `Status: ${status || existing.status}`, req, 'project', id);

  res.json({ success: true, message: `Project ${id} updated.` });
});

// DELETE /api/projects/:id
router.delete('/:id', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  recordAuditLog('project_deleted', `Project ${id} Deleted`, `${existing.name}`, req, 'project', id);

  res.json({ success: true, message: `Project ${id} deleted.` });
});

export default router;
