import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const rows = db.prepare(`
    SELECT id, event_type, action_title, details, user_id, user_name, entity_type, entity_id, timestamp
    FROM audit_logs
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(limit);

  const mapped = rows.map((r) => ({
    id: r.id,
    type: r.event_type,
    title: r.action_title,
    details: r.details,
    userId: r.user_id,
    user: r.user_name,
    entityType: r.entity_type,
    entityId: r.entity_id,
    timestamp: r.timestamp
  }));

  res.json({ success: true, data: mapped });
});

export default router;
