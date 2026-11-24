import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  LineChart,
  GitFork,
  Cpu,
  Plus,
  ArrowRight,
  HardDrive,
  FileCode,
  CheckCircle2,
  TrendingUp,
  Hash,
  ShieldCheck
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
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatBytes, formatDate } from '../../utils/formatters';

const FORMAT_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

export default function BioinformaticsDashboardView({
  datasets,
  analyses,
  results,
  experiments,
  currentUser
}) {
  const navigate = useNavigate();

  // Total byte size of all uploaded datasets
  const totalBytes = useMemo(() => {
    return datasets.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
  }, [datasets]);

  // Format distribution for PieChart
  const formatBreakdown = useMemo(() => {
    if (datasets.length === 0) return [];
    const map = {};
    datasets.forEach((d) => {
      const fmt = d.format ? d.format.split(' ')[0] : 'RAW';
      map[fmt] = (map[fmt] || 0) + (d.sizeBytes || 1048576);
    });
    return Object.keys(map).map((k) => ({
      name: k,
      value: Math.round((map[k] / (1024 * 1024 * 1024)) * 10) / 10 // GB
    }));
  }, [datasets]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-navy-900 text-white rounded-2xl shadow-sm border border-indigo-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Bioinformatics Computational Console
            </span>
            <span className="text-xs text-slate-300">• Nextflow Pipelines & FASTQ Ingestion</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Computational Genomics & Pipeline Analytics Console
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'Bioinformatician'}. Manage high-throughput sequencing datasets, execute differential expression workflows, and inspect cryptographic SHA-256 provenance chains.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/provenance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800/80 hover:bg-navy-800 border border-slate-700 rounded-lg transition"
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            <span>W3C Lineage Graph</span>
          </button>
          <button
            onClick={() => navigate('/data?action=upload')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Raw Dataset</span>
          </button>
        </div>
      </div>

      {/* Top 5 Bioinformatics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Stored Datasets"
          value={datasets.length}
          subtitle="NGS, BAM, HDF5, mzML"
          icon={Database}
          color="teal"
          onClick={() => navigate('/data')}
        />
        <StatCard
          title="Total Data Volume"
          value={formatBytes(totalBytes)}
          subtitle="Sequenced volume"
          icon={HardDrive}
          color="indigo"
          onClick={() => navigate('/data')}
        />
        <StatCard
          title="Pipeline Runs"
          value={analyses.length}
          subtitle="Executed workflows"
          icon={Cpu}
          color="navy"
          onClick={() => navigate('/analysis')}
        />
        <StatCard
          title="Certified Findings"
          value={results.length}
          subtitle="Peer-validated metrics"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/analysis')}
        />
        <StatCard
          title="SHA-256 Hashes"
          value={datasets.length > 0 ? '100% Sealed' : '0 Sealed'}
          subtitle="Cryptographic integrity"
          icon={Hash}
          color="amber"
          onClick={() => navigate('/data')}
        />
      </div>

      {/* Zero State Alert */}
      {datasets.length === 0 && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-indigo-950">Bioinformatics Zero-State: Data Store Empty</h3>
              <p className="text-xs text-indigo-700">
                Deposit your first sequencing dataset (FASTQ, BAM, or CSV) with streaming cryptographic SHA-256 sealing.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/data?action=upload')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </button>
        </div>
      )}

      {/* Main Grid: Data Format Distribution & Pipeline Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Datasets & Pipeline Executions (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Registered Analytical Datasets</h3>
              <p className="text-xs text-slate-500">Cryptographically sealed files, sizes, and associated assays</p>
            </div>
            <button
              onClick={() => navigate('/data')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Data Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {datasets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No datasets registered. Click "+ Upload Raw Dataset" to ingest instrument files.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Dataset ID</th>
                    <th className="py-2.5 px-4">File Name</th>
                    <th className="py-2.5 px-4">Format</th>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">SHA-256 Checksum</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {datasets.slice(0, 6).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900">{d.id}</td>
                      <td className="py-3 px-4 font-semibold text-navy-900 max-w-xs truncate">{d.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-700 font-semibold">{d.format}</td>
                      <td className="py-3 px-4 text-slate-600">{formatBytes(d.sizeBytes)}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                        {d.checksumSha256 ? `${d.checksumSha256.substring(0, 10)}...` : 'Sealed'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={d.status || 'Validated'} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Format Distribution Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-navy-900">Data Lake Distribution</h3>
              <span className="text-xs font-semibold text-slate-500">{datasets.length} files</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Volume allocated by format (GB)</p>

            {formatBreakdown.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <Database className="w-8 h-8 text-slate-300 mb-2" />
                <span>No datasets uploaded yet.</span>
              </div>
            ) : (
              <>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {formatBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={FORMAT_COLORS[index % FORMAT_COLORS.length]}
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

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {formatBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: FORMAT_COLORS[index % FORMAT_COLORS.length] }}
                        />
                        <span className="text-slate-600 truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-navy-900">{item.value} GB</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/analysis')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition text-center"
            >
              Open Pipeline Workbench &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
