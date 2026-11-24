import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'biosprint_super_secret_jwt_key_fair_provenance_2026_laboratory';

// Role category definitions
export const ADMIN_ROLES = ['System Administrator', 'Admin'];
export const RESEARCHER_ROLES = [
  'Principal Investigator',
  'Research Scientist',
  'Bioinformatics Analyst',
  'Laboratory Technician',
  'Researcher'
];
export const VIEWER_ROLES = ['Compliance Auditor', 'Viewer', 'Auditor'];

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired authentication token.' });
    }
    req.user = user;
    next();
  });
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required. Please log in with your credentials.'
    });
  }
  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    }

    const userRole = req.user.role;

    // Administrators always have full oversight
    if (ADMIN_ROLES.includes(userRole)) {
      return next();
    }

    // Role category expansion
    const isResearcher = RESEARCHER_ROLES.includes(userRole);
    const isViewer = VIEWER_ROLES.includes(userRole);

    if (allowedRoles.includes('Admin') && ADMIN_ROLES.includes(userRole)) {
      return next();
    }
    if (isResearcher && allowedRoles.some(r => RESEARCHER_ROLES.includes(r) || r === 'Researcher')) {
      return next();
    }
    if (allowedRoles.includes('Viewer') && (isViewer || isResearcher)) {
      return next();
    }

    // Exact role match
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: User role '${userRole}' lacks permission for this operation.`
    });
  };
}
