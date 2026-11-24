import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Dna,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
  KeyRound,
  RotateCcw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    currentUser,
    loginWithCredentials,
    registerAccount,
    loginWithGoogle,
    registerPersonalAccessCode,
    resetAccessCodeWithGoogle
  } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'set_code' | 'recover'
  const [selectedRole, setSelectedRole] = useState('Researcher'); // 'Researcher' | 'Viewer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location]);

  // Rate-limiting lockout countdown
  useEffect(() => {
    let timer;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Initialize Real Google Identity Services (GIS) button
  useEffect(() => {
    if (mode === 'login' && googleClientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              setErrorMessage('');
              try {
                const res = await loginWithGoogle({ credential: response.credential });
                if (res.needsAccessCode) {
                  setPendingUser(res.user);
                  setMode('set_code');
                  addToast('Identity verified. Please set your personal access code.', 'info');
                } else {
                  addToast(`Welcome back, ${res.user.fullName || 'Researcher'}`, 'success');
                  const dest = location.state?.from?.pathname || '/dashboard';
                  navigate(dest, { replace: true });
                }
              } catch (err) {
                setErrorMessage(err.message || 'Google authentication failed.');
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
          width: 360,
          text: 'continue_with',
          shape: 'rectangular'
        });
      } catch (err) {
        console.warn('Google Identity initialization error:', err);
      }
    }
  }, [mode, googleClientId, loginWithGoogle, addToast, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your institutional email and access credential.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithCredentials(email, password);
      addToast(`Welcome back, ${res.user.fullName || 'Researcher'}`, 'success');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or access credential.');
      if (err.message && err.message.toLowerCase().includes('locked')) {
        setLockoutSeconds(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Access code must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Access codes do not match.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await registerAccount({
        email,
        fullName,
        accessCode: password,
        department: department || 'General Bioscience Research',
        role: selectedRole
      });
      addToast(`Account created as ${selectedRole}. Welcome, ${res.user.fullName}!`, 'success');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAccessCode = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMessage('Access code must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Access codes do not match.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await registerPersonalAccessCode(password, selectedRole);
      addToast(`Access code configured with ${selectedRole} permissions. Welcome to BioSprint Engine!`, 'success');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save access code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      setErrorMessage('Please provide your verified email and a new access code (min. 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Access codes do not match.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await resetAccessCodeWithGoogle(email, `recovery_${Date.now()}`, password);
      addToast('Access code reset successfully.', 'success');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset access code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-navy-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-900/40 mb-3">
          <Dna className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
          <span>BioSprint</span>
          <span className="text-teal-400 font-light">Engine</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Agile Orchestration & Data Provenance Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Error</span>
                <span className="text-[11px] leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {lockoutSeconds > 0 && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Too many failed attempts. Retry in <strong>{lockoutSeconds}s</strong>.</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Google OAuth Section */}
              {googleClientId ? (
                <div className="flex flex-col items-center justify-center">
                  <div ref={googleBtnRef} className="w-full flex justify-center" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('Google OAuth client ID is not configured in .env (VITE_GOOGLE_CLIENT_ID). Please sign in with your email and access code.');
                  }}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2.5 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-slate-400 font-medium">Or institutional sign-in</span>
                </div>
              </div>

              {/* Email & Access Code Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institution.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Access Credential
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('recover');
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Forgot code?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      disabled={lockoutSeconds > 0 || loading}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Personal access code or password"
                      className="w-full px-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-600 hover:text-teal-700 font-medium"
                >
                  Need an account? <span className="font-semibold text-teal-600 underline">Register institutional identity</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: REGISTRATION */}
          {mode === 'register' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-navy-900">Register Institutional Account</h2>
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal / Academic Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@university.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Core Facility (Optional)
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Molecular Genetics & Genomics"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Role Selection Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Your Role <span className="text-teal-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Researcher')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'Researcher'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-navy-900">Researcher</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Researcher' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Researcher' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Create & manage projects, experiments, protocols, samples, datasets, and analyses.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('Viewer')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'Viewer'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-navy-900">Viewer</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Viewer' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Viewer' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Read-only access to view research data, provenance DAGs, and audit records.
                      </p>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Administrator accounts are provisioned exclusively through authorized institutional workflows.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personal Access Code (min. 6 characters)
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create secure access code"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Access Code
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter access code to confirm"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loading ? 'Creating Account...' : 'Register & Enter Workspace'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-600 hover:text-navy-900 font-medium"
                >
                  Already have an account? <span className="font-semibold text-teal-600 underline">Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: SET ACCESS CODE & ROLE (FIRST-TIME GOOGLE USER) */}
          {mode === 'set_code' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Configure Role & Access Code</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select your intended role and set a personal access code to complete workstation onboarding.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-navy-900 block">{pendingUser?.fullName}</span>
                <span className="text-slate-500">{pendingUser?.email}</span>
              </div>

              <form onSubmit={handleSetAccessCode} className="space-y-3.5">
                {/* Role selection for new Google users */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Your Role <span className="text-teal-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Researcher')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'Researcher'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-navy-900">Researcher</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Researcher' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Researcher' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Full laboratory access to manage experiments & data.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('Viewer')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'Viewer'
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-navy-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-navy-900">Viewer</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'Viewer' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'Viewer' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Read-only access for compliance audit & inspection.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personal Access Code (min. 6 characters)
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose personal access code"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Access Code
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm access code"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {loading ? 'Saving Code...' : 'Save Role, Access Code & Enter'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW 4: RECOVERY */}
          {mode === 'recover' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-navy-900">Reset Access Code</h2>
              <form onSubmit={handleRecover} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institution.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Access Code (min. 6 characters)
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new access code"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Access Code
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new access code"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  {loading ? 'Resetting...' : 'Reset Access Code'}
                </button>
              </form>
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-600 hover:text-navy-900 font-medium"
                >
                  &larr; Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
