import db from '../db/index.js';

export function recordAuditLog(eventType, actionTitle, details, req, entityType = null, entityId = null) {
  try {
    const id = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const userName = req?.user?.fullName || 'Senior Researcher';
    const userId = req?.user?.id || null;

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, event_type, action_title, details, user_id, user_name, entity_type, entity_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      eventType,
      actionTitle,
      typeof details === 'object' ? JSON.stringify(details) : String(details),
      userId,
      userName,
      entityType,
      entityId
    );
  } catch (err) {
    console.error('[BioSprint Audit] Failed to record audit log:', err);
  }
}
