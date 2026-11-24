import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  HardDrive,
  RotateCcw,
  Save,
  CheckCircle2,
  Server,
  Database,
  Lock,
  Users,
  ShieldAlert
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import api from '../services/api';

export default function Settings() {
  const {
    settings,
    updateSettings,
    resetToZeroState,
    backendOnline,
    currentUser
  } = useData();
  const { addToast } = useToast();

  const isAdmin = currentUser?.role === 'System Administrator' || currentUser?.role === 'Admin';
  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    title: currentUser?.title || '',
    department: currentUser?.department || 'General Bioscience Research',
    institution: currentUser?.institution || 'BioSprint Research Platform',
    email: currentUser?.email || '',
    orcid: currentUser?.orcid || '',
    avatarInitials: currentUser?.initials || (currentUser?.fullName ? currentUser.fullName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'U')
  });

  const [prefForm, setPrefForm] = useState({
    defaultStorageTemp: settings?.preferences?.defaultStorageTemp || '-80°C Ultra-Low Freezer',
    sequencingQCThreshold: settings?.preferences?.sequencingQCThreshold || 'Q30 (99.9% base accuracy)',
    autoProvenanceHashing: settings?.preferences?.autoProvenanceHashing ?? true,
    requireProtocolVersionTagging: settings?.preferences?.requireProtocolVersionTagging ?? true,
    enforceFAIRCompliance: settings?.preferences?.enforceFAIRCompliance ?? true
  });

  const [notifForm, setNotifForm] = useState({
    emailOnExperimentStatusChange: settings?.notifications?.emailOnExperimentStatusChange ?? true,
    emailOnProtocolRevision: settings?.notifications?.emailOnProtocolRevision ?? true,
    emailOnDatasetUpload: settings?.notifications?.emailOnDatasetUpload ?? false,
    alertOnStorageQuota80Percent: settings?.notifications?.alertOnStorageQuota80Percent ?? true
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isAdmin && backendOnline) {
      setLoadingUsers(true);
      api.getAllUsers()
        .then((res) => {
          if (res.success && res.data) {
            setAdminUsers(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
  }, [isAdmin, backendOnline]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({
      profile: profileForm
    });
    addToast('Scientist profile updated successfully', 'success');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateSettings({
      preferences: {
        ...(settings?.preferences || {}),
        ...prefForm
      },
      notifications: notifForm
    });
    addToast('Laboratory and notification preferences saved', 'success');
  };

  const handleConfirmReset = async () => {
    await resetToZeroState();
    addToast('System reset to pristine clean zero state (0 records)', 'info');
  };

  const handleUpdateUserRole = async (userId, targetRole) => {
    try {
      await api.updateUserRole(userId, targetRole);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u))
      );
      addToast(`Role updated to ${targetRole} for user ${userId}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update user role', 'error');
    }
  };

  // Quota calculation
  const usedGB = settings?.preferences?.storageQuotaUsedGB || 18.4;
  const limitGB = settings?.preferences?.storageQuotaLimitGB || 500;
  const quotaPercent = Math.round((usedGB / limitGB) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Settings & Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Researcher credentials, laboratory operational defaults, storage allocations, and audit controls
        </p>
      </div>

      {/* Backend & Security Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        backendOnline ? 'bg-teal-50/70 border-teal-200 text-teal-900' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
            backendOnline ? 'bg-teal-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">
                {backendOnline ? 'Backend API Online & Synced' : 'Offline / Client-Side Persistence'}
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${backendOnline ? 'bg-teal-500 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {backendOnline
                ? 'Connected to Express REST API (port 5000) with SQLite relational storage & streaming SHA-256'
                : 'Running in browser localStorage sandbox mode. Start backend with "cd server && npm start"'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono px-2.5 py-1 bg-white/70 rounded border border-slate-200 text-slate-700">
            {backendOnline ? 'http://localhost:5000' : 'localStorage:biosprint'}
          </span>
        </div>
      </div>

      {/* Section 1: Authenticated Laboratory Role & Authorization */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-bold text-navy-900">Authenticated Role & Access Tier</h3>
              <p className="text-xs text-slate-500">
                Authorized permissions governed by your verified institutional credentials
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
            {currentUser?.role || 'Research Scientist'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Account Email</span>
            <span className="font-bold text-navy-900 truncate block">{currentUser?.email || 'authenticated@biosprint.org'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Access Category</span>
            <span className="font-bold text-navy-900">
              {isAdmin ? 'System Administrator (Full Governance)' : isViewer ? 'Compliance Auditor (Read-Only)' : 'Research Staff (Read / Write)'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Role Governance</span>
            <span className="text-slate-600">Assigned by institutional administrator</span>
          </div>
        </div>
      </div>

      {/* Section 1B: Institutional User Management (System Administrator Only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">Institutional Personnel & Role Assignment</h3>
                <p className="text-xs text-slate-500">
                  Provision accounts and assign authorized laboratory roles
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Admin Exclusive
            </span>
          </div>

          {loadingUsers ? (
            <p className="text-xs text-slate-500">Loading registered personnel...</p>
          ) : adminUsers.length === 0 ? (
            <p className="text-xs text-slate-500">No personnel registered in database yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-semibold">User</th>
                    <th className="pb-2 font-semibold">Email</th>
                    <th className="pb-2 font-semibold">Current Role</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-navy-900">{u.full_name || u.name || 'User'}</td>
                      <td className="py-2.5 text-slate-600">{u.email}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-medium focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="Research Scientist">Research Scientist</option>
                          <option value="Principal Investigator">Principal Investigator</option>
                          <option value="Laboratory Technician">Laboratory Technician</option>
                          <option value="Bioinformatics Analyst">Bioinformatics Analyst</option>
                          <option value="Compliance Auditor">Compliance Auditor</option>
                          <option value="System Administrator">System Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section 2: User Profile Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-navy-900 text-teal-300 font-bold text-sm flex items-center justify-center">
            {profileForm.avatarInitials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Researcher Identity & Credentials</h3>
            <p className="text-xs text-slate-500">
              Identity attached to all signed experiments, SOP revisions, and data provenance certificates
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal / Academic Name</label>
              <input
                type="text"
                required
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                required
                value={profileForm.title}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Department</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Research Institution</label>
              <input
                type="text"
                value={profileForm.institution}
                onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ORCID iD</label>
              <input
                type="text"
                value={profileForm.orcid}
                onChange={(e) => setProfileForm({ ...profileForm, orcid: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Researcher Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Laboratory Defaults & Governance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <SettingsIcon className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-navy-900">Laboratory Operational Defaults & Compliance</h3>
            <p className="text-xs text-slate-500">
              Set automated quality thresholds, temperature defaults, and audit rules
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Storage Temperature</label>
              <select
                value={prefForm.defaultStorageTemp}
                onChange={(e) => setPrefForm({ ...prefForm, defaultStorageTemp: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="-80°C Ultra-Low Freezer">-80°C Ultra-Low Freezer (DNA/RNA/Plasmids)</option>
                <option value="-196°C Liquid Nitrogen">-196°C Liquid Nitrogen (Cryogenic Cells)</option>
                <option value="-20°C Standard Freezer">-20°C Standard Freezer (Enzymes/Buffers)</option>
                <option value="4°C Cold Room">4°C Cold Room (Proteins/Antibodies)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NGS Sequencing QC Filter</label>
              <select
                value={prefForm.sequencingQCThreshold}
                onChange={(e) => setPrefForm({ ...prefForm, sequencingQCThreshold: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Q30 (99.9% base accuracy)">Q30 (99.9% base call accuracy threshold)</option>
                <option value="Q20 (99.0% base accuracy)">Q20 (99.0% base call accuracy threshold)</option>
                <option value="Q40 (99.99% clinical accuracy)">Q40 (99.99% clinical grade accuracy)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefForm.autoProvenanceHashing}
                onChange={(e) => setPrefForm({ ...prefForm, autoProvenanceHashing: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <div>
                <span className="text-xs font-semibold text-navy-900 block">
                  Automatic Cryptographic Hashing (SHA-256)
                </span>
                <span className="text-[11px] text-slate-500">
                  Generate immutable checksums for every dataset upon registration and upload
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefForm.requireProtocolVersionTagging}
                onChange={(e) => setPrefForm({ ...prefForm, requireProtocolVersionTagging: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <div>
                <span className="text-xs font-semibold text-navy-900 block">
                  Enforce SOP Protocol Version Locking
                </span>
                <span className="text-[11px] text-slate-500">
                  Prevent retroactive changes to protocol steps once linked to executed assays
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Policy Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Data Management & Storage Controls */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-navy-900">Database & Storage Management</h3>
            <p className="text-xs text-slate-500">
              Manage local laboratory state and data volume retention
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Storage Quota Monitor */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-navy-900 font-bold text-xs mb-1">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-teal-600" />
                  <span>Storage Allocation & Quota</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">{usedGB} GB / {limitGB} GB</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Assigned containerized SQLite storage allocation for FastQ, BAM, and instrument raw data.
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, quotaPercent)}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {quotaPercent}% utilized &bull; Immutable SHA-256 deduplication active
            </span>
          </div>

          {/* Action: Clean Zero State Reset */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Clean Zero State</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Clears all projects, experiments, protocols, samples, datasets, and provenance chains. Returns the platform to an authentic pristine state (0 records).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Local Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Information */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-400" />
          <span>BioSprint Engine Platform</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Node.js 22 + SQLite Persistent Store &bull; React 18 + Tailwind CSS
        </span>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Research Data to Zero State?"
        message="This action will clear all projects, experiments, protocols, samples, datasets, and provenance chains. The application will return to an authentic zero-data state with no fabricated records."
        confirmText="Confirm Zero State Reset"
        confirmVariant="danger"
      />
    </div>
  );
}
