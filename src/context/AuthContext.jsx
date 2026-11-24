import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const AUTH_USER_KEY = 'biosprint_auth_user';
const TOKEN_KEY = 'biosprint_token';
const SESSION_LOCK_KEY = 'biosprint_session_locked';

export const LAB_ROLE_DEFINITIONS = [
  {
    role: 'Principal Investigator',
    shortRole: 'PI',
    fullName: 'Dr. Elena Rostova',
    title: 'Principal Investigator & Lab Director',
    department: 'Molecular Genetics & Functional Genomics',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'elena.rostova@biosprint.org',
    orcid: '0000-0002-8419-7201',
    initials: 'ER',
    permissions: ['ALL', 'PROJECT_MANAGE', 'EXPERIMENT_SIGN_OFF', 'PROTOCOL_APPROVE', 'AUDIT_VIEW']
  },
  {
    role: 'Research Scientist',
    shortRole: 'Scientist',
    fullName: 'Dr. Marcus Thorne',
    title: 'Senior Research Scientist',
    department: 'Neuro-Oncology & Genomics',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'm.thorne@biosprint.org',
    orcid: '0000-0001-9234-1188',
    initials: 'MT',
    permissions: ['EXPERIMENT_EXECUTE', 'PROTOCOL_AUTHOR', 'SAMPLE_USE', 'DATASET_UPLOAD', 'ANALYSIS_RUN', 'RESULT_PUBLISH']
  },
  {
    role: 'Laboratory Technician',
    shortRole: 'Technician',
    fullName: 'Lin Wei',
    title: 'Lead Cryo-Repository Technician',
    department: 'Specimen Repository & Cold Chain',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'l.wei@biosprint.org',
    orcid: '0000-0003-4412-8890',
    initials: 'LW',
    permissions: ['SAMPLE_REGISTER', 'SAMPLE_STORE', 'OBSERVATION_LOG', 'PROTOCOL_READ']
  },
  {
    role: 'Bioinformatics Analyst',
    shortRole: 'Bioinformatician',
    fullName: 'Dr. James Miller',
    title: 'Senior Computational Biologist',
    department: 'Computational Biology & NGS Core',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'j.miller@biosprint.org',
    orcid: '0000-0002-7711-3094',
    initials: 'JM',
    permissions: ['DATASET_MANAGE', 'ANALYSIS_EXECUTE', 'PIPELINE_CONFIGURE', 'PROVENANCE_TRACE', 'RESULT_DRAFT']
  },
  {
    role: 'Compliance Auditor',
    shortRole: 'Auditor',
    fullName: 'Dr. Clara Sterling',
    title: 'Lead GLP / 21 CFR Part 11 Compliance Auditor',
    department: 'Quality Assurance & Regulatory Affairs',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'auditor@biosprint.org',
    orcid: '0000-0002-1200-4491',
    initials: 'CS',
    permissions: ['AUDIT_INSPECT', 'PROVENANCE_VIEW', 'INTEGRITY_VERIFY', 'REPORTS_EXPORT_READONLY']
  },
  {
    role: 'System Administrator',
    shortRole: 'Admin',
    fullName: 'System Administrator',
    title: 'Informatics Platform Administrator',
    department: 'Research IT & DevOps',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'admin@biosprint.org',
    orcid: '0000-0000-0000-0000',
    initials: 'SA',
    permissions: ['SYSTEM_CONFIG', 'USER_PROVISION', 'ROLE_ASSIGN', 'STORAGE_QUOTA', 'AUDIT_FULL']
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem(AUTH_USER_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(TOKEN_KEY);
  });
  const [loadingSession, setLoadingSession] = useState(() => {
    return !!localStorage.getItem(TOKEN_KEY);
  });
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem(SESSION_LOCK_KEY) === 'true';
  });

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    view: 'unlock', // 'unlock' | 'google' | 'create_code' | 'recover'
    pendingGoogleUser: null,
    errorMessage: '',
    lockoutSeconds: 0
  });

  // Verify and hydrate session on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoadingSession(false);
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      api.setToken(storedToken);
      try {
        const res = await api.getCurrentUser();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        } else {
          // Token invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          api.setToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Fallback to cached user if network fails temporarily
        const cached = localStorage.getItem(AUTH_USER_KEY);
        if (cached) {
          try {
            setCurrentUser(JSON.parse(cached));
            setIsAuthenticated(true);
          } catch {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setLoadingSession(false);
      }
    }
    verifySession();
  }, []);

  // Sync token to API layer
  useEffect(() => {
    if (token) {
      api.setToken(token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      api.setToken(null);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Persist current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  // Handle countdown if locked out
  useEffect(() => {
    let timer;
    if (authModalState.lockoutSeconds > 0) {
      timer = setInterval(() => {
        setAuthModalState((prev) => ({
          ...prev,
          lockoutSeconds: Math.max(0, prev.lockoutSeconds - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authModalState.lockoutSeconds]);

  // 1. Direct Email & Password / Access Code Login
  const loginWithCredentials = useCallback(async (email, password) => {
    setAuthModalState((prev) => ({ ...prev, errorMessage: '' }));
    const res = await api.login(email, password);
    if (res.success && res.user && res.token) {
      setToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsLocked(false);
      localStorage.setItem(SESSION_LOCK_KEY, 'false');
      setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
      return res;
    }
    throw new Error(res.error || 'Login failed.');
  }, []);

  // 2. Direct Institutional Registration
  const registerAccount = useCallback(async (registrationData) => {
    setAuthModalState((prev) => ({ ...prev, errorMessage: '' }));
    const res = await api.register(registrationData);
    if (res.success && res.user && res.token) {
      setToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsLocked(false);
      localStorage.setItem(SESSION_LOCK_KEY, 'false');
      setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
      return res;
    }
    throw new Error(res.error || 'Registration failed.');
  }, []);

  // 3. Google OAuth Sign-In or First-Time Registration
  const loginWithGoogle = useCallback(async (googleProfile) => {
    setAuthModalState((prev) => ({ ...prev, errorMessage: '' }));
    try {
      const res = await api.googleAuth(googleProfile);
      if (res.success && res.user) {
        if (res.needsAccessCode) {
          // User must set their initial access code
          setAuthModalState((prev) => ({
            ...prev,
            view: 'create_code',
            pendingGoogleUser: res.user,
            errorMessage: ''
          }));
          return { needsAccessCode: true, user: res.user };
        } else if (res.token) {
          setToken(res.token);
          setCurrentUser(res.user);
          setIsAuthenticated(true);
          setIsLocked(false);
          localStorage.setItem(SESSION_LOCK_KEY, 'false');
          setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
          return { needsAccessCode: false, user: res.user, token: res.token };
        } else {
          // Returning user: enter access code
          setAuthModalState((prev) => ({
            ...prev,
            view: 'unlock',
            pendingGoogleUser: res.user,
            errorMessage: ''
          }));
          return { needsAccessCode: false, user: res.user };
        }
      }
      throw new Error(res.error || 'Google authentication failed.');
    } catch (err) {
      setAuthModalState((prev) => ({
        ...prev,
        errorMessage: err.message || 'Google authentication failed. Please verify your connection.'
      }));
      throw err;
    }
  }, []);

  // 4. Personal Access Code Registration (First Time)
  const registerPersonalAccessCode = useCallback(async (accessCode, role) => {
    const targetUser = authModalState.pendingGoogleUser || currentUser;
    if (!targetUser) throw new Error('No user context for access code creation.');

    try {
      const res = await api.registerAccessCode({
        userId: targetUser.id,
        email: targetUser.email,
        accessCode,
        ...(role ? { role } : {})
      });

      if (res.success && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem(SESSION_LOCK_KEY, 'false');
        setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
        return res.user;
      }
      throw new Error(res.error || 'Failed to save access code.');
    } catch (err) {
      setAuthModalState((prev) => ({
        ...prev,
        errorMessage: err.message || 'Failed to configure access code.'
      }));
      throw err;
    }
  }, [authModalState.pendingGoogleUser, currentUser]);

  // 5. Unlock using Personal Access Code
  const unlockWithCode = useCallback(async (accessCode) => {
    const emailOrId = authModalState.pendingGoogleUser?.email || currentUser?.email || currentUser?.id;
    if (!emailOrId) {
      const err = new Error('No user selected. Please verify your Google identity first.');
      setAuthModalState((prev) => ({ ...prev, errorMessage: err.message, view: 'google' }));
      throw err;
    }
    setAuthModalState((prev) => ({ ...prev, errorMessage: '' }));

    try {
      const res = await api.unlockCode(emailOrId, accessCode);
      if (res.success && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem(SESSION_LOCK_KEY, 'false');
        setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
        return res.user;
      }
      throw new Error(res.error || 'Incorrect access code.');
    } catch (err) {
      const isLockout = err.message && err.message.toLowerCase().includes('locked');
      setAuthModalState((prev) => ({
        ...prev,
        errorMessage: err.message,
        lockoutSeconds: isLockout ? 60 : prev.lockoutSeconds
      }));
      throw err;
    }
  }, [authModalState.pendingGoogleUser, currentUser]);

  // 6. Recover / Reset Access Code via Google
  const resetAccessCodeWithGoogle = useCallback(async (email, googleId, newAccessCode) => {
    try {
      const res = await api.resetAccessCode({ email, googleId, newAccessCode });
      if (res.success && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem(SESSION_LOCK_KEY, 'false');
        setAuthModalState({ isOpen: false, view: 'unlock', pendingGoogleUser: null, errorMessage: '', lockoutSeconds: 0 });
        return res.user;
      }
      throw new Error(res.error || 'Access code reset failed.');
    } catch (err) {
      setAuthModalState((prev) => ({
        ...prev,
        errorMessage: err.message || 'Access code reset failed.'
      }));
      throw err;
    }
  }, []);

  // 7. Lock Session (Requires access code to reopen)
  const lockSession = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem(SESSION_LOCK_KEY, 'true');
    setAuthModalState({
      isOpen: true,
      view: 'unlock',
      pendingGoogleUser: null,
      errorMessage: '',
      lockoutSeconds: 0
    });
  }, []);

  // 8. Logout
  const logout = useCallback(async () => {
    await api.logout().catch(() => null);
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(SESSION_LOCK_KEY);
    setAuthModalState({
      isOpen: false,
      view: 'unlock',
      pendingGoogleUser: null,
      errorMessage: '',
      lockoutSeconds: 0
    });
  }, []);

  // Safe development fallback (disabled in production / no-op if role comes from backend)
  const switchSimulatedRole = useCallback((roleName) => {
    if (import.meta.env.PROD) {
      console.warn('Role simulation is disabled in production.');
      return currentUser;
    }
    const found = LAB_ROLE_DEFINITIONS.find(
      (r) => r.role === roleName || r.shortRole === roleName
    ) || LAB_ROLE_DEFINITIONS[0];

    setCurrentUser(found);
    return found;
  }, [currentUser]);

  const openAuthModal = useCallback((view = 'unlock') => {
    setAuthModalState({
      isOpen: true,
      view,
      pendingGoogleUser: null,
      errorMessage: '',
      lockoutSeconds: 0
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    if (isLocked) return;
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  }, [isLocked]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        loadingSession,
        isLocked,
        authModalState,
        setAuthModalState,
        loginWithCredentials,
        registerAccount,
        loginWithGoogle,
        registerPersonalAccessCode,
        unlockWithCode,
        resetAccessCodeWithGoogle,
        lockSession,
        logout,
        switchSimulatedRole,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
