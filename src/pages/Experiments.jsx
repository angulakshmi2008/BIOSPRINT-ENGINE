import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  GitFork,
  Calendar,
  User,
  FileCode2,
  TestTube2,
  Database,
  LineChart,
  CheckCircle2,
  Clock,
  PlusCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function Experiments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    experiments,
    projects,
    protocols,
    samples,
    datasets,
    analyses,
    results,
    addExperiment,
    updateExperiment,
    deleteExperiment,
    currentUser
  } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('projectId') || 'ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(!isViewer && searchParams.get('action') === 'new');
  const [editingExp, setEditingExp] = useState(null);
  const [viewingExp, setViewingExp] = useState(null);
  const [deletingExpId, setDeletingExpId] = useState(null);

  // New observation state inside view modal
  const [newObservationText, setNewObservationText] = useState('');

  // Form state
  const initialForm = {
    name: '',
    code: '',
    projectId: projects[0]?.id || '',
    protocolId: protocols[0]?.id || '',
    researcher: currentUser?.fullName || '',
    operator: currentUser?.fullName || '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'In Progress',
    description: '',
    parameters: {
      temperature: '37.0°C / 5% CO2',
      incubationDuration: '48 hours',
      reagentBatch: 'B-2024-Q4'
    }
  };
  const [formData, setFormData] = useState(initialForm);

  // Parameters key-value builder state for creation
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');

  // Filtered experiments
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      const matchesSearch =
        exp.name.toLowerCase().includes(search.toLowerCase()) ||
        exp.code.toLowerCase().includes(search.toLowerCase()) ||
        exp.id.toLowerCase().includes(search.toLowerCase()) ||
        exp.researcher.toLowerCase().includes(search.toLowerCase()) ||
        (exp.protocolName && exp.protocolName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || exp.status === statusFilter;
      const matchesProject = projectFilter === 'ALL' || exp.projectId === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [experiments, search, statusFilter, projectFilter]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      projectId: projects[0]?.id || '',
      protocolId: protocols[0]?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExp(exp);
    setFormData({
      name: exp.name,
      code: exp.code,
      projectId: exp.projectId,
      protocolId: exp.protocolId,
      researcher: exp.researcher,
      operator: exp.operator || exp.researcher,
      startDate: exp.startDate,
      status: exp.status,
      description: exp.description,
      parameters: { ...(exp.parameters || {}) }
    });
  };

  const handleAddParam = () => {
    if (!paramKey.trim() || !paramValue.trim()) return;
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [paramKey.trim()]: paramValue.trim()
      }
    });
    setParamKey('');
    setParamValue('');
  };

  const handleRemoveParam = (key) => {
    const updated = { ...formData.parameters };
    delete updated[key];
    setFormData({ ...formData, parameters: updated });
  };

  const handleSaveExperiment = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.projectId || !formData.protocolId) {
      addToast('Please fill in experiment title, project, and protocol', 'error');
      return;
    }

    const selectedProj = projects.find((p) => p.id === formData.projectId);
    const selectedProt = protocols.find((p) => p.id === formData.protocolId);

    const payload = {
      ...formData,
      projectName: selectedProj?.name || 'Research Project',
      protocolName: selectedProt?.name || 'Laboratory Protocol',
      protocolVersion: selectedProt?.version || 'v1.0'
    };

    if (editingExp) {
      updateExperiment(editingExp.id, payload);
      addToast(`Experiment ${editingExp.id} updated`, 'success');
      setEditingExp(null);
    } else {
      const created = addExperiment(payload);
      addToast(`Experiment ${created.id} created`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (deletingExpId) {
      deleteExperiment(deletingExpId);
      addToast('Experiment deleted from registry', 'info');
      setDeletingExpId(null);
      if (viewingExp?.id === deletingExpId) {
        setViewingExp(null);
      }
    }
  };

  // Add observation note live inside details modal
  const handleAddObservation = (e) => {
    e.preventDefault();
    if (!newObservationText.trim() || !viewingExp) return;

    const newNote = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: newObservationText.trim()
    };

    const updatedObservations = [...(viewingExp.observations || []), newNote];
    updateExperiment(viewingExp.id, { observations: updatedObservations });

    setViewingExp({
      ...viewingExp,
      observations: updatedObservations
    });

    setNewObservationText('');
    addToast('Observation note appended to audit trail', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Experiments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute, parameterize, and record laboratory assays with strict SOP traceability
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Experiment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search experiment ID, assay title, protocol..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active', value: 'Active' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
          { label: 'On Hold', value: 'On Hold' }
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        secondaryFilterOptions={[
          { label: 'All Projects', value: 'ALL' },
          ...projects.map((p) => ({ label: p.code || p.id, value: p.id }))
        ]}
        activeSecondaryFilter={projectFilter}
        onSecondaryFilterChange={setProjectFilter}
        totalCount={filteredExperiments.length}
      />

      {/* Experiments Table */}
      {filteredExperiments.length === 0 ? (
        <EmptyState
          title="No experiments found"
          description="No experiments match your search or filter settings."
          icon={FlaskConical}
          actionLabel={!isViewer ? "Create Experiment" : undefined}
          onAction={!isViewer ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Experiment ID</th>
                  <th className="py-3 px-4">Assay Title</th>
                  <th className="py-3 px-4">Research Project</th>
                  <th className="py-3 px-4">Protocol (SOP)</th>
                  <th className="py-3 px-4">Scientist</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredExperiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                      {exp.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy-900 max-w-sm">
                      <button
                        onClick={() => setViewingExp(exp)}
                        className="hover:text-teal-600 text-left line-clamp-1 font-semibold"
                      >
                        {exp.name}
                      </button>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                        {exp.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{exp.projectName}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{exp.projectId}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                        {exp.protocolName}
                        <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                          {exp.protocolVersion}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{exp.researcher}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">{formatDate(exp.startDate)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={exp.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            navigate(`/provenance?experimentId=${exp.id}`);
                          }}
                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-md transition-colors"
                          title="View in Data Provenance Graph"
                        >
                          <GitFork className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingExp(exp)}
                          className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(exp)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 rounded-md transition-colors"
                              title="Edit Experiment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingExpId(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="Delete Experiment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Experiment Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingExp}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExp(null);
        }}
        title={editingExp ? `Edit Experiment: ${editingExp.id}` : 'Create Laboratory Experiment'}
        subtitle="Specify project binding, SOP protocol version, and parameters"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveExperiment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experiment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CRISPResso2 Deep Quantification of On/Off-Target Alleles"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. EXP-CRISPR-03"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Research Project <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} • {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory Protocol (SOP) <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.protocolId}
                onChange={(e) => setFormData({ ...formData, protocolId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {protocols.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.id} ({pr.version}) - {pr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Protocol Variations
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline specific experimental controls, incubation, or variations from baseline SOP..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Scientist</label>
              <input
                type="text"
                required
                value={formData.researcher}
                onChange={(e) => setFormData({ ...formData, researcher: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Key-Value Parameters Builder */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Experimental Parameters (FAIR Provenance Attributes)
            </span>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Parameter Name (e.g. pulseCode, cellCount)"
                value={paramKey}
                onChange={(e) => setParamKey(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
              />
              <input
                type="text"
                placeholder="Value (e.g. CA-137, 1.2 x 10^6 cells)"
                value={paramValue}
                onChange={(e) => setParamValue(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
              />
              <button
                type="button"
                onClick={handleAddParam}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
              {Object.entries(formData.parameters || {}).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md font-mono"
                >
                  <strong className="text-slate-800">{k}:</strong>
                  <span className="text-slate-600">{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(k)}
                    className="text-slate-400 hover:text-rose-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExp(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              {editingExp ? 'Save Experiment' : 'Create Experiment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Experiment Details Modal */}
      {viewingExp && (
        <Modal
          isOpen={!!viewingExp}
          onClose={() => setViewingExp(null)}
          title={viewingExp.name}
          subtitle={`${viewingExp.id} • ${viewingExp.code || ''} • Started ${formatDate(viewingExp.startDate)}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Top metadata strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Project
                </span>
                <span className="font-bold text-navy-900">{viewingExp.projectName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Protocol SOP
                </span>
                <span className="font-bold text-teal-700">
                  {viewingExp.protocolName} ({viewingExp.protocolVersion})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Scientist / Operator
                </span>
                <span className="font-bold text-navy-900">{viewingExp.researcher}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Current Status
                </span>
                <StatusBadge status={viewingExp.status} size="xs" />
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Assay Objective & Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {viewingExp.description || 'No description recorded.'}
              </p>
            </div>

            {/* Experimental Parameters */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                Recorded Assay Parameters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(viewingExp.parameters || {}).map(([param, val]) => (
                  <div
                    key={param}
                    className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-600 font-mono text-[11px]">{param}</span>
                    <span className="font-mono text-navy-900 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations Log with live append */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                Audit Observations Log ({viewingExp.observations?.length || 0})
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto mb-3">
                {viewingExp.observations?.map((obs, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start gap-2.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold block">
                        {obs.timestamp}
                      </span>
                      <p className="text-slate-700 mt-0.5">{obs.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add observation form */}
              {!isViewer && (
                <form onSubmit={handleAddObservation} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Record timestamped bench observation note..."
                    value={newObservationText}
                    onChange={(e) => setNewObservationText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Note</span>
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingExp(null);
                  navigate(`/provenance?experimentId=${viewingExp.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                <GitFork className="w-4 h-4" />
                <span>Inspect in Data Provenance &rarr;</span>
              </button>

              <button
                onClick={() => setViewingExp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingExpId}
        onClose={() => setDeletingExpId(null)}
        onConfirm={handleDelete}
        title="Delete Laboratory Experiment"
        message="Are you sure you want to delete this experiment? This action permanently removes the run and unlinks downstream datasets."
      />
    </div>
  );
}
