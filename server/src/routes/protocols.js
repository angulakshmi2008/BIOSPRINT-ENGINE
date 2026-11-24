import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/protocols
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM protocols WHERE 1=1';
  const params = [];

  if (category && category !== 'ALL') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR code LIKE ? OR id LIKE ? OR author LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);

  const mapped = rows.map((p) => {
    let steps = [];
    let reagents = [];
    let revisions = [];

    try { steps = p.steps_json ? JSON.parse(p.steps_json) : []; } catch {}
    try { reagents = p.reagents_json ? JSON.parse(p.reagents_json) : []; } catch {}
    try { revisions = p.revisions_json ? JSON.parse(p.revisions_json) : []; } catch {}

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      version: p.version,
      category: p.category,
      author: p.author,
      status: p.status,
      description: p.description,
      steps,
      reagents,
      revisions
    };
  });

  res.json({ success: true, data: mapped });
});

// POST /api/protocols
router.post('/', requireRole(['Principal Investigator', 'Research Scientist', 'System Administrator']), (req, res) => {
  const { name, code, version, category, author, description, steps, reagents } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, error: 'Protocol title and SOP code are required.' });
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM protocols').get();
  const id = `PROT-${100 + countRow.count + 1}`;
  const vers = version || 'v1.0';

  const initialRevisions = [
    {
      version: vers,
      date: new Date().toISOString().split('T')[0],
      author: author || req.user.fullName,
      notes: 'Initial protocol registration.'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO protocols (id, code, name, version, category, author, status, description, steps_json, reagents_json, revisions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    code.toUpperCase(),
    name,
    vers,
    category || 'General Molecular Biology',
    author || req.user.fullName,
    'Validated',
    description || null,
    JSON.stringify(steps || []),
    JSON.stringify(reagents || []),
    JSON.stringify(initialRevisions)
  );

  recordAuditLog('protocol_created', `Protocol ${id} Registered`, `${name} (${vers})`, req, 'protocol', id);

  res.status(201).json({
    success: true,
    data: {
      id,
      code: code.toUpperCase(),
      name,
      version: vers,
      category: category || 'General Molecular Biology',
      author: author || req.user.fullName,
      status: 'Validated',
      description,
      steps: steps || [],
      reagents: reagents || [],
      revisions: initialRevisions
    }
  });
});

// PUT /api/protocols/:id
router.put('/:id', requireRole(['Principal Investigator', 'Research Scientist', 'System Administrator']), (req, res) => {
  const { name, version, category, author, status, description, steps, reagents, revisionNotes } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM protocols WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Protocol not found.' });
  }

  let revisions = [];
  try {
    revisions = existing.revisions_json ? JSON.parse(existing.revisions_json) : [];
  } catch {}

  const newVersion = version || existing.version;
  if (newVersion !== existing.version || revisionNotes) {
    revisions.unshift({
      version: newVersion,
      date: new Date().toISOString().split('T')[0],
      author: author || req.user.fullName,
      notes: revisionNotes || 'Protocol procedures revised.'
    });
  }

  const stmt = db.prepare(`
    UPDATE protocols
    SET name = ?, version = ?, category = ?, author = ?, status = ?, description = ?, steps_json = ?, reagents_json = ?, revisions_json = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    name || existing.name,
    newVersion,
    category || existing.category,
    author || existing.author,
    status || existing.status,
    description !== undefined ? description : existing.description,
    steps ? JSON.stringify(steps) : existing.steps_json,
    reagents ? JSON.stringify(reagents) : existing.reagents_json,
    JSON.stringify(revisions),
    id
  );

  recordAuditLog('protocol_revised', `Protocol ${id} Revised to ${newVersion}`, revisionNotes || 'Updated steps/reagents', req, 'protocol', id);

  res.json({ success: true, message: `Protocol ${id} updated to ${newVersion}.` });
});

// DELETE /api/protocols/:id
router.delete('/:id', requireRole(['Principal Investigator', 'System Administrator']), (req, res) => {
  const { id } = req.params;

  // Check if experiments rely on this protocol
  const linkedExp = db.prepare('SELECT id FROM experiments WHERE protocol_id = ?').all(id);
  if (linkedExp.length > 0) {
    return res.status(409).json({
      success: false,
      error: `Cannot delete protocol ${id}: it is referenced by ${linkedExp.length} active experiment(s) for 21 CFR Part 11 reproducibility.`
    });
  }

  db.prepare('DELETE FROM protocols WHERE id = ?').run(id);
  recordAuditLog('protocol_deleted', `Protocol ${id} Deleted`, `Removed from SOP registry`, req, 'protocol', id);

  res.json({ success: true, message: `Protocol ${id} deleted.` });
});

export default router;
