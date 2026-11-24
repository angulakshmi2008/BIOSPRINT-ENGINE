import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  FlaskConical,
  CheckCircle2,
  Users,
  Calendar,
  ArrowRight,
  GitFork,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  TrendingUp,
  DollarSign
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
import { formatDate } from '../../utils/formatters';

const STATUS_COLORS = {
  Completed: '#10B981',
  Active: '#0D9488',
  'In Progress': '#06B6D4',
  Pending: '#F59E0B',
  'On Hold': '#EF4444'
};

export default function PIDashboardView({
  projects,
  experiments,
  results,
  protocols,
  deadlines,
  currentUser
}) {
  const navigate = useNavigate();

  const activeExperiments = useMemo(
    () => experiments.filter((e) => e.status === 'Active' || e.status === 'In Progress').length,
    [experiments]
  );

  const completedExperiments = useMemo(
    () => experiments.filter((e) => e.status === 'Completed').length,
    [experiments]
  );

  // Status breakdown for PieChart
  const statusChartData = useMemo(() => {
    if (experiments.length === 0) return [];
    const counts = {};
    experiments.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return Object.keys(counts).map((status) => ({
      name: status,
      value: counts[status]
    }));
  }, [experiments]);

  // Project progress breakdown
  const projectProgressData = useMemo(() => {
    if (projects.length === 0) return [];
    return projects.map((p) => {
      const pExp = experiments.filter((e) => e.projectId === p.id);
      const done = pExp.filter((e) => e.status === 'Completed').length;
      return {
        name: p.code || p.id,
        total: pExp.length,
        completed: done,
        active: pExp.length - done
      };
    });
  }, [projects, experiments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl shadow-sm border border-navy-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Principal Investigator Command
            </span>
            <span className="text-xs text-slate-400">• Institutional Oversight & Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Research Portfolio & Milestones Oversight
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Welcome, {currentUser?.fullName || currentUser?.email || 'Principal Investigator'}. Review multi-investigator programs, experiment milestones, and certified scientific conclusions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/provenance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-navy-800 hover:bg-navy-700 border border-slate-700 rounded-lg transition"
          >
            <GitFork className="w-3.5 h-3.5 text-teal-400" />
            <span>Trace Lineage DAG</span>
          </button>
          <button
            onClick={() => navigate('/projects?action=new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research Program</span>
          </button>
        </div>
      </div>

      {/* Top 5 PI KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Research Programs"
          value={projects.length}
          subtitle="Portfolio projects"
          icon={FolderGit2}
          color="navy"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Active Experiments"
          value={activeExperiments}
          subtitle="In-flight runs"
          icon={FlaskConical}
          color="teal"
          badge={activeExperiments > 0 ? `${activeExperiments} active` : null}
          onClick={() => navigate('/experiments')}
        />
        <StatCard
          title="Validated Results"
          value={results.length}
          subtitle="Certified findings"
          icon={CheckCircle2}
          color="emerald"
          badge={results.length > 0 ? '100% FAIR' : null}
          onClick={() => navigate('/analysis')}
        />
        <StatCard
          title="Approved Protocols"
          value={protocols.length}
          subtitle="Standard SOPs"
          icon={ShieldCheck}
          color="indigo"
          onClick={() => navigate('/protocols')}
        />
        <StatCard
          title="Milestone Deadlines"
          value={deadlines.length}
          subtitle="Scheduled grant deliverables"
          icon={Calendar}
          color="amber"
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* Zero State Notice */}
      {projects.length === 0 && (
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-teal-950">PI Zero-State: No Research Programs Registered</h3>
              <p className="text-xs text-teal-700">
                Register your first research project with funding budget, milestones, and lead scientist assignments.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects?action=new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Program</span>
          </button>
        </div>
      )}

      {/* Visual Analytics Strip: Project Progress & Experiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Pipeline Execution BarChart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Program Execution & Milestone Completion</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assays completed vs active across active research grants</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              Grant Milestones
            </span>
          </div>

          {projectProgressData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-lg">
              <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-navy-900">No Program Milestones Logged</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Project throughput and completion statistics will calculate as research programs and assays are registered.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="completed" name="Completed Assays" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="In-Flight Assays" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Experiment Status Distribution Donut */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Experiment Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quality stage breakdown</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{experiments.length} Total</span>
          </div>

          {statusChartData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <FlaskConical className="w-8 h-8 text-slate-300 mb-2" />
              <span>No active experimental runs recorded yet.</span>
            </div>
          ) : (
            <>
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
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

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[item.name] || '#94A3B8' }}
                    />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <span className="font-semibold text-navy-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Projects Table & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Research Programs Oversight</h3>
              <p className="text-xs text-slate-500">Active programs and lead investigators</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All Programs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No research projects found. Create a project to begin tracking milestones.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Program ID</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Lead Scientist</th>
                    <th className="py-2.5 px-4">Target Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {projects.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900">{p.id}</td>
                      <td className="py-3 px-4 font-semibold text-navy-900 max-w-xs truncate">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.leadResearcher}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(p.targetEndDate)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Milestone Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-navy-900">Grant Deadlines & Deliverables</h3>
            </div>

            {deadlines.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No upcoming grant review deadlines scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {deadlines.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-navy-900 block leading-tight">{d.title}</span>
                      <span className="text-[11px] text-slate-500">{d.project}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 whitespace-nowrap">
                      {formatDate(d.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/reports')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition text-center"
            >
              Export Institutional Summary Reports &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
