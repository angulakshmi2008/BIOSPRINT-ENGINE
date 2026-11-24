import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Helper to escape CSV values
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// GET /api/reports/summary
router.get('/summary', (req, res) => {
  const projectsCount = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  const experimentsCount = db.prepare('SELECT COUNT(*) as c FROM experiments').get().c;
  const completedExpCount = db.prepare("SELECT COUNT(*) as c FROM experiments WHERE status = 'Completed'").get().c;
  const activeExpCount = db.prepare("SELECT COUNT(*) as c FROM experiments WHERE status IN ('Active', 'In Progress')").get().c;
  const samplesCount = db.prepare('SELECT COUNT(*) as c FROM samples').get().c;
  const datasetsCount = db.prepare('SELECT COUNT(*) as c FROM datasets').get().c;
  const totalDataBytes = db.prepare('SELECT COALESCE(SUM(size_bytes), 0) as s FROM datasets').get().s;
  const resultsCount = db.prepare('SELECT COUNT(*) as c FROM results').get().c;
  const auditLogsCount = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c;

  // Format breakdown
  const formatRows = db.prepare(`
    SELECT format, SUM(size_bytes) as total_bytes, COUNT(*) as count
    FROM datasets
    GROUP BY format
  `).all();

  // Project progress breakdown
  const projectStats = db.prepare(`
    SELECT p.code, p.name,
      COUNT(e.id) as total_experiments,
      SUM(CASE WHEN e.status = 'Completed' THEN 1 ELSE 0 END) as completed_experiments
    FROM projects p
    LEFT JOIN experiments e ON p.id = e.project_id
    GROUP BY p.id
  `).all();

  res.json({
    success: true,
    data: {
      projectsCount,
      experimentsCount,
      completedExpCount,
      activeExpCount,
      samplesCount,
      datasetsCount,
      totalDataBytes: Number(totalDataBytes),
      resultsCount,
      auditLogsCount,
      formatBreakdown: formatRows.map(r => ({ format: r.format, totalBytes: Number(r.total_bytes), count: r.count })),
      projectStats
    }
  });
});

// GET /api/reports/export/:entity (CSV Stream Export)
router.get('/export/:entity', (req, res) => {
  const { entity } = req.params;
  let filename = `BioSprint_${entity}_Export_${new Date().toISOString().split('T')[0]}.csv`;
  let csvContent = '';

  if (entity === 'experiments') {
    const rows = db.prepare('SELECT id, code, name, project_id, protocol_id, protocol_version, researcher, start_date, status FROM experiments').all();
    const headers = ['Experiment ID', 'Code', 'Assay Title', 'Project ID', 'Protocol SOP ID', 'Protocol Version', 'Lead Scientist', 'Start Date', 'Status'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([r.id, r.code, r.name, r.project_id, r.protocol_id, r.protocol_version, r.researcher, r.start_date, r.status].map(escapeCSV).join(','));
    }
    csvContent = lines.join('\n');
  } else if (entity === 'samples') {
    const rows = db.prepare('SELECT id, name, sample_type, organism, storage_location, temperature, concentration, volume, aliquots, biosafety_level, status FROM samples').all();
    const headers = ['Sample ID', 'Sample Name', 'Type', 'Organism', 'Cold Storage Coordinate', 'Temperature', 'Concentration', 'Volume', 'Aliquots', 'BSL', 'Status'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([r.id, r.name, r.sample_type, r.organism, r.storage_location, r.temperature, r.concentration, r.volume, r.aliquots, r.biosafety_level, r.status].map(escapeCSV).join(','));
    }
    csvContent = lines.join('\n');
  } else if (entity === 'datasets') {
    const rows = db.prepare('SELECT id, name, format, size_bytes, checksum_sha256, associated_experiment_id, researcher, upload_date, status FROM datasets').all();
    const headers = ['Dataset ID', 'Filename', 'Format', 'Size (Bytes)', 'Cryptographic SHA-256 Digest', 'Associated Experiment', 'Depositor', 'Upload Date', 'Status'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([r.id, r.name, r.format, r.size_bytes, r.checksum_sha256, r.associated_experiment_id, r.researcher, r.upload_date, r.status].map(escapeCSV).join(','));
    }
    csvContent = lines.join('\n');
  } else if (entity === 'audit-trail') {
    const rows = db.prepare('SELECT id, timestamp, event_type, action_title, details, user_name, entity_type, entity_id FROM audit_logs ORDER BY timestamp DESC').all();
    const headers = ['Event ID', 'UTC Timestamp', 'Event Type', 'Action Description', 'Change Details', 'Operating Scientist', 'Entity Type', 'Entity ID'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([r.id, r.timestamp, r.event_type, r.action_title, r.details, r.user_name, r.entity_type, r.entity_id].map(escapeCSV).join(','));
    }
    csvContent = lines.join('\n');
  } else {
    return res.status(400).json({ success: false, error: 'Unknown export entity requested.' });
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

export default router;
