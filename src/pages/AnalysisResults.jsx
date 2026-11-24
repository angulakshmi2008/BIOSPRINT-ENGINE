import React, { useState, useMemo } from 'react';
import {
  LineChart as LineChartIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  BarChart2,
  GitFork,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  FlaskConical
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function AnalysisResults() {
  const { analyses, results, experiments, datasets, addAnalysis, deleteAnalysis, currentUser } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [activeTab, setActiveTab] = useState('analyses'); // 'analyses' | 'results'
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddAnalysisOpen, setIsAddAnalysisOpen] = useState(false);
  const [viewingAnalysis, setViewingAnalysis] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState(null);

  // Form state
  const [analysisForm, setAnalysisForm] = useState({
    name: '',
    pipelineVersion: 'BioSprint-Pipelines v2.4 (Bioconductor / Nextflow)',
    associatedExperiment: experiments[0]?.id || '',
    datasetId: datasets[0]?.id || '',
    analyst: currentUser?.fullName || currentUser?.email || '',
    methods: 'Standard demultiplexing, alignment with Bowtie2, and statistical differential expression quantification.',
    metrics: {
      accuracyScore: '99.2%',
      falseDiscoveryRate: '0.008',
      convergenceStatus: 'True'
    }
  });

  // Visualization dynamically derived from analyses metrics
  const analysisChartData = useMemo(() => {
    return analyses
      .filter((a) => a.metrics && (a.metrics.accuracyScore || a.metrics.onTarget || a.metrics.score))
      .map((a) => {
        const onTarget = parseFloat(a.metrics.onTarget || a.metrics.accuracyScore || 0);
        const indelNoise = parseFloat(a.metrics.indelNoise || a.metrics.falseDiscoveryRate || 0);
        return {
          name: a.name.length > 20 ? a.name.slice(0, 18) + '…' : a.name,
          onTarget: isNaN(onTarget) ? 0 : onTarget,
          indelNoise: isNaN(indelNoise) ? 0 : indelNoise
        };
      });
  }, [analyses]);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.pipelineVersion.toLowerCase().includes(search.toLowerCase()) ||
        a.analyst.toLowerCase().includes(search.toLowerCase())
    );
  }, [analyses, search]);

  const filteredResults = useMemo(() => {
    return results.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.experimentName.toLowerCase().includes(search.toLowerCase()) ||
        r.leadScientist.toLowerCase().includes(search.toLowerCase())
    );
  }, [results, search]);

  const handleSaveAnalysis = (e) => {
    e.preventDefault();
    if (!analysisForm.name.trim() || !analysisForm.associatedExperiment) {
      addToast('Please provide an analysis name and experiment', 'error');
      return;
    }

    const created = addAnalysis({
      ...analysisForm,
      parameters: {
        threads: 16,
        qualityThreshold: 'Q30',
        normalizationMethod: 'Median-of-ratios'
      }
    });

    addToast(`Analysis pipeline run ${created.id} executed successfully`, 'success');
    setIsAddAnalysisOpen(false);
  };

  const handleDeleteAnalysis = () => {
    if (deletingAnalysisId) {
      deleteAnalysis(deletingAnalysisId);
      addToast('Analysis record removed', 'info');
      setDeletingAnalysisId(null);
      if (viewingAnalysis?.id === deletingAnalysisId) {
        setViewingAnalysis(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Analysis & Results</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect computational pipeline runs with biological datasets and certified research conclusions
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={() => setIsAddAnalysisOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Analysis Run</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('analyses')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'analyses'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Computational Pipeline Runs ({analyses.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'results'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Certified Experimental Results ({results.length})
          </button>
        </div>

        <div className="pb-2">
          <input
            type="text"
            placeholder="Filter records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 w-48 sm:w-64"
          />
        </div>
      </div>

      {/* TAB 1: Pipeline Runs */}
      {activeTab === 'analyses' && (
        <div className="space-y-6">
          {filteredAnalyses.length === 0 ? (
            <EmptyState
              title="No computational analyses recorded"
              description="Connect experimental datasets to bioinformatics pipelines and track computational findings."
              icon={LineChartIcon}
              actionLabel="Register Analysis Run"
              onAction={() => setIsAddAnalysisOpen(true)}
            />
          ) : (
            <>
              {/* Chart preview (rendered when numeric metrics are present) */}
              {analysisChartData.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">
                        Target Performance & Computational Benchmark
                      </h3>
                      <p className="text-xs text-slate-500">
                        Metric comparison across executed computational runs
                      </p>
                    </div>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#F8FAFC'
                          }}
                        />
                        <Bar dataKey="onTarget" name="Base Editing Efficiency %" fill="#0D9488" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="indelNoise" name="Indel Noise %" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Analyses Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Run ID</th>
                        <th className="py-3 px-4">Analysis Pipeline</th>
                        <th className="py-3 px-4">Software / Tool Version</th>
                        <th className="py-3 px-4">Experiment</th>
                        <th className="py-3 px-4">Input Dataset</th>
                        <th className="py-3 px-4">Analyst</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredAnalyses.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                            {a.id}
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <button
                              onClick={() => setViewingAnalysis(a)}
                              className="font-semibold text-navy-900 hover:text-teal-600 text-left line-clamp-1"
                            >
                              {a.name}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                            {a.pipelineVersion}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-teal-700 font-semibold">
                            {a.associatedExperiment}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                            {a.datasetId || '—'}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{a.analyst}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={a.status || 'Completed'} size="xs" />
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewingAnalysis(a)}
                                className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md"
                                title="View Analysis Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!isViewer && (
                                <button
                                  onClick={() => setDeletingAnalysisId(a.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                                  title="Delete Run"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Certified Results */}
      {activeTab === 'results' && (
        <div>
          {filteredResults.length === 0 ? (
            <EmptyState
              title="No certified experimental results logged"
              description="Results are published and certified with reproducibility scores after completing analysis pipelines."
              icon={CheckCircle2}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {res.id}
                        </span>
                        <span className="text-[11px] font-mono text-teal-700 font-semibold">
                          {res.experimentId}
                        </span>
                      </div>
                      <StatusBadge status={res.validationStatus} size="xs" />
                    </div>

                    <h3
                      onClick={() => setViewingResult(res)}
                      className="text-sm font-bold text-navy-900 hover:text-teal-700 cursor-pointer transition-colors leading-snug"
                    >
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {res.summary}
                    </p>

                    {/* Primary Metrics Strip */}
                    <div className="mt-4 p-3 bg-teal-50/60 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider block">
                          Primary Finding
                        </span>
                        <span className="font-bold text-teal-900">{res.primaryMetric}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider block">
                          Reproducibility
                        </span>
                        <span className="font-mono font-bold text-emerald-700">{res.reproducibilityScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{res.leadScientist}</span>
                    <button
                      onClick={() => setViewingResult(res)}
                      className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold"
                    >
                      <span>Examine Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Analysis Run Modal */}
      <Modal
        isOpen={isAddAnalysisOpen}
        onClose={() => setIsAddAnalysisOpen(false)}
        title="Execute Computational Pipeline Run"
        subtitle="Submit dataset for differential expression, peak alignment, or docking simulation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAnalysis} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Analysis Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={analysisForm.name}
              onChange={(e) => setAnalysisForm({ ...analysisForm, name: e.target.value })}
              placeholder="e.g. DESeq2 Differential Gene Expression & Volcano Filter"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Experiment <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={analysisForm.associatedExperiment}
                onChange={(e) => setAnalysisForm({ ...analysisForm, associatedExperiment: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.id} - {exp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Input Dataset</label>
              <select
                value={analysisForm.datasetId}
                onChange={(e) => setAnalysisForm({ ...analysisForm, datasetId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline / Software Environment
              </label>
              <input
                type="text"
                value={analysisForm.pipelineVersion}
                onChange={(e) => setAnalysisForm({ ...analysisForm, pipelineVersion: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Analyst</label>
              <input
                type="text"
                value={analysisForm.analyst}
                onChange={(e) => setAnalysisForm({ ...analysisForm, analyst: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Methodology & Algorithmic Parameters
            </label>
            <textarea
              rows={3}
              value={analysisForm.methods}
              onChange={(e) => setAnalysisForm({ ...analysisForm, methods: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddAnalysisOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              Execute Pipeline Run
            </button>
          </div>
        </form>
      </Modal>

      {/* View Analysis Modal */}
      {viewingAnalysis && (
        <Modal
          isOpen={!!viewingAnalysis}
          onClose={() => setViewingAnalysis(null)}
          title={viewingAnalysis.name}
          subtitle={`${viewingAnalysis.id} • Pipeline: ${viewingAnalysis.pipelineVersion}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Methodology & Algorithmic Process
              </span>
              <p className="text-slate-700 leading-relaxed">{viewingAnalysis.methods}</p>
            </div>

            {viewingAnalysis.metrics && (
              <div>
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-2">
                  Calculated Run Metrics
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(viewingAnalysis.metrics).map(([k, v]) => (
                    <div key={k} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-mono font-bold text-navy-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingAnalysis(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Result Modal */}
      {viewingResult && (
        <Modal
          isOpen={!!viewingResult}
          onClose={() => setViewingResult(null)}
          title={viewingResult.title}
          subtitle={`Result ID: ${viewingResult.id} • Associated Experiment: ${viewingResult.experimentId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                Primary Experimental Finding
              </span>
              <p className="font-bold text-emerald-950 text-sm mt-0.5">{viewingResult.primaryMetric}</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Reproducibility Score: {viewingResult.reproducibilityScore} (FAIR Compliant)
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Summary of Evidence
              </span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {viewingResult.summary}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Conclusions & Translational Impact
              </span>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {viewingResult.conclusions}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingResult(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAnalysisId}
        onClose={() => setDeletingAnalysisId(null)}
        onConfirm={handleDeleteAnalysis}
        title="Delete Analysis Record"
        message="Are you sure you want to delete this computational analysis record? Downstream results may lose their direct pipeline linkage."
      />
    </div>
  );
}
