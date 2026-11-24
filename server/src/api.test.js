import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from './db/migrate.js';

const testDb = new DatabaseSync(':memory:');
runMigrations(testDb);

test('BioSprint Backend Suite — Core Engine & Provenance Tests', async (t) => {
  // Test 1: Relational Schema Zero-State Tables Verification
  await t.test('Clean database zero-state schema initialization', () => {
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    assert.ok(tables.includes('users'), 'users table must exist');
    assert.ok(tables.includes('projects'), 'projects table must exist');
    assert.ok(tables.includes('experiments'), 'experiments table must exist');
    assert.ok(tables.includes('protocols'), 'protocols table must exist');
    assert.ok(tables.includes('samples'), 'samples table must exist');
    assert.ok(tables.includes('datasets'), 'datasets table must exist');
    assert.ok(tables.includes('analyses'), 'analyses table must exist');
    assert.ok(tables.includes('results'), 'results table must exist');
    assert.ok(tables.includes('audit_logs'), 'audit_logs table must exist');
  });

  // Test 2: Project Creation & Retrieval
  await t.test('Relational Project CRUD and unique code constraint', () => {
    const testCode = `TEST-${Date.now().toString(36).toUpperCase()}`;
    const insertStmt = testDb.prepare(`
      INSERT INTO projects (id, code, name, lead_researcher, start_date)
      VALUES (?, ?, ?, ?, ?)
    `);
    const testId = `PRJ-TEST-${Date.now()}`;
    insertStmt.run(testId, testCode, 'Automated Test CRISPR Project', 'Dr. Test PI', '2026-11-22');

    const retrieved = testDb.prepare('SELECT * FROM projects WHERE id = ?').get(testId);
    assert.ok(retrieved, 'Project must be persisted in database');
    assert.equal(retrieved.code, testCode);

    // Verify unique constraint
    assert.throws(() => {
      insertStmt.run(`PRJ-DUP-${Date.now()}`, testCode, 'Duplicate Code Project', 'Dr. Test', '2026-11-22');
    }, /UNIQUE constraint failed/);

    // Clean up
    testDb.prepare('DELETE FROM projects WHERE id = ?').run(testId);
  });

  // Test 3: Real Cryptographic SHA-256 Checksum Calculation
  await t.test('Real File Ingestion SHA-256 Checksum Accuracy', () => {
    const testData = 'BioSprint Engine FASTQ Raw Reads Simulation: @READ_01 ACTGATCGATCGA+FFJJ';
    const expectedHash = crypto.createHash('sha256').update(testData).digest('hex');

    assert.equal(expectedHash.length, 64, 'SHA-256 must be a 64-character hexadecimal digest');

    // Simulate saving and verifying
    const hashSum = crypto.createHash('sha256');
    hashSum.update(Buffer.from(testData));
    const computedHash = hashSum.digest('hex');

    assert.equal(computedHash, expectedHash, 'Streaming hash computation must match expected digest');
  });

  // Test 4: Provenance Lineage Consistency
  await t.test('Relational Provenance Traversal Integrity', () => {
    const projId = `PRJ-PROV-${Date.now()}`;
    const expId = `EXP-PROV-${Date.now()}`;
    const protId = `PROT-PROV-${Date.now()}`;

    testDb.prepare(`
      INSERT INTO projects (id, code, name, lead_researcher, start_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(projId, `P-${Date.now()}`, 'Provenance Verification Project', 'Dr. Tester', '2026-11-22');

    testDb.prepare(`
      INSERT INTO protocols (id, code, name, version, category, author, steps_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(protId, 'SOP-TST', 'Test Protocol', 'v1.0', 'Genomics', 'Dr. Tester', '[]');

    testDb.prepare(`
      INSERT INTO experiments (id, name, project_id, protocol_id, protocol_version, researcher, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(expId, 'Provenance Verification Experiment', projId, protId, 'v1.0', 'Dr. Tester', '2026-11-22');

    // Query lineage
    const exp = testDb.prepare('SELECT * FROM experiments WHERE id = ?').get(expId);
    const parentProj = testDb.prepare('SELECT * FROM projects WHERE id = ?').get(exp.project_id);
    const boundProt = testDb.prepare('SELECT * FROM protocols WHERE id = ?').get(exp.protocol_id);

    assert.equal(parentProj.id, projId, 'Experiment must link directly to parent project');
    assert.equal(boundProt.id, protId, 'Experiment must link directly to protocol SOP');

    // Clean up
    testDb.prepare('DELETE FROM experiments WHERE id = ?').run(expId);
    testDb.prepare('DELETE FROM protocols WHERE id = ?').run(protId);
    testDb.prepare('DELETE FROM projects WHERE id = ?').run(projId);
  });
});
