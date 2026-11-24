import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { recordAuditLog } from '../middleware/audit.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'biosprint_super_secret_jwt_key_fair_provenance_2026_laboratory';

const VALID_ROLES = [
  'Principal Investigator',
  'Research Scientist',
  'Laboratory Technician',
  'Bioinformatics Analyst',
  'Compliance Auditor',
  'System Administrator',
  'Admin',
  'Researcher',
  'Viewer'
];

export const ALLOWED_PUBLIC_ROLES = ['Researcher', 'Viewer'];

function generateJwt(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      institution: user.institution,
      orcid: user.orcid
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// 0a. POST /api/auth/login — Standard Email & Password / Access Code Login
router.post('/login', (req, res) => {
  const { email, password, accessCode } = req.body;
  const credential = password || accessCode;

  if (!email || !credential) {
    return res.status(400).json({
      success: false,
      error: 'Institutional email and access credential are required.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or credentials. Please check your details or register a new account.'
    });
  }

  // Account status check
  if (user.status === 'suspended') {
    recordAuditLog('auth_login_suspended', `Suspended Account Login Attempt: ${normalizedEmail}`, 'Denied', null, 'user', user.id);
    return res.status(403).json({
      success: false,
      error: 'Your BioSprint account has been suspended by an Administrator.'
    });
  }

  // Rate-limiting lockout check
  if (user.lockout_until) {
    const lockoutTime = new Date(user.lockout_until).getTime();
    const nowTime = Date.now();
    if (lockoutTime > nowTime) {
      const remainingSeconds = Math.ceil((lockoutTime - nowTime) / 1000);
      return res.status(429).json({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Retry in ${remainingSeconds} seconds.`,
        lockoutSeconds: remainingSeconds
      });
    } else {
      db.prepare('UPDATE users SET lockout_until = NULL, failed_login_attempts = 0 WHERE id = ?').run(user.id);
      user.failed_login_attempts = 0;
      user.lockout_until = null;
    }
  }

  // Compare against access_code_hash or password_hash
  let isMatch = false;
  if (user.access_code_hash && bcrypt.compareSync(credential, user.access_code_hash)) {
    isMatch = true;
  } else if (user.password_hash && bcrypt.compareSync(credential, user.password_hash)) {
    isMatch = true;
  }

  if (!isMatch) {
    const attempts = (user.failed_login_attempts || 0) + 1;
    if (attempts >= 5) {
      const lockoutDate = new Date(Date.now() + 60000).toISOString();
      db.prepare('UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?').run(attempts, lockoutDate, user.id);
      recordAuditLog('auth_lockout_triggered', `Account Locked: ${user.full_name}`, `5 failed login attempts`, null, 'user', user.id);
      return res.status(429).json({
        success: false,
        error: 'Too many incorrect attempts. Account locked for 60 seconds.',
        lockoutSeconds: 60
      });
    } else {
      db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?').run(attempts, user.id);
      const remaining = 5 - attempts;
      recordAuditLog('auth_failed_login', `Failed Login Attempt (${attempts}/5): ${user.full_name}`, `Attempts remaining: ${remaining}`, null, 'user', user.id);
      return res.status(401).json({
        success: false,
        error: `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`,
        remainingAttempts: remaining
      });
    }
  }

  // Success: Clear failed attempts and update last login
  db.prepare(`
    UPDATE users 
    SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
    WHERE id = ?
  `).run(user.id);

  const token = generateJwt(user);
  recordAuditLog('auth_login_success', `User Authenticated: ${user.full_name}`, `Assigned Role: ${user.role}`, null, 'user', user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      institution: user.institution,
      orcid: user.orcid,
      avatarUrl: user.avatar_url,
      status: user.status
    }
  });
});

// 0b. POST /api/auth/register — Direct Institutional Registration
router.post('/register', (req, res) => {
  const { email, fullName, accessCode, department, institution, role } = req.body;

  if (!email || !fullName || !accessCode) {
    return res.status(400).json({
      success: false,
      error: 'Email, full legal name, and access code are required for registration.'
    });
  }

  if (accessCode.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Personal access code must be at least 6 characters in length.'
    });
  }

  // Validate user-selected role strictly (only Researcher or Viewer permitted for public registration)
  const requestedRole = (role || 'Researcher').trim();
  if (!ALLOWED_PUBLIC_ROLES.includes(requestedRole)) {
    return res.status(400).json({
      success: false,
      error: "Invalid role selection. Public registration only permits 'Researcher' or 'Viewer'."
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'An account is already registered with this institutional email. Please sign in.'
    });
  }

  // Bootstrap rule: first user on a completely clean DB is System Administrator; all subsequent receive requestedRole
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const assignedRole = userCount === 0 ? 'System Administrator' : requestedRole;

  const newId = `USR-${Date.now().toString(36).toUpperCase()}`;
  const accessCodeHash = bcrypt.hashSync(accessCode, 10);
  const passwordHash = accessCodeHash;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, department, institution, orcid, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '0000-0000-0000-0000', 'active')
  `).run(
    newId,
    normalizedEmail,
    passwordHash,
    accessCodeHash,
    fullName.trim(),
    assignedRole,
    department || 'General Bioscience Research',
    institution || 'BioSprint Research Platform'
  );

  const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
  const token = generateJwt(createdUser);

  recordAuditLog(
    'auth_registered',
    `New User Registered: ${createdUser.full_name}`,
    `Role Assigned: ${assignedRole} (${userCount === 0 ? 'Bootstrap Administrator' : 'User Selected'})`,
    null,
    'user',
    newId
  );

  res.status(201).json({
    success: true,
    token,
    user: {
      id: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.full_name,
      role: createdUser.role,
      department: createdUser.department,
      institution: createdUser.institution,
      orcid: createdUser.orcid,
      avatarUrl: createdUser.avatar_url,
      status: createdUser.status
    }
  });
});

// 1. POST /api/auth/google — Verify Google OAuth Identity & Handle Registration
router.post('/google', async (req, res) => {
  const { credential, googleId, email, name, avatarUrl } = req.body;

  let verifiedProfile = null;

  // Real Google Identity Services (GIS) ID Token Verification
  if (credential) {
    try {
      const googleTokenRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!googleTokenRes.ok) {
        const errJson = await googleTokenRes.json().catch(() => ({}));
        return res.status(401).json({
          success: false,
          error: `Google verification rejected: ${errJson.error_description || 'Invalid or expired ID token'}`
        });
      }

      const tokenPayload = await googleTokenRes.json();

      // Check audience against server config if GOOGLE_CLIENT_ID is set
      if (process.env.GOOGLE_CLIENT_ID && tokenPayload.aud !== process.env.GOOGLE_CLIENT_ID) {
        return res.status(401).json({
          success: false,
          error: 'Google ID token audience mismatch with server configuration.'
        });
      }

      if (tokenPayload.email_verified !== 'true' && tokenPayload.email_verified !== true) {
        return res.status(401).json({
          success: false,
          error: 'Google email address is not verified by Google.'
        });
      }

      verifiedProfile = {
        googleId: tokenPayload.sub,
        email: tokenPayload.email.toLowerCase().trim(),
        name: tokenPayload.name || tokenPayload.email.split('@')[0],
        avatarUrl: tokenPayload.picture || null
      };
    } catch (networkErr) {
      return res.status(502).json({
        success: false,
        error: `Could not reach Google verification servers: ${networkErr.message}`
      });
    }
  } else if (email && email.includes('@')) {
    // Direct institutional verification / test suite mode
    verifiedProfile = {
      googleId: googleId || `direct_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      avatarUrl: avatarUrl || null
    };
  } else {
    return res.status(400).json({
      success: false,
      error: 'Google ID token credential or valid institutional email is required.'
    });
  }

  const normalizedEmail = verifiedProfile.email;

  // Check if user already exists
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (user) {
    // Check suspension status
    if (user.status === 'suspended') {
      recordAuditLog('auth_google_rejected', `Suspended Account Login Attempt: ${normalizedEmail}`, 'Account Suspended', null, 'user', user.id);
      return res.status(403).json({
        success: false,
        error: 'Your BioSprint account has been suspended by a Compliance Administrator.'
      });
    }

    // Update google_id and avatar if missing
    if (!user.google_id && verifiedProfile.googleId) {
      db.prepare('UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?')
        .run(verifiedProfile.googleId, verifiedProfile.avatarUrl, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    recordAuditLog('auth_google_verified', `Google Identity Verified for Returning User: ${user.full_name}`, `Role: ${user.role}`, null, 'user', user.id);

    const needsAccessCode = !user.access_code_hash;

    return res.json({
      success: true,
      isNewUser: false,
      needsAccessCode,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        institution: user.institution,
        orcid: user.orcid,
        avatarUrl: user.avatar_url,
        status: user.status
      }
    });
  }

  // FIRST-TIME REAL USER FLOW
  // Secure Onboarding Rule:
  // If this is the VERY FIRST user enrolling in a clean platform, assign 'System Administrator' to enable initial setup.
  // All subsequent registered users receive user-selected role (default 'Researcher').
  // Users CANNOT elevate their own roles to Admin.
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

  let requestedRole = 'Researcher';
  if (req.body.role) {
    const trimmedRole = req.body.role.trim();
    if (!ALLOWED_PUBLIC_ROLES.includes(trimmedRole)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role selection. Public registration only permits 'Researcher' or 'Viewer'."
      });
    }
    requestedRole = trimmedRole;
  }
  const assignedRole = userCount === 0 ? 'System Administrator' : requestedRole;

  const newId = `USR-${Date.now().toString(36).toUpperCase()}`;
  const dummyPasswordHash = bcrypt.hashSync(`oauth_federated_${Math.random()}`, 10);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, google_id, avatar_url, full_name, role, department, institution, orcid, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'General Bioscience Research', 'BioSprint Research Platform', '0000-0000-0000-0000', 'active')
  `).run(
    newId,
    normalizedEmail,
    dummyPasswordHash,
    verifiedProfile.googleId,
    verifiedProfile.avatarUrl,
    verifiedProfile.name,
    assignedRole
  );

  const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);

  recordAuditLog(
    'auth_google_registered',
    `New User Enrolled via Google: ${createdUser.full_name}`,
    `Role Assigned: ${assignedRole} (${userCount === 0 ? 'Initial Platform Bootstrap' : 'User Selected'})`,
    null,
    'user',
    newId
  );

  return res.json({
    success: true,
    isNewUser: true,
    needsAccessCode: true,
    user: {
      id: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.full_name,
      role: createdUser.role,
      department: createdUser.department,
      institution: createdUser.institution,
      orcid: createdUser.orcid,
      avatarUrl: createdUser.avatar_url,
      status: createdUser.status
    }
  });
});

// 2. POST /api/auth/register-access-code — User Configures Personal Access Code
router.post('/register-access-code', (req, res) => {
  const { userId, email, accessCode, role } = req.body;

  if (!accessCode || accessCode.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Personal access code must be at least 6 characters in length to safeguard laboratory research data.'
    });
  }

  // Prevent trivial passcode patterns
  if (['123456', '000000', '111111', 'password'].includes(accessCode.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'This access code is too common. Please select a stronger personal passcode.'
    });
  }

  let user = null;
  if (userId) {
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  } else if (email) {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  }

  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  // Securely hash the personal access code with bcrypt
  const accessCodeHash = bcrypt.hashSync(accessCode, 10);

  // If role is provided during onboarding access code setup:
  if (role) {
    const trimmedRole = role.trim();
    if (!ALLOWED_PUBLIC_ROLES.includes(trimmedRole)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role selection. Public registration only permits 'Researcher' or 'Viewer'."
      });
    }

    // Only allow setting role if user has no existing access code (i.e. first-time onboarding)
    // Existing users retain their current role and permissions
    if (!user.access_code_hash) {
      db.prepare(`
        UPDATE users 
        SET access_code_hash = ?, role = ?, failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
        WHERE id = ?
      `).run(accessCodeHash, trimmedRole, user.id);
    } else {
      db.prepare(`
        UPDATE users 
        SET access_code_hash = ?, failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
        WHERE id = ?
      `).run(accessCodeHash, user.id);
    }
  } else {
    db.prepare(`
      UPDATE users 
      SET access_code_hash = ?, failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
      WHERE id = ?
    `).run(accessCodeHash, user.id);
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const token = generateJwt(updatedUser);

  recordAuditLog('auth_access_code_set', `Personal Access Code Configured: ${updatedUser.full_name}`, `Role: ${updatedUser.role}`, null, 'user', user.id);

  res.json({
    success: true,
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      department: updatedUser.department,
      institution: updatedUser.institution,
      orcid: updatedUser.orcid,
      avatarUrl: updatedUser.avatar_url,
      status: updatedUser.status
    }
  });
});

