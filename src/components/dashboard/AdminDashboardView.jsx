import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  ShieldCheck,
  Users,
  HardDrive,
  Settings,
  RotateCcw,
  Plus,
  ArrowRight,
  Database,
  Lock,
  UserCheck,
  UserX,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LAB_ROLE_DEFINITIONS } from '../../context/AuthContext';

export default function AdminDashboardView({
  settings,
  backendOnline,
  currentUser
}) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRoleValue, setNewRoleValue] = useState('Research Scientist');

  // Load registered users from backend API
  useEffect(() => {
    async function loadUsers() {
      if (backendOnline) {
        setLoadingUsers(true);
        try {
          const res = await api.getAllUsers();
          if (res.success && res.data) {
            setUsersList(res.data);
          }
        } catch {
          // fallback
        } finally {
          setLoadingUsers(false);
        }
      } else {
        // Fallback from predefined roles
        setUsersList(LAB_ROLE_DEFINITIONS.map((r, idx) => ({
          id: `USR-00${idx + 1}`,
          full_name: r.fullName,
          email: r.email,
          role: r.role,
          status: 'active',
          department: r.department
        })));
      }
    }
    loadUsers();
  }, [backendOnline]);

  const handleUpdateRole = async (userId, targetRole) => {
    try {
      if (backendOnline) {
        await api.updateUserRole(userId, targetRole);
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u))
      );
      addToast(`Role updated to ${targetRole} for user ${userId}`, 'success');
      setSelectedUserForRole(null);
    } catch (err) {
      addToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      if (backendOnline) {
        await api.updateUserStatus(user.id, nextStatus);
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      addToast(`User ${user.full_name} status updated to ${nextStatus}`, 'info');
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const usedGB = settings?.preferences?.storageQuotaUsedGB || 18.4;
  const limitGB = settings?.preferences?.storageQuotaLimitGB || 500;
  const quotaPercent = Math.round((usedGB / limitGB) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-2xl shadow-sm border border-navy-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              System Administrator Command
            </span>
            <span className="text-xs text-slate-400">• Infrastructure, Storage & RBAC Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            BioSprint Platform Administration & Access Governance
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'System Administrator'}. Manage user roles, approve accounts, audit access security, and monitor containerized infrastructure storage quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800/80 hover:bg-navy-800 border border-slate-700 rounded-lg transition"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span>System Policies</span>
          </button>
        </div>
      </div>

      {/* Top 5 Administrator Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Registered Personnel"
          value={usersList.length}
          subtitle="Active researchers"
          icon={Users}
          color="navy"
          onClick={() => navigate('/settings')}
        />
        <StatCard
          title="Laboratory Roles"
          value="6 Roles"
          subtitle="RBAC configured"
          icon={ShieldCheck}
          color="indigo"
          onClick={() => navigate('/settings')}
        />
        <StatCard
          title="Data Lake Quota"
          value={`${usedGB} GB`}
          subtitle={`Limit: ${limitGB} GB (${quotaPercent}%)`}
          icon={HardDrive}
          color="teal"
          onClick={() => navigate('/settings')}
        />
        <StatCard
          title="Backend API Status"
          value={backendOnline ? 'Online' : 'Offline'}
          subtitle={backendOnline ? 'REST API Active' : 'LocalStorage Sandbox'}
          icon={Server}
          color={backendOnline ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Database Store"
          value="11 Tables"
          subtitle="Relational SQLite / WAL"
          icon={Database}
          color="teal"
        />
      </div>

      {/* Main Grid: User Management & System Infrastructure Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory & RBAC Assignment Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">User Directory & Role Assignments (RBAC)</h3>
              <p className="text-xs text-slate-500">Modify laboratory roles, suspend accounts, and view security status</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {usersList.length} Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">User ID</th>
                  <th className="py-2.5 px-4">Name & Email</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Account Status</th>
                  <th className="py-2.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">{u.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {selectedUserForRole?.id === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={newRoleValue}
                            onChange={(e) => setNewRoleValue(e.target.value)}
                            className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                          >
                            <option value="Principal Investigator">Principal Investigator</option>
                            <option value="Research Scientist">Research Scientist</option>
                            <option value="Laboratory Technician">Laboratory Technician</option>
                            <option value="Bioinformatics Analyst">Bioinformatics Analyst</option>
                            <option value="Compliance Auditor">Compliance Auditor</option>
                            <option value="System Administrator">System Administrator</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(u.id, newRoleValue)}
                            className="px-2 py-1 bg-teal-600 text-white rounded text-[11px] font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                        u.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.status === 'suspended' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span className="capitalize">{u.status || 'active'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserForRole(u);
                            setNewRoleValue(u.role);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-navy-900 border border-slate-200 rounded hover:bg-slate-50"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-1 text-[11px] font-medium rounded border ${
                            u.status === 'suspended'
                              ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                              : 'text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infrastructure & Services Health */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-navy-900 mb-2">Platform Infrastructure Status</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">Express REST API Server</span>
                  <span className="text-[11px] text-slate-500">REST API • CORS Protected</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  backendOnline
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {backendOnline ? 'Online' : 'Offline Mode'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">SQLite Relational Engine</span>
                  <span className="text-[11px] text-slate-500">WAL Mode • Busy Timeout 5s</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Healthy
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">Data Lake Storage Quota</span>
                  <span className="text-[11px] text-slate-500">{usedGB} GB of {limitGB} GB limit</span>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {quotaPercent}% Used
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs">
            <h4 className="font-bold text-teal-400 mb-1">Administrative Governance</h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Role transitions and account suspensions generate immutable audit log entries in compliance with FDA 21 CFR Part 11.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-center transition"
            >
              Open Full Governance Settings &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
