import React, { useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  TrendingUp,
  Database,
  FlaskConical,
  TestTube2,
  FolderGit2,
  FileText,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../utils/exportUtils';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, formatBytes } from '../utils/formatters';

const CHART_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

export default function Reports() {
  const { projects, experiments, samples, datasets, results, activities } = useData();
  const { addToast } = useToast();

  // Completion stats
  const totalExperiments = experiments.length;
  const completedExperiments = experiments.filter((e) => e.status === 'Completed').length;
  const completionRate = totalExperiments > 0 ? Math.round((completedExperiments / totalExperiments) * 100) : 0;

  // Total raw data volume
  const totalDataBytes = useMemo(() => {
    return datasets.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
  }, [datasets]);

  // Data format breakdown for PieChart
  const formatBreakdown = useMemo(() => {
    const map = {};
    datasets.forEach((d) => {
      const fmt = d.format.split(' ')[0];
      map[fmt] = (map[fmt] || 0) + (d.sizeBytes || 0);
    });
    return Object.keys(map).map((k) => ({
      name: k,
      value: Math.round(map[k] / (1024 * 1024 * 1024) * 10) / 10 // in GB
    }));
  }, [datasets]);

  // Project experiment breakdown
  const projectExperimentStats = useMemo(() => {
    return projects.map((p) => {
      const pExp = experiments.filter((e) => e.projectId === p.id);
      const completed = pExp.filter((e) => e.status === 'Completed').length;
      return {
        name: p.code || p.id,
        total: pExp.length,
        completed: completed,
        active: pExp.length - completed
      };
    });
  }, [projects, experiments]);

  // Export Handlers
  const handleExportExperiments = () => {
    exportToCSV('BioSprint_Experiments_Master_Log', experiments, [
      { key: 'id', label: 'Experiment ID' },
      { key: 'name', label: 'Experiment Title' },
      { key: 'projectId', label: 'Project ID' },
      { key: 'projectName', label: 'Project Name' },
      { key: 'protocolName', label: 'Protocol SOP' },
      { key: 'protocolVersion', label: 'Protocol Version' },
      { key: 'researcher', label: 'Lead Researcher' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'status', label: 'Status' }
    ]);
    addToast('Exported Experiments Master Log to CSV', 'success');
  };

  const handleExportSamples = () => {
    exportToCSV('BioSprint_Biological_Samples_Inventory', samples, [
      { key: 'id', label: 'Sample ID' },
      { key: 'name', label: 'Sample Name' },
      { key: 'sampleType', label: 'Sample Type' },
      { key: 'storageLocation', label: 'Storage Coordinate' },
      { key: 'temperature', label: 'Storage Temp' },
      { key: 'organism', label: 'Organism' },
      { key: 'concentration', label: 'Concentration' },
      { key: 'volume', label: 'Volume' },
      { key: 'aliquots', label: 'Aliquots' },
      { key: 'status', label: 'Inventory Status' }
    ]);
    addToast('Exported Samples Inventory to CSV', 'success');
  };

  const handleExportDatasets = () => {
    exportToCSV('BioSprint_Datasets_SHA256_Register', datasets, [
      { key: 'id', label: 'Dataset ID' },
      { key: 'name', label: 'File Name' },
      { key: 'format', label: 'Format' },
      { key: 'sizeBytes', label: 'Size (Bytes)' },
      { key: 'checksumSha256', label: 'Cryptographic SHA-256 Checksum' },
      { key: 'associatedExperiment', label: 'Associated Experiment' },
      { key: 'researcher', label: 'Depositor' },
      { key: 'uploadDate', label: 'Upload Date' },
      { key: 'status', label: 'Validation Status' }
    ]);
    addToast('Exported Datasets & Hashes to CSV', 'success');
  };

  const handleExportAuditLog = () => {
    exportToCSV('BioSprint_21CFRPart11_Audit_Trail', activities, [
      { key: 'id', label: 'Event ID' },
      { key: 'timestamp', label: 'Timestamp (UTC)' },
      { key: 'type', label: 'Action Type' },
      { key: 'title', label: 'Action Title' },
      { key: 'details', label: 'Details' },
      { key: 'user', label: 'Scientist / Operator' },
      { key: 'entityId', label: 'Target Entity' }
    ]);
    addToast('Exported 21 CFR Part 11 Audit Trail to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Reports & Audit Manifests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional research compliance summaries, laboratory throughput statistics, and CSV audits
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FAIR & GLP Compliance Certified</span>
        </span>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Experiment Completion Rate
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{completionRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold">({completedExperiments}/{totalExperiments} runs)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Laboratory Data Volume
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{formatBytes(totalDataBytes)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% cryptographically sealed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Validated Final Findings
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{results.length}</span>
            <span className="text-xs text-slate-500 font-medium">findings</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Published with full provenance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Audit Trail Events Logged
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{activities.length}</span>
            <span className="text-xs text-slate-500 font-medium">entries</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Immutable session history</p>
        </div>
      </div>

      {/* CSV Export Quick Action Panels */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-navy-900 mb-1">Audit Compliance Export Center</h3>
        <p className="text-xs text-slate-500 mb-4">
          Download standardized CSV manifests for institutional audits, grant reviews, or publication supplements
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleExportExperiments}
            className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <FlaskConical className="w-5 h-5 text-teal-600 mb-2" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </div>
              <h4 className="text-xs font-bold text-navy-900">Experiments Master Log</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Parameters, SOP versions, and run statuses</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 mt-3 block">Export CSV &rarr;</span>
          </button>

          <button
            onClick={handleExportSamples}
            className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <TestTube2 className="w-5 h-5 text-teal-600 mb-2" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </div>
              <h4 className="text-xs font-bold text-navy-900">Samples Cold-Chain Registry</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Cryogenic slots, aliquots, and volumes</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 mt-3 block">Export CSV &rarr;</span>
          </button>

          <button
            onClick={handleExportDatasets}
            className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <Database className="w-5 h-5 text-teal-600 mb-2" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </div>
              <h4 className="text-xs font-bold text-navy-900">Datasets & Hashes Manifest</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">SHA-256 checksums and storage URIs</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 mt-3 block">Export CSV &rarr;</span>
          </button>

          <button
            onClick={handleExportAuditLog}
            className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </div>
              <h4 className="text-xs font-bold text-navy-900">21 CFR Part 11 Audit Trail</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Timestamped operator modifications</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 mt-3 block">Export CSV &rarr;</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Pipeline Completion */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Experiment Execution by Project</h3>
              <p className="text-xs text-slate-500">Completed vs Active runs per research program</p>
            </div>
          </div>

          {projectExperimentStats.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <FlaskConical className="w-8 h-8 text-slate-300 mb-2" />
              <span>No project experiments registered yet</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectExperimentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="In Progress" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Data Volume by Format */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Data Storage Volume by Format</h3>
              <p className="text-xs text-slate-500">Distribution in Gigabytes (GB)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {formatBytes(totalDataBytes)} Total
            </span>
          </div>

          {formatBreakdown.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Database className="w-8 h-8 text-slate-300 mb-2" />
              <span>No datasets uploaded yet</span>
            </div>
          ) : (
            <>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {formatBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `${val} GB`}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F8FAFC'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                {formatBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate">{item.name}</span>
                    <span className="font-semibold text-navy-900 ml-auto">{item.value} GB</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
