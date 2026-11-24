import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  FileCode2,
  TestTube2,
  Database,
  Plus,
  GitFork,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Layers,
  LineChart,
  Activity,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function ScientistDashboardView({
  experiments,
  protocols,
  samples,
  datasets,
  results,
  projects,
  currentUser
}) {
  const navigate = useNavigate();

  const myExperiments = useMemo(() => {
    // Experiments assigned or all active lab assays
    return experiments;
  }, [experiments]);

  const activeAssays = useMemo(
    () => myExperiments.filter((e) => e.status === 'Active' || e.status === 'In Progress'),
    [myExperiments]
  );

  // Total bench observations logged
  const totalObservations = useMemo(() => {
    return myExperiments.reduce((acc, e) => acc + (e.observations ? e.observations.length : 0), 0);
  }, [myExperiments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-teal-900 to-navy-900 text-white rounded-2xl shadow-sm border border-teal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-400/20 text-teal-300 border border-teal-400/40">
              Research Scientist Workspace
            </span>
            <span className="text-xs text-slate-300">• Experimental Execution & Parameterization</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Assay Execution & Bench Workflow Console
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'Research Scientist'}. Parameterize biological assays, log live observations, bind SOP protocols, and link sequencing datasets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/protocols?action=new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800/80 hover:bg-navy-800 border border-slate-700 rounded-lg transition"
          >
            <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
            <span>+ Author Protocol</span>
          </button>
          <button
            onClick={() => navigate('/experiments?action=new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>+ Register Experiment</span>
          </button>
        </div>
      </div>

      {/* Top 5 Scientist Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Assays"
          value={activeAssays.length}
          subtitle="Currently running at bench"
          icon={FlaskConical}
          color="teal"
          badge={activeAssays.length > 0 ? `${activeAssays.length} in flight` : null}
          onClick={() => navigate('/experiments')}
        />
        <StatCard
          title="Standard Protocols"
          value={protocols.length}
          subtitle="Version-locked SOPs"
          icon={FileCode2}
          color="indigo"
          onClick={() => navigate('/protocols')}
        />
        <StatCard
          title="Assigned Samples"
          value={samples.length}
          subtitle="Aliquots & specimens"
          icon={TestTube2}
          color="navy"
          onClick={() => navigate('/samples')}
        />
        <StatCard
          title="Observed Parameters"
          value={totalObservations}
          subtitle="Logged bench observations"
          icon={Activity}
          color="amber"
          onClick={() => navigate('/experiments')}
        />
        <StatCard
          title="Validated Results"
          value={results.length}
          subtitle="Certified findings"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/analysis')}
        />
      </div>

      {/* Zero State Alert */}
      {myExperiments.length === 0 && (
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-teal-950">Scientist Zero-State: No Assays Created</h3>
              <p className="text-xs text-teal-700">
                Begin by creating an experiment, defining environmental parameters, and attaching registered samples.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/experiments?action=new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Experiment</span>
          </button>
        </div>
      )}

      {/* Main Scientist Grid: Active Experiments & Bench Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Experiments Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Experimental Runs in Flight</h3>
              <p className="text-xs text-slate-500">Active bench protocols, linked samples, and observations</p>
            </div>
            <button
              onClick={() => navigate('/experiments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All Experiments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myExperiments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No experimental runs registered yet. Click "+ Register Experiment" to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Run ID</th>
                    <th className="py-2.5 px-4">Experiment Title</th>
                    <th className="py-2.5 px-4">Protocol SOP</th>
                    <th className="py-2.5 px-4">Observations</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {myExperiments.slice(0, 6).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900">{exp.id}</td>
                      <td className="py-3 px-4 font-semibold text-navy-900 max-w-xs truncate">{exp.name}</td>
                      <td className="py-3 px-4 text-slate-600 truncate">{exp.protocolName || 'Standard SOP'}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                          {exp.observations ? exp.observations.length : 0} notes
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={exp.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/provenance?experimentId=${exp.id}`)}
                          className="text-[11px] font-semibold text-teal-600 hover:text-teal-800"
                        >
                          Lineage &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Bench Observation Panel & Shortcuts */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-navy-900">Scientist Bench Shortcuts</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/experiments?action=new')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-xs flex items-center justify-between transition"
              >
                <div>
                  <div className="font-semibold text-navy-900">New Experimental Run</div>
                  <div className="text-[10px] text-slate-500">Parameterize assay & select protocol</div>
                </div>
                <Plus className="w-4 h-4 text-teal-600" />
              </button>

              <button
                onClick={() => navigate('/data?action=upload')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-xs flex items-center justify-between transition"
              >
                <div>
                  <div className="font-semibold text-navy-900">Deposit Research Dataset</div>
                  <div className="text-[10px] text-slate-500">Multipart upload & SHA-256 seal</div>
                </div>
                <Database className="w-4 h-4 text-teal-600" />
              </button>

              <button
                onClick={() => navigate('/provenance')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-xs flex items-center justify-between transition"
              >
                <div>
                  <div className="font-semibold text-navy-900">Inspect Provenance DAG</div>
                  <div className="text-[10px] text-slate-500">Trace Project &rarr; Result graph</div>
                </div>
                <GitFork className="w-4 h-4 text-teal-600" />
              </button>
            </div>
          </div>

          {/* FAIR Traceability Note */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Reproducibility Assurance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every parameter, buffer pH, and reagent batch logged in BioSprint Engine is immutably timestamped for 21 CFR Part 11 electronic records compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
