import db from './index.js';
import bcrypt from 'bcryptjs';

export function runMigrations(customDb) {
  const targetDb = customDb || db;
  console.log('[BioSprint DB] Executing Relational Schema Migrations...');

  // 1. Users table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      access_code_hash TEXT,
      google_id TEXT,
      avatar_url TEXT,
      status TEXT DEFAULT 'active',
      failed_login_attempts INTEGER DEFAULT 0,
      lockout_until TEXT,
      last_login_at TEXT,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      institution TEXT,
      orcid TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safely add any new columns if table already existed
  const userColumns = [
    { name: 'access_code_hash', type: 'TEXT' },
    { name: 'google_id', type: 'TEXT' },
    { name: 'avatar_url', type: 'TEXT' },
    { name: 'status', type: "TEXT DEFAULT 'active'" },
    { name: 'failed_login_attempts', type: 'INTEGER DEFAULT 0' },
    { name: 'lockout_until', type: 'TEXT' },
    { name: 'last_login_at', type: 'TEXT' }
  ];
  for (const col of userColumns) {
    try {
      targetDb.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
    } catch {
      // Column already exists
    }
  }

  // 2. Projects table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      lead_researcher TEXT NOT NULL,
      department TEXT,
      start_date TEXT NOT NULL,
      target_end_date TEXT,
      status TEXT DEFAULT 'Active',
      budget TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 3. Protocols table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS protocols (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT DEFAULT 'Validated',
      description TEXT,
      steps_json TEXT NOT NULL,
      reagents_json TEXT,
      revisions_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 4. Experiments table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT NOT NULL,
      project_id TEXT,
      protocol_id TEXT,
      protocol_version TEXT NOT NULL,
      researcher TEXT NOT NULL,
      operator TEXT,
      start_date TEXT NOT NULL,
      completion_date TEXT,
      status TEXT DEFAULT 'In Progress',
      description TEXT,
      parameters_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL
    );
  `);

  // 5. Experiment Observations table (Chronological bench notes)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS experiment_observations (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
    );
  `);

  // 6. Samples table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS samples (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sample_type TEXT NOT NULL,
      organism TEXT NOT NULL,
      source TEXT,
      storage_location TEXT NOT NULL,
      temperature TEXT NOT NULL,
      concentration TEXT,
      volume TEXT,
      aliquots INTEGER DEFAULT 1,
      biosafety_level TEXT DEFAULT 'BSL-1',
      collection_date TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      associated_experiment_id TEXT,
      project_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (associated_experiment_id) REFERENCES experiments(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
  `);

  // 7. Datasets table (Real files with genuine byte sizes and SHA-256 digests)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      format TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      checksum_sha256 TEXT NOT NULL,
      associated_experiment_id TEXT,
      researcher TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      read_count TEXT,
      status TEXT DEFAULT 'Validated',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (associated_experiment_id) REFERENCES experiments(id) ON DELETE SET NULL
    );
  `);

  // 8. Analyses table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pipeline_version TEXT NOT NULL,
      associated_experiment_id TEXT,
      dataset_id TEXT,
      analyst TEXT NOT NULL,
      execution_date TEXT NOT NULL,
      methods TEXT,
      parameters_json TEXT,
      metrics_json TEXT,
      status TEXT DEFAULT 'Completed',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (associated_experiment_id) REFERENCES experiments(id) ON DELETE SET NULL,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    );
  `);

  // 9. Results table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      experiment_id TEXT,
      project_id TEXT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      primary_metric TEXT NOT NULL,
      secondary_metric TEXT,
      validation_status TEXT DEFAULT 'Validated',
      lead_scientist TEXT NOT NULL,
      published_date TEXT NOT NULL,
      reproducibility_score TEXT NOT NULL,
      conclusions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
  `);

  // 10. Audit Logs table (FDA 21 CFR Part 11 append-only stream)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      action_title TEXT NOT NULL,
      details TEXT,
      user_id TEXT,
      user_name TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

  // 11. Application Settings table
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Initial system configuration
  targetDb.exec(`
    INSERT OR IGNORE INTO settings (key, value) VALUES
    ('defaultStorageTemp', '-80°C Ultra-Low Freezer'),
    ('sequencingQCThreshold', 'Q30 (99.9% base accuracy)'),
    ('autoProvenanceHashing', 'true'),
    ('requireProtocolVersionTagging', 'true'),
    ('enforceFAIRCompliance', 'true'),
    ('storageQuotaLimitGB', '500');
  `);

  console.log('[BioSprint DB] Relational Schema Migration successfully completed with clean zero-state tables (0 fake users).');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations();
}
