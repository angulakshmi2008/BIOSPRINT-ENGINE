import express from 'express';
import db from '../db/index.js';
import { requireRole } from '../middleware/auth.js';
import { recordAuditLog } from '../middleware/audit.js';

const router = express.Router();

// GET /api/samples
router.get('/', (req, res) => {
  const { sampleType, status, search } = req.query;
  let sql = 'SELECT * FROM samples WHERE 1=1';
  const params = [];

  if (sampleType && sampleType !== 'ALL') {
    sql += ' AND sample_type = ?';
    params.push(sampleType);
  }

  if (status && status !== 'ALL') {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR id LIKE ? OR storage_location LIKE ? OR organism LIKE ? OR associated_experiment_id LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);

  const mapped = rows.map((s) => ({
    id: s.id,
    name: s.name,
    sampleType: s.sample_type,
    organism: s.organism,
    source: s.source,
    storageLocation: s.storage_location,
    temperature: s.temperature,
    concentration: s.concentration,
    volume: s.volume,
    aliquots: s.aliquots,
    biosafetyLevel: s.biosafety_level,
    collectionDate: s.collection_date,
    status: s.status,
    associatedExperiment: s.associated_experiment_id,
    projectId: s.project_id
  }));

  res.json({ success: true, data: mapped });
});

// POST /api/samples
router.post('/', requireRole(['Principal Investigator', 'Research Scientist', 'Laboratory Technician', 'System Administrator']), (req, res) => {
  const {
    name,
    sampleType,
    organism,
    source,
    storageLocation,
    temperature,
    concentration,
    volume,
    aliquots,
    biosafetyLevel,
    collectionDate,
    status,
    associatedExperiment,
    projectId
  } = req.body;

  if (!name || !storageLocation) {
    return res.status(400).json({ success: false, error: 'Sample name and storage coordinate are required.' });
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM samples').get();
  const id = `SMP-${new Date().getFullYear()}-${String(countRow.count + 101).padStart(4, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO samples (id, name, sample_type, organism, source, storage_location, temperature, concentration, volume, aliquots, biosafety_level, collection_date, status, associated_experiment_id, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name,
    sampleType || 'General Biological Specimen',
    organism || 'Homo sapiens',
    source || null,
    storageLocation,
    temperature || '-80°C',
    concentration || null,
    volume || null,
    aliquots || 1,
    biosafetyLevel || 'BSL-1',
    collectionDate || new Date().toISOString().split('T')[0],
    status || 'Available',
    associatedExperiment || null,
    projectId || null
  );

  recordAuditLog('sample_registered', `Sample ${id} Logged into Storage`, `${name} at [${storageLocation}]`, req, 'sample', id);

  res.status(201).json({
    success: true,
    data: {
      id,
      name,
      sampleType: sampleType || 'General Biological Specimen',
      organism: organism || 'Homo sapiens',
      source,
      storageLocation,
      temperature: temperature || '-80°C',
      concentration,
      volume,
      aliquots: aliquots || 1,
      biosafetyLevel: biosafetyLevel || 'BSL-1',
      collectionDate: collectionDate || new Date().toISOString().split('T')[0],
      status: status || 'Available',
      associatedExperiment,
      projectId
    }
  });
});

// PUT /api/samples/:id
router.put('/:id', requireRole(['Principal Investigator', 'Research Scientist', 'Laboratory Technician', 'System Administrator']), (req, res) => {
  const { name, sampleType, organism, source, storageLocation, temperature, concentration, volume, aliquots, biosafetyLevel, status, associatedExperiment } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM samples WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Sample not found.' });
  }

  const stmt = db.prepare(`
    UPDATE samples
    SET name = ?, sample_type = ?, organism = ?, source = ?, storage_location = ?, temperature = ?, concentration = ?, volume = ?, aliquots = ?, biosafety_level = ?, status = ?, associated_experiment_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    name || existing.name,
    sampleType || existing.sample_type,
    organism || existing.organism,
    source !== undefined ? source : existing.source,
    storageLocation || existing.storage_location,
    temperature || existing.temperature,
    concentration !== undefined ? concentration : existing.concentration,
    volume !== undefined ? volume : existing.volume,
    aliquots !== undefined ? aliquots : existing.aliquots,
    biosafetyLevel || existing.biosafety_level,
    status || existing.status,
    associatedExperiment !== undefined ? associatedExperiment : existing.associated_experiment_id,
    id
  );

  recordAuditLog('sample_updated', `Sample ${id} Updated`, `Location: ${storageLocation || existing.storage_location}`, req, 'sample', id);

  res.json({ success: true, message: `Sample ${id} updated.` });
});

// DELETE /api/samples/:id
router.delete('/:id', requireRole(['Principal Investigator', 'Laboratory Technician', 'System Administrator']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM samples WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Sample not found.' });
  }

  db.prepare('DELETE FROM samples WHERE id = ?').run(id);
  recordAuditLog('sample_deleted', `Sample ${id} Decommissioned`, `${existing.name}`, req, 'sample', id);

  res.json({ success: true, message: `Sample ${id} decommissioned.` });
});

export default router;
