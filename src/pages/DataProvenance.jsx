import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  GitFork,
  FolderGit2,
  FlaskConical,
  FileCode2,
  TestTube2,
  Sliders,
  Database,
  LineChart,
  CheckCircle2,
  Download,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Clock,
  Hash,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { exportJSON } from '../utils/exportUtils';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, formatBytes } from '../utils/formatters';

export default function DataProvenance() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { experiments, getProvenanceData } = useData();
  const { addToast } = useToast();

  // Selected experiment ID from URL or default to first
  const selectedExpId = searchParams.get('experimentId') || experiments[0]?.id;
  const [viewMode, setViewMode] = useState('dag'); // 'dag' | 'timeline'
  const [selectedNodeKey, setSelectedNodeKey] = useState('experiment'); // currently inspected node in graph

  // Get active provenance data
  const provenance = useMemo(() => {
    return getProvenanceData(selectedExpId);
  }, [getProvenanceData, selectedExpId]);

  const handleSelectExperiment = (id) => {
    setSearchParams({ experimentId: id });
    setSelectedNodeKey('experiment');
  };

  const handleExportProvenance = () => {
    if (!provenance) return;
    const manifest = {
      complianceStandard: 'FAIR & 21 CFR Part 11 Data Provenance Manifest',
      generatedAt: new Date().toISOString(),
      platform: 'BioSprint Engine v2.4 Pro',
      experimentId: provenance.experiment.id,
      experimentName: provenance.experiment.name,
      lineage: {
        project: provenance.project,
        experiment: provenance.experiment,
        protocol: provenance.protocol,
        samples: provenance.samples,
        parameters: provenance.parameters,
        observations: provenance.observations,
        datasets: provenance.datasets,
        analyses: provenance.analyses,
        results: provenance.results
      }
    };
    exportJSON(`BioSprint_Provenance_${provenance.experiment.id}`, manifest);
    addToast(`Exported immutable provenance manifest for ${provenance.experiment.id}`, 'success');
  };

  if (!experiments || experiments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">Data Provenance Lineage Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">End-to-end W3C PROV-O compliant traceability from Project to Final Result.</p>
        </div>
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-200">
            <GitFork className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-navy-900">Zero Laboratory Experiments Registered</h3>
          <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            The Data Provenance engine renders dynamic 8-stage directed acyclic lineage graphs (Project &rarr; Experiment &rarr; Protocol &rarr; Sample &rarr; Parameters &rarr; Dataset &rarr; Analysis &rarr; Result) once experimental workflows are created.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/experiments')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <FlaskConical className="w-4 h-4" />
              Register First Experiment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!provenance || !provenance.experiment) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <GitFork className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-navy-900">No Experiment Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select an experiment to trace data provenance.</p>
      </div>
    );
  }

  // Define the 8 sequential nodes of the DAG
  const nodes = [
    {
      key: 'project',
      label: 'Research Project',
      icon: FolderGit2,
      id: provenance.project.id,
      name: provenance.project.name,
      subtext: provenance.project.leadResearcher,
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'experiment',
      label: 'Laboratory Experiment',
      icon: FlaskConical,
      id: provenance.experiment.id,
      name: provenance.experiment.name,
      subtext: provenance.experiment.status,
      color: 'border-teal-400 bg-teal-50/40 hover:border-teal-600'
    },
    {
      key: 'protocol',
      label: 'Protocol SOP',
      icon: FileCode2,
      id: provenance.protocol.id || provenance.protocol.code,
      name: provenance.protocol.name,
      subtext: `Version: ${provenance.protocol.version}`,
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'sample',
      label: 'Biological Samples',
      icon: TestTube2,
      id: provenance.samples[0]?.id || 'SMP-N/A',
      name: provenance.samples[0]?.name || 'Specimen Registered',
      subtext: `${provenance.samples.length} specimen(s) logged`,
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'parameters',
      label: 'Parameters & Logs',
      icon: Sliders,
      id: 'PARAMS-ENV',
      name: `${Object.keys(provenance.parameters).length} FAIR Parameters`,
      subtext: `${provenance.observations.length} Audit Notes`,
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'dataset',
      label: 'Research Datasets',
      icon: Database,
      id: provenance.datasets[0]?.id || 'DS-PENDING',
      name: provenance.datasets[0]?.name || 'Raw Instrument Data',
      subtext: provenance.datasets[0]?.checksumSha256
        ? `SHA-256: ${provenance.datasets[0].checksumSha256.substring(0, 8)}...`
        : 'Awaiting File Deposit',
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'analysis',
      label: 'Computational Analysis',
      icon: LineChart,
      id: provenance.analyses[0]?.id || 'ANA-PENDING',
      name: provenance.analyses[0]?.name || 'Bioinformatics Pipeline',
      subtext: provenance.analyses[0]?.pipelineVersion || 'Standard Pipeline',
      color: 'border-slate-300 bg-white hover:border-teal-500'
    },
    {
      key: 'result',
      label: 'Final Result',
      icon: CheckCircle2,
      id: provenance.results[0]?.id || 'RES-PENDING',
      name: provenance.results[0]?.title || 'Validated Conclusion',
      subtext: provenance.results[0]?.reproducibilityScore
        ? `Reproducibility: ${provenance.results[0].reproducibilityScore}`
        : 'In Validation',
      color: 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">Data Provenance</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Lineage Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end biological traceability: Research Project &rarr; Experiment &rarr; Protocol &rarr; Sample &rarr; Parameters &rarr; Dataset &rarr; Analysis &rarr; Result
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('dag')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'dag' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Lineage DAG
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'timeline' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Audit Timeline
            </button>
          </div>

          <button
            onClick={handleExportProvenance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Provenance Manifest</span>
          </button>
        </div>
      </div>

      {/* Experiment Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Traceability Target Experiment
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedExpId}
                onChange={(e) => handleSelectExperiment(e.target.value)}
                className="text-sm font-bold text-navy-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.id} - {exp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Project</span>
            <span className="font-semibold text-slate-800">{provenance.project.code || provenance.project.id}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">SOP Protocol</span>
            <span className="font-semibold text-teal-700">{provenance.protocol.version}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Status</span>
            <StatusBadge status={provenance.experiment.status} size="xs" />
          </div>
        </div>
      </div>

      {/* Main Content Area: 2 Columns (DAG / Timeline on left, Node Inspector on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Lineage DAG or Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'dag' ? (
            /* Interactive Flow Graph DAG */
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interactive Provenance Lineage Graph
                </span>
                <span className="text-[11px] text-slate-400">
                  Click any node to inspect deep cryptographic metadata
                </span>
              </div>

              {/* Sequential Flow Nodes */}
              <div className="space-y-3">
                {nodes.map((node, index) => {
                  const isSelected = selectedNodeKey === node.key;
                  const isLast = index === nodes.length - 1;
                  const Icon = node.icon;

                  return (
                    <React.Fragment key={node.key}>
                      <div
                        onClick={() => setSelectedNodeKey(node.key)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-sm'
                            : `${node.color} shadow-xs hover:shadow-sm`
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Step {index + 1}: {node.label}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                {node.id}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-navy-900 truncate mt-0.5">
                              {node.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-slate-500 font-mono hidden sm:block">
                            {node.subtext}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-teal-600 translate-x-0.5' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Directional Down Connector Arrow */}
                      {!isLast && (
                        <div className="flex items-center justify-center py-0.5">
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-3 bg-teal-400/50" />
                            <div className="w-2 h-2 border-r-2 border-b-2 border-teal-500 rotate-45 -mt-1" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Chronological Audit Trail View */
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-navy-900 mb-4">
                Chronological Provenance Audit Trail (21 CFR Part 11)
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                  <span className="text-[10px] font-mono text-slate-400">{provenance.experiment.startDate} 09:00</span>
                  <h4 className="text-xs font-bold text-navy-900">Project Authorized & Initialized</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Initiated under project {provenance.project.id} ({provenance.project.name}) by {provenance.project.leadResearcher}.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                  <span className="text-[10px] font-mono text-slate-400">{provenance.experiment.startDate} 10:15</span>
                  <h4 className="text-xs font-bold text-navy-900">Protocol SOP Locked: {provenance.protocol.version}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Standard Operating Procedure {provenance.protocol.name} version snapshot tagged for audit trail.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                  <span className="text-[10px] font-mono text-slate-400">{provenance.experiment.startDate} 11:30</span>
                  <h4 className="text-xs font-bold text-navy-900">Biological Specimens Bound</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {provenance.samples.length} specimen(s) logged from freezer inventory: {provenance.samples.map(s => s.id).join(', ')}.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                  <span className="text-[10px] font-mono text-slate-400">{provenance.experiment.startDate} 14:00</span>
                  <h4 className="text-xs font-bold text-navy-900">Assay Parameters Recorded</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Environmental and instrument parameters committed with {provenance.observations.length} benchmark observations.
                  </p>
                </div>

                {provenance.datasets.map((d, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                    <span className="text-[10px] font-mono text-slate-400">{d.uploadDate} 16:45</span>
                    <h4 className="text-xs font-bold text-navy-900">Raw Dataset Ingested & Cryptographically Hashed</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {d.name} ({formatBytes(d.sizeBytes)}) committed with SHA-256: {d.checksumSha256.substring(0, 16)}...
                    </p>
                  </div>
                ))}

                {provenance.results.map((r, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <span className="text-[10px] font-mono text-slate-400">{r.publishedDate} 18:00</span>
                    <h4 className="text-xs font-bold text-emerald-900">Final Result Validated & Sealed</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {r.title} ({r.primaryMetric}) certified with {r.reproducibilityScore} reproducibility score.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Provenance Node Inspector */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Provenance Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                {selectedNodeKey}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* NODE 1: PROJECT */}
              {selectedNodeKey === 'project' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Project Title</span>
                    <p className="font-bold text-navy-900 text-sm">{provenance.project.name}</p>
                    <span className="font-mono text-slate-500 text-[11px]">{provenance.project.id} • {provenance.project.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lead Principal Investigator</span>
                    <p className="font-semibold text-slate-800">{provenance.project.leadResearcher}</p>
                    <p className="text-slate-500 text-[11px]">{provenance.project.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scientific Objective</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {provenance.project.description}
                    </p>
                  </div>
                </div>
              )}

              {/* NODE 2: EXPERIMENT */}
              {selectedNodeKey === 'experiment' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Experiment Name</span>
                    <p className="font-bold text-navy-900 text-sm">{provenance.experiment.name}</p>
                    <span className="font-mono text-teal-700 font-semibold">{provenance.experiment.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Operator & Date</span>
                    <p className="font-semibold text-slate-800">{provenance.experiment.operator || provenance.experiment.researcher}</p>
                    <p className="text-slate-500 text-[11px]">Started: {formatDate(provenance.experiment.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Status</span>
                    <StatusBadge status={provenance.experiment.status} size="xs" />
                  </div>
                </div>
              )}

              {/* NODE 3: PROTOCOL */}
              {selectedNodeKey === 'protocol' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Protocol SOP</span>
                    <p className="font-bold text-navy-900 text-sm">{provenance.protocol.name}</p>
                    <span className="font-mono text-teal-700 font-bold">{provenance.protocol.version}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Category & Author</span>
                    <p className="font-semibold text-slate-800">{provenance.protocol.category}</p>
                    <p className="text-slate-500 text-[11px]">Author: {provenance.protocol.author}</p>
                  </div>
                  {provenance.protocol.reagents && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                        Critical Reagents
                      </span>
                      <div className="space-y-1">
                        {provenance.protocol.reagents.slice(0, 3).map((r, i) => (
                          <div key={i} className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[11px]">
                            <strong className="text-slate-800">{r.name}</strong> ({r.storage})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NODE 4: SAMPLES */}
              {selectedNodeKey === 'sample' && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Specimens Attached ({provenance.samples.length})
                  </span>
                  {provenance.samples.map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-700">{s.id}</span>
                        <StatusBadge status={s.status} size="xs" />
                      </div>
                      <p className="font-bold text-navy-900">{s.name}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{s.storageLocation}</p>
                      <p className="text-slate-600 text-[11px]">Temp: {s.temperature} • Vol: {s.volume}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* NODE 5: PARAMETERS */}
              {selectedNodeKey === 'parameters' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Logged Experimental Parameters
                    </span>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {Object.entries(provenance.parameters || {}).map(([k, v]) => (
                        <div key={k} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                          <span className="font-mono text-slate-600 font-semibold">{k}</span>
                          <span className="font-mono text-navy-900 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Audit Observations
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {provenance.observations.map((obs, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                          <span className="text-slate-400 font-mono block text-[10px]">{obs.timestamp}</span>
                          <span className="text-slate-700">{obs.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NODE 6: DATASETS */}
              {selectedNodeKey === 'dataset' && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Registered Datasets ({provenance.datasets.length})
                  </span>
                  {provenance.datasets.map((d) => (
                    <div key={d.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-700">{d.id}</span>
                        <span className="font-mono text-slate-500">{formatBytes(d.sizeBytes)}</span>
                      </div>
                      <p className="font-mono font-bold text-navy-900 text-[11px] break-all">{d.name}</p>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">SHA-256 Checksum</span>
                        <p className="font-mono text-[10px] text-slate-700 bg-white p-1 rounded border border-slate-200 break-all select-all">
                          {d.checksumSha256}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NODE 7: ANALYSIS */}
              {selectedNodeKey === 'analysis' && (
                <div className="space-y-3">
                  {provenance.analyses.map((a) => (
                    <div key={a.id} className="space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pipeline Name</span>
                        <p className="font-bold text-navy-900 text-sm">{a.name}</p>
                        <span className="font-mono text-slate-500">{a.pipelineVersion}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Analyst</span>
                        <p className="font-semibold text-slate-800">{a.analyst} ({formatDate(a.executionDate)})</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Methods</span>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                          {a.methods}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NODE 8: RESULTS */}
              {selectedNodeKey === 'result' && (
                <div className="space-y-3">
                  {provenance.results.map((r) => (
                    <div key={r.id} className="space-y-2">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Validated Finding</span>
                        <p className="font-bold text-emerald-950 text-sm mt-0.5">{r.primaryMetric}</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                          Reproducibility: {r.reproducibilityScore}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Conclusion</span>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                          {r.conclusions}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                        <span>Certified: {r.leadScientist}</span>
                        <span>{formatDate(r.publishedDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