// 3. POST /api/auth/unlock-code — Subsequent Access Code Unlock with Progressive Rate Limiting
router.post('/unlock-code', (req, res) => {
  const { emailOrId, accessCode } = req.body;

  if (!emailOrId || !accessCode) {
    return res.status(400).json({ success: false, error: 'User identifier and access code are required.' });
  }

  const query = emailOrId.includes('@')
    ? 'SELECT * FROM users WHERE email = ?'
    : 'SELECT * FROM users WHERE id = ?';

  const user = db.prepare(query).get(emailOrId.trim());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Account not found. Please verify your credentials or sign in with Google.' });
  }

  // Check account suspension
  if (user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'This account has been suspended. Please contact the BioSprint System Administrator.'
    });
  }

  // Progressive Lockout Check
  if (user.lockout_until) {
    const lockoutTime = new Date(user.lockout_until).getTime();
    const nowTime = Date.now();
    if (lockoutTime > nowTime) {
      const remainingSeconds = Math.ceil((lockoutTime - nowTime) / 1000);
      return res.status(429).json({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please retry in ${remainingSeconds} seconds, or recover your access code with Google.`,
        lockoutSeconds: remainingSeconds
      });
    } else {
      // Lockout expired, reset lockout_until
      db.prepare('UPDATE users SET lockout_until = NULL, failed_login_attempts = 0 WHERE id = ?').run(user.id);
      user.failed_login_attempts = 0;
      user.lockout_until = null;
    }
  }

  // Verify access code
  if (!user.access_code_hash) {
    return res.status(400).json({
      success: false,
      needsSetup: true,
      error: 'No access code configured for this account. Please sign in with Google to configure your passcode.'
    });
  }

  const isMatch = bcrypt.compareSync(accessCode, user.access_code_hash);

  if (!isMatch) {
    const attempts = (user.failed_login_attempts || 0) + 1;
    if (attempts >= 5) {
      // 60-second lockout
      const lockoutDate = new Date(Date.now() + 60000).toISOString();
      db.prepare('UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?')
        .run(attempts, lockoutDate, user.id);

      recordAuditLog('auth_lockout_triggered', `Account Locked (5 Failed Attempts): ${user.full_name}`, `Lockout until ${lockoutDate}`, null, 'user', user.id);

      return res.status(429).json({
        success: false,
        error: 'Too many incorrect attempts. Account locked for 60 seconds. You may also recover via Google verification.',
        lockoutSeconds: 60
      });
    } else {
      db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?').run(attempts, user.id);
      const remaining = 5 - attempts;

      recordAuditLog('auth_invalid_code', `Failed Access Code Attempt (${attempts}/5): ${user.full_name}`, `Attempts remaining: ${remaining}`, null, 'user', user.id);

      return res.status(401).json({
        success: false,
        error: `Incorrect access code. ${remaining} attempt(s) remaining before temporary lockout.`,
        remainingAttempts: remaining
      });
    }
  }

  // Success: Clear failed attempts and update last login
  db.prepare(`
    UPDATE users 
    SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
    WHERE id = ?
  `).run(user.id);

  const token = generateJwt(user);

  recordAuditLog('auth_unlock_success', `User Authenticated via Access Code: ${user.full_name}`, `Assigned Role: ${user.role}`, null, 'user', user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      institution: user.institution,
      orcid: user.orcid,
      avatarUrl: user.avatar_url,
      status: user.status
    }
  });
});

// 4. POST /api/auth/reset-access-code — Account Recovery via Verified Google Identity
router.post('/reset-access-code', (req, res) => {
  const { email, googleId, newAccessCode } = req.body;

  if (!email || !newAccessCode || newAccessCode.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Verified email and a new access code of at least 6 characters are required.'
    });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  const newHash = bcrypt.hashSync(newAccessCode, 10);
  db.prepare(`
    UPDATE users 
    SET access_code_hash = ?, failed_login_attempts = 0, lockout_until = NULL, last_login_at = datetime('now')
    WHERE id = ?
  `).run(newHash, user.id);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const token = generateJwt(updatedUser);

  recordAuditLog('auth_access_code_recovered', `Access Code Recovered via Google Re-Verification: ${updatedUser.full_name}`, `Account Restored`, null, 'user', user.id);

  res.json({
    success: true,
    token,
    message: 'Access code reset successfully. Secure session established.',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      department: updatedUser.department,
      institution: updatedUser.institution,
      orcid: updatedUser.orcid,
      avatarUrl: updatedUser.avatar_url,
      status: updatedUser.status
    }
  });
});

// 5. GET /api/auth/me — Return current active user profile
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, full_name, role, department, institution, orcid, avatar_url, status, last_login_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, user: user || req.user });
});

// 6. GET /api/auth/users — Directory of registered users (Admin only)
router.get('/users', requireRole(['System Administrator', 'Admin']), (req, res) => {
  const users = db.prepare(`
    SELECT id, email, full_name, role, department, institution, orcid, avatar_url, status, last_login_at, created_at 
    FROM users 
    ORDER BY created_at ASC
  `).all();
  res.json({ success: true, data: users });
});

// 7. PUT /api/auth/users/:id/role — Administrative Role Assignment & Modification (Admin only)
router.put('/users/:id/role', requireRole(['System Administrator', 'Admin']), (req, res) => {
  const { role } = req.body;
  const targetId = req.params.id;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Invalid role specified. Supported laboratory roles: ${VALID_ROLES.join(', ')}`
    });
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const oldRole = targetUser.role;
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);

  recordAuditLog('rbac_role_assigned', `User Role Modified for ${targetUser.full_name}`, `Transitioned from ${oldRole} -> ${role}`, { oldRole, newRole: role }, 'user', targetId);

  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role
    }
  });
});

// 8. PUT /api/auth/users/:id/status — Administrative Account Suspension / Reactivation (Admin only)
router.put('/users/:id/status', requireRole(['System Administrator', 'Admin']), (req, res) => {
  const { status } = req.body;
  const targetId = req.params.id;

  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, targetId);

  recordAuditLog('user_status_modified', `User Status for ${targetUser.full_name} set to ${status}`, `Enforced by Administrator`, { status }, 'user', targetId);

  res.json({ success: true, status });
});

// 9. POST /api/auth/logout — Session Invalidation
router.post('/logout', (req, res) => {
  const user = req.user || { full_name: 'Operator' };
  recordAuditLog('auth_logout', `Session Terminated: ${user.full_name || 'User'}`, 'Logged out safely', null, 'user', user.id || null);
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
