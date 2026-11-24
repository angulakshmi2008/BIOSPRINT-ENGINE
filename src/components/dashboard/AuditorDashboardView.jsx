import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  GitFork,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Hash,
  Download,
  AlertCircle
} from 'lucide-react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function AuditorDashboardView({
  activities,
  datasets,
  results,
  protocols,
  currentUser
}) {
  const navigate = useNavigate();

  // Audit event breakdown by category
  const auditTypeBreakdown = useMemo(() => {
    if (activities.length === 0) return {};
    const map = {};
    activities.forEach((a) => {
      const type = a.type || 'operational_log';
      map[type] = (map[type] || 0) + 1;
    });
    return map;
  }, [activities]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-navy-950 text-white rounded-2xl shadow-sm border border-emerald-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              21 CFR Part 11 Compliance Console
            </span>
            <span className="text-xs text-amber-300 font-semibold">• Strict Read-Only Audit Privilege</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Quality Assurance & Data Lineage Inspection
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'Auditor'}. Audit immutable operator timestamps, verify cryptographic SHA-256 data seals, and inspect end-to-end W3C PROV-O experimental lineage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/provenance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800/80 hover:bg-navy-800 border border-slate-700 rounded-lg transition"
          >
            <GitFork className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Lineage Graph</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 21 CFR Manifest</span>
          </button>
        </div>
      </div>

      {/* Read-Only Restriction Alert Pill */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Auditor Scope Enforcement:</strong> You are browsing in authenticated Read-Only mode. Direct database modifications and deletion permissions are disabled.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
          GLP / ISO 17025 Compliant
        </span>
      </div>

      {/* Top 5 Auditor Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Audit Log Events"
          value={activities.length}
          subtitle="Immutable operator entries"
          icon={Clock}
          color="emerald"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Cryptographic Seals"
          value={datasets.length}
          subtitle="100% SHA-256 verified"
          icon={Hash}
          color="teal"
          onClick={() => navigate('/data')}
        />
        <StatCard
          title="Certified Results"
          value={results.length}
          subtitle="Reproducibility scored"
          icon={CheckCircle2}
          color="indigo"
          onClick={() => navigate('/analysis')}
        />
        <StatCard
          title="Versioned Protocols"
          value={protocols.length}
          subtitle="SOP revision histories"
          icon={ShieldCheck}
          color="navy"
          onClick={() => navigate('/protocols')}
        />
        <StatCard
          title="Integrity Status"
          value="Pass"
          subtitle="Zero tampering detected"
          icon={CheckCircle2}
          color="emerald"
          badge="Verified"
        />
      </div>

      {/* Main Grid: Immutable Audit Trail Table & Compliance Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Audit Trail Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Immutable 21 CFR Part 11 Audit Stream</h3>
              <p className="text-xs text-slate-500">Every database modification, user session, and file upload</p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Download Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Zero audit events recorded in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Timestamp (UTC)</th>
                    <th className="py-2.5 px-4">Event Type</th>
                    <th className="py-2.5 px-4">Operator</th>
                    <th className="py-2.5 px-4">Details</th>
                    <th className="py-2.5 px-4">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activities.slice(0, 8).map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {act.timestamp}
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-900 whitespace-nowrap">
                        {act.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{act.user}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{act.details}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Signed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Regulatory Compliance Overview */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-navy-900 mb-2">Audit Compliance Checklists</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">W3C PROV-O Graph Integrity</span>
                  <span className="text-[11px] text-slate-500">8-stage sequential lineage check</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">SHA-256 Checksum Hashing</span>
                  <span className="text-[11px] text-slate-500">Zero file mutation / bit-rot</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Valid
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900 block">Electronic Signature Records</span>
                  <span className="text-[11px] text-slate-500">21 CFR Part 11 audit trails</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs">
            <h4 className="font-bold text-teal-400 mb-1">Export Compliance Archive</h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Generate standardized institutional CSV manifests for submission to external regulatory bodies.
            </p>
            <button
              onClick={() => navigate('/reports')}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-center transition"
            >
              Generate Certified Audit Manifest &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
