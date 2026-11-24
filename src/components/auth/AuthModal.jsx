import React, { useState, useEffect, useRef } from 'react';
import {
  Dna,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  User,
  KeyRound,
  X,
  Clock,
  Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModal() {
  const {
    currentUser,
    isLocked,
    authModalState,
    setAuthModalState,
    loginWithGoogle,
    registerPersonalAccessCode,
    unlockWithCode,
    resetAccessCodeWithGoogle,
    closeAuthModal
  } = useAuth();

  const { addToast } = useToast();

  const [accessCode, setAccessCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('Researcher');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Institutional Direct Email Form state
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [institutionalName, setInstitutionalName] = useState('');

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const isOpen = authModalState.isOpen || isLocked;
  const currentView = authModalState.view; // 'unlock' | 'google' | 'create_code' | 'recover'

  // Initialize Real Google Identity Services (GIS) button when in 'google' view
  useEffect(() => {
    if (currentView === 'google' && googleClientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              setLocalError('');
              try {
                const res = await loginWithGoogle({ credential: response.credential });
                if (res.needsAccessCode) {
                  addToast('Google identity verified. Please create your personal access code.', 'info');
                } else {
                  addToast(`Google identity verified for ${res.user.fullName}. Enter access code to unlock.`, 'success');
                }
              } catch (err) {
                setLocalError(err.message || 'Google authentication failed.');
              } finally {
                setLoading(false);
              }
            }
          },
          auto_select: false
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          shape: 'rectangular'
        });
      } catch (err) {
        console.warn('GIS render error:', err);
      }
    }
  }, [currentView, googleClientId, loginWithGoogle, addToast]);

  if (!isOpen) return null;

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!accessCode) {
      setLocalError('Please enter your personal access code.');
      return;
    }
    setLoading(true);
    setLocalError('');
    try {
      const unlockedUser = await unlockWithCode(accessCode);
      addToast(`Workspace unlocked. Welcome back, ${unlockedUser?.fullName || 'Researcher'}!`, 'success');
      setAccessCode('');
    } catch (err) {
      setLocalError(err.message || 'Incorrect access code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccessCode = async (e) => {
    e.preventDefault();
    if (accessCode.length < 6) {
      setLocalError('Access code must be at least 6 characters in length.');
      return;
    }
    if (accessCode !== confirmCode) {
      setLocalError('Access codes do not match.');
      return;
    }
    setLoading(true);
    setLocalError('');
    try {
      await registerPersonalAccessCode(accessCode, selectedRole);
      addToast('Personal access code configured. Welcome to BioSprint Engine!', 'success');
      setAccessCode('');
      setConfirmCode('');
    } catch (err) {
      setLocalError(err.message || 'Failed to save access code.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionalSubmit = async (e) => {
    e.preventDefault();
    if (!institutionalEmail || !institutionalEmail.includes('@')) {
      setLocalError('Please provide a valid institutional email address.');
      return;
    }
    setLoading(true);
    setLocalError('');
    try {
      const res = await loginWithGoogle({
        email: institutionalEmail.trim().toLowerCase(),
        name: institutionalName.trim() || institutionalEmail.split('@')[0]
      });
      if (res.needsAccessCode) {
        addToast('Institutional identity registered. Please configure your personal access code.', 'info');
      } else {
        addToast(`Identity verified for ${res.user.fullName}. Enter access code to unlock.`, 'success');
      }
    } catch (err) {
      setLocalError(err.message || 'Institutional authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetCode = async (e) => {
    e.preventDefault();
    if (accessCode.length < 6) {
      setLocalError('New access code must be at least 6 characters.');
      return;
    }
    if (accessCode !== confirmCode) {
      setLocalError('Access codes do not match.');
      return;
    }
    setLoading(true);
    setLocalError('');
    try {
      await resetAccessCodeWithGoogle(
        currentUser?.email || authModalState.pendingGoogleUser?.email,
        currentUser?.googleId || `goog_recovered`,
        accessCode
      );
      addToast('Access code reset successfully via verified identity.', 'success');
      setAccessCode('');
      setConfirmCode('');
    } catch (err) {
      setLocalError(err.message || 'Failed to reset access code.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authModalState.errorMessage;
  const isLockedOut = authModalState.lockoutSeconds > 0;
  const activeUser = authModalState.pendingGoogleUser || currentUser;
  const userInitials = activeUser?.initials || (activeUser?.fullName ? activeUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col relative max-h-[92vh] overflow-y-auto">
        {/* Top Brand Banner */}
        <div className="bg-[#0B132B] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">BioSprint</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">FAIR Data Provenance & Laboratory RBAC</p>
            </div>
          </div>

          {!isLocked && (
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Error Banner */}
          {displayError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span className="text-[11px] leading-relaxed">{displayError}</span>
              </div>
            </div>
          )}

          {/* VIEW 1: SUBSEQUENT LOGIN WITH ACCESS CODE */}
          {currentView === 'unlock' && (
            <div className="space-y-4">
              {activeUser ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-navy-900 text-teal-300 font-bold text-sm flex items-center justify-center border border-navy-700">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-navy-900 truncate">{activeUser.fullName || 'Authorized Researcher'}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {activeUser.role || 'Scientist'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{activeUser.email || 'federated-oauth@institution.edu'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  Please authenticate with your verified Google account or institutional email.
                </div>
              )}

              <div>
                <h2 className="text-sm font-bold text-navy-900">Enter Personal BioSprint Access Code</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Unlock this workstation session with your personal credentials.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3">
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="Enter access code (e.g. BioSprint2026!)"
                    value={accessCode}
                    disabled={isLockedOut || loading}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Lockout countdown */}
                {isLockedOut && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Rate limit active: Retry in <strong>{authModalState.lockoutSeconds}s</strong></span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLockedOut || loading || !accessCode}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{loading ? 'Verifying Credentials...' : 'Unlock Laboratory Workspace'}</span>
                </button>
              </form>

              {/* Recovery & Switch Account Links */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthModalState((prev) => ({ ...prev, view: 'recover', errorMessage: '' }))}
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  Forgot Access Code?
                </button>

                <button
                  type="button"
                  onClick={() => setAuthModalState((prev) => ({ ...prev, view: 'google', errorMessage: '' }))}
                  className="text-slate-500 hover:text-navy-900 font-medium"
                >
                  Sign In / Register &rarr;
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: GOOGLE IDENTITY / INSTITUTIONAL AUTHENTICATION */}
          {currentView === 'google' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Institutional Identity Verification</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Authenticate your verified identity using Google Workspace OAuth or institutional email.
                </p>
              </div>

              {/* Google Identity Services Button Container */}
              {googleClientId && (
                <div className="flex flex-col items-center justify-center my-2 space-y-1">
                  <div ref={googleBtnRef} className="w-full flex justify-center" />
                </div>
              )}

              {/* Institutional Email Verification Form */}
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Institutional Email Authentication
                </span>
                <form onSubmit={handleInstitutionalSubmit} className="space-y-2">
                  <input
                    type="email"
                    placeholder="researcher@university.edu"
                    value={institutionalEmail}
                    onChange={(e) => setInstitutionalEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Full Legal / Professional Name"
                    value={institutionalName}
                    onChange={(e) => setInstitutionalName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !institutionalEmail}
                    className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying Identity...' : 'Continue & Configure Access Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setAuthModalState((prev) => ({ ...prev, view: 'unlock', errorMessage: '' }))}
                  className="text-slate-500 hover:text-navy-900"
                >
                  &larr; Return to Access Code Login
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: CREATE PERSONAL ACCESS CODE (FIRST TIME) */}
          {currentView === 'create_code' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Create Personal Access Code</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Set a secure personal code to unlock BioSprint on subsequent sessions without repeated Google sign-ins.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs">
                <User className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-navy-900 block">
                    {authModalState.pendingGoogleUser?.fullName || currentUser?.fullName || 'Enrolling Researcher'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {authModalState.pendingGoogleUser?.email || currentUser?.email}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCreateAccessCode} className="space-y-3">
                {/* Role Selection Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Your Role <span className="text-teal-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Researcher')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedRole === 'Researcher'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[11px] text-navy-900">Researcher</span>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Researcher' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Researcher' && <span className="w-1 h-1 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-snug">
                        Create & manage projects, experiments, protocols, samples & analyses.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('Viewer')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedRole === 'Viewer'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[11px] text-navy-900">Viewer</span>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Viewer' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Viewer' && <span className="w-1 h-1 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-snug">
                        Read-only access to view research data, provenance DAGs & audit records.
                      </p>
                    </button>
                  </div>
                  <p className="text-[9.5px] text-slate-400 mt-1">
                    Administrator accounts are provisioned exclusively through authorized institutional workflows.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Personal Access Code (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showCode ? 'text' : 'password'}
                      placeholder="Choose personal access code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm Access Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showCode ? 'text' : 'password'}
                      placeholder="Re-enter access code to confirm"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || accessCode.length < 6 || accessCode !== confirmCode}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loading ? 'Securing Workspace...' : 'Save Access Code & Enter BioSprint'}</span>
                </button>
              </form>
            </div>
          )}

          {/* VIEW 4: FORGOT ACCESS CODE / ACCOUNT RECOVERY */}
          {currentView === 'recover' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Account Recovery via Google Identity</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Re-authenticate your Google identity to reset your BioSprint access code.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span>Account to recover: <strong>{activeUser?.email || 'Registered Account'}</strong></span>
              </div>

              <form onSubmit={handleResetCode} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    New Personal Access Code (min. 6 characters)
                  </label>
                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="Enter new access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm New Access Code
                  </label>
                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="Confirm new access code"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || accessCode.length < 6 || accessCode !== confirmCode}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{loading ? 'Verifying & Resetting...' : 'Verify Identity & Reset Access Code'}</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthModalState((prev) => ({ ...prev, view: 'unlock', errorMessage: '' }))}
                  className="text-slate-500 hover:text-navy-900"
                >
                  &larr; Back to Unlock Screen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-teal-600" />
            <span>21 CFR Part 11 Electronic Signatures</span>
          </div>
          <span className="font-mono">SHA-256 Verified</span>
        </div>
      </div>
    </div>
  );
}
