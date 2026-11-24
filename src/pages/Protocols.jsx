import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileCode2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  History,
  CheckCircle2,
  Clock,
  Layers,
  FlaskConical,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function Protocols() {
  const [searchParams] = useSearchParams();
  const { protocols, experiments, addProtocol, updateProtocol, deleteProtocol, currentUser } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(!isViewer && searchParams.get('action') === 'new');
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [viewingProtocol, setViewingProtocol] = useState(null);
  const [deletingProtId, setDeletingProtId] = useState(null);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  // Form state
  const initialForm = {
    name: '',
    code: '',
    version: 'v1.0',
    category: 'Molecular Biology',
    author: currentUser?.fullName || '',
    status: 'Validated',
    description: '',
    steps: [
      { step: 1, title: 'Reagent Preparation', instruction: 'Equilibrate all buffers to 22°C for 20 minutes.' },
      { step: 2, title: 'Sample Processing', instruction: 'Perform sample dilution according to stoichiometric ratios.' }
    ],
    reagents: [
      { name: 'Nuclease-Free Water', catalogNo: 'AM9937', storage: 'Room Temp' }
    ]
  };
  const [formData, setFormData] = useState(initialForm);

  // New step / reagent input state
  const [stepTitle, setStepTitle] = useState('');
  const [stepInstruction, setStepInstruction] = useState('');
  const [reagentName, setReagentName] = useState('');
  const [reagentCat, setReagentCat] = useState('');
  const [reagentStorage, setReagentStorage] = useState('4°C');
  const [revisionNote, setRevisionNote] = useState('');

  // Categories
  const categories = useMemo(() => {
    const set = new Set(protocols.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [protocols]);

  // Filter protocols
  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [protocols, search, categoryFilter]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProtocol(p);
    setRevisionNote('');
    setFormData({
      name: p.name,
      code: p.code,
      version: p.version,
      category: p.category,
      author: p.author,
      status: p.status,
      description: p.description,
      steps: p.steps ? [...p.steps] : [],
      reagents: p.reagents ? [...p.reagents] : []
    });
  };

  const handleAddStep = () => {
    if (!stepTitle.trim() || !stepInstruction.trim()) return;
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          step: formData.steps.length + 1,
          title: stepTitle.trim(),
          instruction: stepInstruction.trim()
        }
      ]
    });
    setStepTitle('');
    setStepInstruction('');
  };

  const handleRemoveStep = (idx) => {
    const updated = formData.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
    setFormData({ ...formData, steps: updated });
  };

  const handleAddReagent = () => {
    if (!reagentName.trim()) return;
    setFormData({
      ...formData,
      reagents: [
        ...formData.reagents,
        {
          name: reagentName.trim(),
          catalogNo: reagentCat.trim() || 'N/A',
          storage: reagentStorage
        }
      ]
    });
    setReagentName('');
    setReagentCat('');
  };

  const handleRemoveReagent = (idx) => {
    const updated = formData.reagents.filter((_, i) => i !== idx);
    setFormData({ ...formData, reagents: updated });
  };

  const handleSaveProtocol = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('Protocol name and SOP code are required', 'error');
      return;
    }

    if (editingProtocol) {
      updateProtocol(editingProtocol.id, {
        ...formData,
        revisionNotes: revisionNote.trim() || 'Protocol parameters revised.'
      });
      addToast(`Protocol ${editingProtocol.id} updated to ${formData.version}`, 'success');
      setEditingProtocol(null);
    } else {
      const created = addProtocol(formData);
      addToast(`Protocol ${created.id} registered`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (deletingProtId) {
      deleteProtocol(deletingProtId);
      addToast('Protocol removed from SOP registry', 'info');
      setDeletingProtId(null);
      if (viewingProtocol?.id === deletingProtId) {
        setViewingProtocol(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Laboratory Protocols</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard operating procedures (SOP), step-by-step assays, and version-controlled revisions
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Protocol</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search protocols by name, SOP code, category, author..."
        filterOptions={categories.map((c) => ({
          label: c === 'ALL' ? 'All Categories' : c,
          value: c
        }))}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        totalCount={filteredProtocols.length}
      />

      {/* Protocols Grid */}
      {filteredProtocols.length === 0 ? (
        <EmptyState
          title="No protocols found"
          description="No laboratory SOP matches your current filter or search criteria."
          icon={FileCode2}
          actionLabel={!isViewer ? "Create Protocol" : undefined}
          onAction={!isViewer ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProtocols.map((protocol) => {
            const linkedExperiments = experiments.filter((e) => e.protocolId === protocol.id);
            return (
              <div
                key={protocol.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {protocol.code}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                        {protocol.version}
                      </span>
                    </div>
                    <StatusBadge status={protocol.status} size="xs" />
                  </div>

                  <h3
                    onClick={() => {
                      setViewingProtocol(protocol);
                      setShowRevisionHistory(false);
                    }}
                    className="text-sm font-bold text-navy-900 group-hover:text-teal-700 cursor-pointer transition-colors line-clamp-2"
                  >
                    {protocol.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {protocol.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium text-slate-700 truncate">{protocol.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Author:</span>
                      <span className="font-medium text-slate-700">{protocol.author}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Steps:</span>
                      <span className="font-semibold text-navy-900">{protocol.steps?.length || 0} procedures</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                    <span>{linkedExperiments.length} Runs</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setViewingProtocol(protocol);
                        setShowRevisionHistory(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md transition-colors"
                      title="Version History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setViewingProtocol(protocol);
                        setShowRevisionHistory(false);
                      }}
                      className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md transition-colors"
                      title="View Procedures"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {!isViewer && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(protocol)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 rounded-md transition-colors"
                          title="Edit Protocol"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProtId(protocol.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete Protocol"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Protocol Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProtocol}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProtocol(null);
        }}
        title={editingProtocol ? `Edit Protocol: ${editingProtocol.code}` : 'Register Laboratory Protocol (SOP)'}
        subtitle="Version-controlled procedure specifications and required reagents"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveProtocol} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Protocol Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. High-Fidelity Cas9 RNP Electroporation in CD34+ Cells"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SOP Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. SOP-CAS9-EP"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Version Number</label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g. v3.3"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Transfection, Genomics, Nanomedicine"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Scientist</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Protocol Description & Purpose
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {editingProtocol && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Revision Notes (Audit History)
              </label>
              <input
                type="text"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Explain what was changed in this revision (e.g. Adjusted molar ratio, modified pulse code)..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          )}

          {/* Procedure Steps Builder */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Step-by-Step Laboratory Procedures ({formData.steps.length})
            </span>
            <div className="space-y-2 mb-2 max-h-36 overflow-y-auto">
              {formData.steps.map((st, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                      {st.step}
                    </span>
                    <div>
                      <strong className="text-navy-900">{st.title}: </strong>
                      <span className="text-slate-600">{st.instruction}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(i)}
                    className="text-slate-400 hover:text-rose-500 font-bold px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Step Title (e.g. Centrifugation)"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                className="w-1/3 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
              />
              <input
                type="text"
                placeholder="Instruction Details..."
                value={stepInstruction}
                onChange={(e) => setStepInstruction(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg"
              >
                + Step
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProtocol(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              {editingProtocol ? 'Save Protocol Revision' : 'Register Protocol'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Protocol Details / Revisions Modal */}
      {viewingProtocol && (
        <Modal
          isOpen={!!viewingProtocol}
          onClose={() => setViewingProtocol(null)}
          title={viewingProtocol.name}
          subtitle={`${viewingProtocol.code} • Version ${viewingProtocol.version} • Author: ${viewingProtocol.author}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setShowRevisionHistory(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  !showRevisionHistory
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Step-by-Step Procedures
              </button>
              <button
                onClick={() => setShowRevisionHistory(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  showRevisionHistory
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Version History & Revisions ({viewingProtocol.revisions?.length || 1})
              </button>
            </div>

            {!showRevisionHistory ? (
              <div className="space-y-5">
                {/* Protocol summary */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {viewingProtocol.description}
                </p>

                {/* Steps List */}
                <div>
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                    Standard Operating Procedure Steps
                  </h4>
                  <div className="space-y-2.5">
                    {viewingProtocol.steps?.map((step) => (
                      <div
                        key={step.step}
                        className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3 text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {step.step}
                        </div>
                        <div>
                          <h5 className="font-bold text-navy-900">{step.title}</h5>
                          <p className="text-slate-600 mt-1 leading-relaxed">{step.instruction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reagents Table */}
                {viewingProtocol.reagents && viewingProtocol.reagents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                      Required Reagents & Storage
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Reagent Name</th>
                            <th className="py-2 px-3">Catalog / Part #</th>
                            <th className="py-2 px-3">Storage Temperature</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingProtocol.reagents.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-medium text-navy-900">{r.name}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{r.catalogNo}</td>
                              <td className="py-2 px-3 text-slate-600">{r.storage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Version History Drawer */
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Protocol Audit Revisions Log
                </h4>
                {viewingProtocol.revisions?.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-700 font-mono text-xs">{rev.version}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(rev.date)}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{rev.notes}</p>
                    <p className="text-[11px] text-slate-400">Author: {rev.author}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingProtocol(null)}
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
        isOpen={!!deletingProtId}
        onClose={() => setDeletingProtId(null)}
        onConfirm={handleDelete}
        title="Delete Protocol"
        message="Are you sure you want to remove this protocol SOP? Experiments previously executed with this protocol will retain their snapshot version in the provenance log."
      />
    </div>
  );
}
