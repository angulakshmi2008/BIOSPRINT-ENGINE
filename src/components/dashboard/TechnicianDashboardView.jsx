import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TestTube2,
  HardDrive,
  FileCode2,
  Plus,
  ArrowRight,
  ThermometerSnowflake,
  Box,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STORAGE_COLORS = {
  '-196°C Liquid Nitrogen': '#0284C7',
  '-80°C Ultra-Low Freezer': '#0D9488',
  '-20°C Standard Freezer': '#6366F1',
  '4°C Cold Room': '#10B981'
};

export default function TechnicianDashboardView({
  samples,
  protocols,
  experiments,
  currentUser
}) {
  const navigate = useNavigate();

  // Storage breakdown
  const storageBreakdown = useMemo(() => {
    if (samples.length === 0) return [];
    const counts = {};
    samples.forEach((s) => {
      const loc = s.temperature || s.storageLocation?.split('(')[0]?.trim() || 'Standard Freezer';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.keys(counts).map((k) => ({
      name: k,
      value: counts[k]
    }));
  }, [samples]);

  // Specimen types breakdown
  const typeBreakdown = useMemo(() => {
    if (samples.length === 0) return [];
    const counts = {};
    samples.forEach((s) => {
      const t = s.sampleType || 'General Specimen';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.keys(counts).map((k) => ({
      name: k,
      count: counts[k]
    }));
  }, [samples]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-blue-900 via-navy-900 to-slate-900 text-white rounded-2xl shadow-sm border border-blue-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
              Laboratory Technician Specimen Portal
            </span>
            <span className="text-xs text-slate-300">• Cold-Chain Custody & Sample Intake</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Cryo-Repository & Specimen Inventory Management
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'Laboratory Technician'}. Track biological specimen intake, cryogenic rack coordinates, liquid nitrogen slots, and SOP extraction procedures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/protocols')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800/80 hover:bg-navy-800 border border-slate-700 rounded-lg transition"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Extraction SOPs</span>
          </button>
          <button
            onClick={() => navigate('/samples?action=new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Biological Sample</span>
          </button>
        </div>
      </div>

      {/* Top 5 Technician Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Specimens"
          value={samples.length}
          subtitle="Cataloged in repository"
          icon={TestTube2}
          color="teal"
          onClick={() => navigate('/samples')}
        />
        <StatCard
          title="Cryo-Freezers"
          value={storageBreakdown.length > 0 ? storageBreakdown.length : 4}
          subtitle="-196°C & -80°C zones"
          icon={ThermometerSnowflake}
          color="navy"
          onClick={() => navigate('/samples')}
        />
        <StatCard
          title="Active SOP Protocols"
          value={protocols.length}
          subtitle="Laboratory procedures"
          icon={FileCode2}
          color="indigo"
          onClick={() => navigate('/protocols')}
        />
        <StatCard
          title="Assays Served"
          value={experiments.length}
          subtitle="Assigned to experiments"
          icon={Box}
          color="amber"
          onClick={() => navigate('/experiments')}
        />
        <StatCard
          title="Storage Health"
          value="100%"
          subtitle="Nominal temperature"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Zero State Alert */}
      {samples.length === 0 && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <TestTube2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-950">Technician Zero-State: Specimen Repository Empty</h3>
              <p className="text-xs text-blue-700">
                Log the first biological specimen, allocate its cryogenic freezer coordinate, and record aliquot volume.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/samples?action=new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Specimen</span>
          </button>
        </div>
      )}

      {/* Visual Strip: Temperature Zone Allocation & Sample Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Samples Inventory Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Cryogenic Specimen Master Inventory</h3>
              <p className="text-xs text-slate-500">Rack coordinates, temperature zones, and volume remaining</p>
            </div>
            <button
              onClick={() => navigate('/samples')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Full Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {samples.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No samples cataloged yet. Click "+ Register Biological Sample" to begin specimen intake.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Sample ID</th>
                    <th className="py-2.5 px-4">Sample Name</th>
                    <th className="py-2.5 px-4">Specimen Type</th>
                    <th className="py-2.5 px-4">Storage Coordinate</th>
                    <th className="py-2.5 px-4">Temperature</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {samples.slice(0, 6).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900">{s.id}</td>
                      <td className="py-3 px-4 font-semibold text-navy-900 max-w-xs truncate">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.sampleType}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-teal-700 font-semibold truncate">
                        {s.storageLocation}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{s.temperature}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cold-Chain Zone Distribution & Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-navy-900 mb-2">Cold-Chain Temperature Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Specimen allocation across cryogenic tiers</p>

            {storageBreakdown.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No storage distribution data available.
              </div>
            ) : (
              <div className="space-y-2">
                {storageBreakdown.map((item) => (
                  <div key={item.name} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-medium text-navy-900 truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.value} samples
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Technician Protocol Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technician Protocols</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => navigate('/protocols')}
                className="w-full text-left p-2 rounded hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
              >
                <span>View Standard Lysis & Extraction SOPs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/experiments')}
                className="w-full text-left p-2 rounded hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
              >
                <span>Check Linked Assays for Specimen Withdrawal</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
