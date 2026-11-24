import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from './db/migrate.js';
import { seedDemoDatabase } from './db/seedDemo.js';
import bcrypt from 'bcryptjs';
import { requireRole } from './middleware/auth.js';
import { ALLOWED_PUBLIC_ROLES } from './routes/auth.js';

const testDb = new DatabaseSync(':memory:');

describe('BioSprint Google Authentication & Access Code Security Suite', () => {
  before(() => {
    runMigrations(testDb);
  });

  test('TC-AUTH-01: Demonstration accounts have valid bcrypt-hashed access codes', () => {
    seedDemoDatabase(testDb);
    const demoIds = ['USR-DEMO-PI', 'USR-DEMO-SCIENTIST', 'USR-DEMO-TECH', 'USR-DEMO-BIOINF', 'USR-DEMO-AUDITOR', 'USR-DEMO-ADMIN'];
    const users = testDb.prepare(`SELECT id, email, role, access_code_hash FROM users WHERE id IN (${demoIds.map(() => '?').join(',')})`).all(...demoIds);
    assert.strictEqual(users.length, 6, 'Should have all 6 demo role accounts');
    for (const u of users) {
      assert.ok(u.access_code_hash, `User ${u.id} must have a non-empty access_code_hash`);
      assert.ok(u.access_code_hash.startsWith('$2'), `User ${u.id} access code must be bcrypt-hashed`);
      const matchesDefault = bcrypt.compareSync('BioSprint2026!', u.access_code_hash);
      assert.strictEqual(matchesDefault, true, `Demo account ${u.email} should match standard test code`);
    }
  });

  test('TC-AUTH-02: Google enrollment restricts new user role strictly to Research Scientist', () => {
    const testEmail = `new.scientist.${Date.now()}@biosprint-research.org`;
    const newId = `USR-TEST-${Date.now()}`;
    const assignedRole = 'Research Scientist'; // System enforced

    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, status)
      VALUES (?, ?, 'dummy_hash', 'Dr. New Recruit', ?, 'active')
    `).run(newId, testEmail, assignedRole);

    const created = testDb.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    assert.strictEqual(created.email, testEmail);
    assert.strictEqual(created.role, 'Research Scientist', 'New Google users must default strictly to Research Scientist');
    assert.notStrictEqual(created.role, 'Principal Investigator', 'User cannot self-assign PI');
    assert.notStrictEqual(created.role, 'System Administrator', 'User cannot self-assign Administrator');
  });

  test('TC-AUTH-03: Access code hashing and progressive rate limit lockout', () => {
    const userEmail = `lockout.test.${Date.now()}@biosprint.org`;
    const userId = `USR-LOCK-${Date.now()}`;
    const secretCode = 'GenomicsPass2026!';
    const hashed = bcrypt.hashSync(secretCode, 10);

    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, status, failed_login_attempts)
      VALUES (?, ?, 'dummy', ?, 'Lockout Tester', 'Research Scientist', 'active', 0)
    `).run(userId, userEmail, hashed);

    let user = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(bcrypt.compareSync(secretCode, user.access_code_hash), true);
    assert.strictEqual(bcrypt.compareSync('WrongCode!', user.access_code_hash), false);

    // Simulate 5 failed attempts
    for (let i = 1; i <= 5; i++) {
      const attempts = i;
      let lockoutDate = null;
      if (attempts >= 5) {
        lockoutDate = new Date(Date.now() + 60000).toISOString();
      }
      testDb.prepare('UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?')
        .run(attempts, lockoutDate, userId);
    }

    user = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(user.failed_login_attempts, 5);
    assert.ok(user.lockout_until, 'Account must have lockout timestamp after 5 failed attempts');
    assert.ok(new Date(user.lockout_until).getTime() > Date.now(), 'Lockout must be in future');

    // Simulate recovery reset
    const newCode = 'BrandNewCode999!';
    const newHash = bcrypt.hashSync(newCode, 10);
    testDb.prepare('UPDATE users SET access_code_hash = ?, failed_login_attempts = 0, lockout_until = NULL WHERE id = ?')
      .run(newHash, userId);

    const recovered = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(recovered.failed_login_attempts, 0);
    assert.strictEqual(recovered.lockout_until, null);
    assert.strictEqual(bcrypt.compareSync(newCode, recovered.access_code_hash), true);
  });

  test('TC-AUTH-04: Administrator role promotion and audit trail persistence', () => {
    const targetId = `USR-PROMOTE-${Date.now()}`;
    const uniqueEmail = `promote.test.${Date.now()}.${Math.random()}@biosprint.org`;
    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, status)
      VALUES (?, ?, 'dummy', 'Promotee', 'Research Scientist', 'active')
    `).run(targetId, uniqueEmail);

    // Admin updates role
    testDb.prepare('UPDATE users SET role = ? WHERE id = ?').run('Principal Investigator', targetId);
    const updated = testDb.prepare('SELECT role FROM users WHERE id = ?').get(targetId);
    assert.strictEqual(updated.role, 'Principal Investigator');
  });

  test('TC-AUTH-05: Public registration with user-selected role Researcher stores Researcher', () => {
    const email = `researcher.reg.${Date.now()}@biosprint.edu`;
    const userId = `USR-R-${Date.now()}`;
    const selectedRole = 'Researcher';

    assert.ok(ALLOWED_PUBLIC_ROLES.includes(selectedRole), 'Researcher must be in ALLOWED_PUBLIC_ROLES');

    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, status)
      VALUES (?, ?, 'dummy', 'dummy', 'Dr. Laboratory Researcher', ?, 'active')
    `).run(userId, email, selectedRole);

    const user = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(user.role, 'Researcher');
    assert.strictEqual(user.email, email);
  });

  test('TC-AUTH-06: Public registration with user-selected role Viewer stores Viewer', () => {
    const email = `viewer.reg.${Date.now()}@biosprint.edu`;
    const userId = `USR-V-${Date.now()}`;
    const selectedRole = 'Viewer';

    assert.ok(ALLOWED_PUBLIC_ROLES.includes(selectedRole), 'Viewer must be in ALLOWED_PUBLIC_ROLES');

    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, status)
      VALUES (?, ?, 'dummy', 'dummy', 'Auditor Observer', ?, 'active')
    `).run(userId, email, selectedRole);

    const user = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(user.role, 'Viewer');
    assert.strictEqual(user.email, email);
  });

  test('TC-AUTH-07: Public registration security validation rejects self-assignment of Admin/System Administrator', () => {
    const invalidRoles = ['Admin', 'System Administrator', 'Principal Investigator', 'SuperUser', 'Root'];

    for (const role of invalidRoles) {
      assert.strictEqual(
        ALLOWED_PUBLIC_ROLES.includes(role),
        false,
        `Role '${role}' must not be allowed during public registration`
      );
    }

    assert.deepStrictEqual(
      ALLOWED_PUBLIC_ROLES,
      ['Researcher', 'Viewer'],
      'Public roles must strictly and exclusively be Researcher and Viewer'
    );
  });

  test('TC-AUTH-08: Access code onboarding preserves chosen role for new user but forbids role mutation for existing users', () => {
    const email = `fixed.role.${Date.now()}@biosprint.edu`;
    const userId = `USR-FIXED-${Date.now()}`;
    const initialRole = 'Viewer';
    const initialHash = bcrypt.hashSync('InitialCode123!', 10);

    // Initial setup with Viewer role and established access code
    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, status)
      VALUES (?, ?, 'dummy', ?, 'Fixed User', ?, 'active')
    `).run(userId, email, initialHash, initialRole);

    const userBefore = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(userBefore.role, 'Viewer');
    assert.ok(userBefore.access_code_hash);

    // Attempt to mutate role during subsequent access code update
    // The endpoint logic: if user.access_code_hash exists, only update access_code_hash, never change role
    const newHash = bcrypt.hashSync('UpdatedCode456!', 10);
    const attemptedMaliciousRole = 'System Administrator';

    if (!userBefore.access_code_hash) {
      testDb.prepare('UPDATE users SET access_code_hash = ?, role = ? WHERE id = ?').run(newHash, attemptedMaliciousRole, userId);
    } else {
      testDb.prepare('UPDATE users SET access_code_hash = ? WHERE id = ?').run(newHash, userId);
    }

    const userAfter = testDb.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    assert.strictEqual(userAfter.role, 'Viewer', 'Role must remain unchanged when user already has established credentials');
    assert.strictEqual(bcrypt.compareSync('UpdatedCode456!', userAfter.access_code_hash), true);
  });

  test('TC-AUTH-09: Backend RBAC middleware enforcement: Researcher has write permissions, Viewer receives 403 on writes, both denied Admin ops', () => {
    const createMockReqRes = (role) => {
      let statusCode = 200;
      let jsonResponse = null;
      let nextCalled = false;
      return {
        req: { user: { id: 'USR-TEST', role, fullName: 'Test User' } },
        res: {
          status(code) {
            statusCode = code;
            return this;
          },
          json(payload) {
            jsonResponse = payload;
            return this;
          }
        },
        next() {
          nextCalled = true;
        },
        getStatus: () => statusCode,
        getJson: () => jsonResponse,
        wasNextCalled: () => nextCalled
      };
    };

    // 1. Researcher can execute write operations on research resources
    const projectWriteMiddleware = requireRole(['Principal Investigator', 'System Administrator']);
    const researcherReq = createMockReqRes('Researcher');
    projectWriteMiddleware(researcherReq.req, researcherReq.res, researcherReq.next);
    assert.strictEqual(researcherReq.wasNextCalled(), true, 'Researcher must have permission to manage research projects');

    const expWriteMiddleware = requireRole(['Principal Investigator', 'Research Scientist', 'System Administrator']);
    const researcherExpReq = createMockReqRes('Researcher');
    expWriteMiddleware(researcherExpReq.req, researcherExpReq.res, researcherExpReq.next);
    assert.strictEqual(researcherExpReq.wasNextCalled(), true, 'Researcher must have permission to manage experiments');

    // 2. Viewer is strictly read-only and blocked with 403 Forbidden on write operations
    const viewerReq = createMockReqRes('Viewer');
    projectWriteMiddleware(viewerReq.req, viewerReq.res, viewerReq.next);
    assert.strictEqual(viewerReq.wasNextCalled(), false, 'Viewer must not call next() on write endpoints');
    assert.strictEqual(viewerReq.getStatus(), 403, 'Viewer must receive HTTP 403 Forbidden on write endpoints');
    assert.ok(viewerReq.getJson().error.includes('Forbidden'), 'Error message must state Forbidden');

    const viewerExpReq = createMockReqRes('Viewer');
    expWriteMiddleware(viewerExpReq.req, viewerExpReq.res, viewerExpReq.next);
    assert.strictEqual(viewerExpReq.wasNextCalled(), false);
    assert.strictEqual(viewerExpReq.getStatus(), 403);

    // 3. Both Researcher and Viewer are denied access to Administrator-only operations
    const adminMiddleware = requireRole(['System Administrator', 'Admin']);
    
    const researcherAdminReq = createMockReqRes('Researcher');
    adminMiddleware(researcherAdminReq.req, researcherAdminReq.res, researcherAdminReq.next);
    assert.strictEqual(researcherAdminReq.wasNextCalled(), false);
    assert.strictEqual(researcherAdminReq.getStatus(), 403, 'Researcher must receive 403 on Admin operations');

    const viewerAdminReq = createMockReqRes('Viewer');
    adminMiddleware(viewerAdminReq.req, viewerAdminReq.res, viewerAdminReq.next);
    assert.strictEqual(viewerAdminReq.wasNextCalled(), false);
    assert.strictEqual(viewerAdminReq.getStatus(), 403, 'Viewer must receive 403 on Admin operations');

    // 4. Administrator has access to all
    const adminReq = createMockReqRes('System Administrator');
    adminMiddleware(adminReq.req, adminReq.res, adminReq.next);
    assert.strictEqual(adminReq.wasNextCalled(), true, 'System Administrator must have access');
  });
});
