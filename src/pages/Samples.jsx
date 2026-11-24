import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TestTube2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Thermometer,
  MapPin,
  Calendar,
  Layers,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function Samples() {
  const [searchParams] = useSearchParams();
  const { samples, experiments, projects, addSample, updateSample, deleteSample, currentUser } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(!isViewer && searchParams.get('action') === 'new');
  const [editingSample, setEditingSample] = useState(null);
  const [viewingSample, setViewingSample] = useState(null);
  const [deletingSampleId, setDeletingSampleId] = useState(null);

  // Form state
  const initialForm = {
    name: '',
    sampleType: 'Primary Human Cells',
    organism: 'Homo sapiens',
    source: 'Cell Culture / Apheresis',
    storageLocation: '-80°C Ultra-Low Freezer Alpha, Shelf 3, Box 10, Slot C2',
    temperature: '-80°C',
    concentration: '1.0 x 10^7 cells/mL',
    volume: '1.0 mL',
    aliquots: 4,
    biosafetyLevel: 'BSL-2',
    collectionDate: new Date().toISOString().split('T')[0],
    status: 'Available',
    associatedExperiment: experiments[0]?.id || '',
    projectId: projects[0]?.id || ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Unique sample types
  const sampleTypes = useMemo(() => {
    const set = new Set(samples.map((s) => s.sampleType));
    return ['ALL', ...Array.from(set)];
  }, [samples]);

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.storageLocation.toLowerCase().includes(search.toLowerCase()) ||
        s.organism.toLowerCase().includes(search.toLowerCase()) ||
        (s.associatedExperiment && s.associatedExperiment.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || s.sampleType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [samples, search, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      associatedExperiment: experiments[0]?.id || '',
      projectId: projects[0]?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSample(s);
    setFormData({
      name: s.name,
      sampleType: s.sampleType,
      organism: s.organism,
      source: s.source,
      storageLocation: s.storageLocation,
      temperature: s.temperature,
      concentration: s.concentration,
      volume: s.volume,
      aliquots: s.aliquots || 1,
      biosafetyLevel: s.biosafetyLevel || 'BSL-1',
      collectionDate: s.collectionDate,
      status: s.status,
      associatedExperiment: s.associatedExperiment || '',
      projectId: s.projectId || ''
    });
  };

  const handleSaveSample = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.storageLocation.trim()) {
      addToast('Sample name and storage coordinate are required', 'error');
      return;
    }

    if (editingSample) {
      updateSample(editingSample.id, formData);
      addToast(`Sample ${editingSample.id} updated`, 'success');
      setEditingSample(null);
    } else {
      const created = addSample(formData);
      addToast(`Sample ${created.id} registered into cold storage`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (deletingSampleId) {
      deleteSample(deletingSampleId);
      addToast('Sample record decommissioned from inventory', 'info');
      setDeletingSampleId(null);
      if (viewingSample?.id === deletingSampleId) {
        setViewingSample(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Sample Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track biological specimens, cold-chain storage coordinates, aliquot counts, and experiment bindings
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Sample</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sample ID, name, freezer shelf, organism..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Available', value: 'Available' },
          { label: 'In Assay', value: 'In Assay' },
          { label: 'Depleted', value: 'Depleted' }
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        secondaryFilterOptions={sampleTypes.map((t) => ({
          label: t === 'ALL' ? 'All Sample Types' : t,
          value: t
        }))}
        activeSecondaryFilter={typeFilter}
        onSecondaryFilterChange={setTypeFilter}
        totalCount={filteredSamples.length}
      />

      {/* Samples Table */}
      {filteredSamples.length === 0 ? (
        <EmptyState
          title="No biological samples found"
          description="No samples match the selected query or filter criteria."
          icon={TestTube2}
          actionLabel={!isViewer ? "Register Sample" : undefined}
          onAction={!isViewer ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Sample ID</th>
                  <th className="py-3 px-4">Sample Name / Type</th>
                  <th className="py-3 px-4">Storage Location & Temp</th>
                  <th className="py-3 px-4">Organism / Source</th>
                  <th className="py-3 px-4">Aliquots & Volume</th>
                  <th className="py-3 px-4">Experiment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredSamples.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <button
                        onClick={() => setViewingSample(s)}
                        className="font-semibold text-navy-900 hover:text-teal-600 text-left line-clamp-1"
                      >
                        {s.name}
                      </button>
                      <span className="text-[10px] text-teal-700 font-medium block">
                        {s.sampleType} • {s.biosafetyLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{s.storageLocation}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 pl-5">
                        {s.temperature}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span className="italic">{s.organism}</span>
                      <span className="block text-[10px] text-slate-400">{s.source}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-navy-900">{s.aliquots} vials</span>
                      <span className="block text-[10px] text-slate-500 font-mono">{s.volume}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                      <span className="text-teal-700 font-semibold">{s.associatedExperiment || '—'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={s.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSample(s)}
                          className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 rounded-md transition-colors"
                              title="Edit Sample"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingSampleId(s.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="Decommission Sample"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Sample Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingSample}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSample(null);
        }}
        title={editingSample ? `Edit Sample: ${editingSample.id}` : 'Register Biological Sample'}
        subtitle="Specify specimen identity, cryogenic coordinates, and biosafety parameters"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveSample} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sample Name & Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. CD34+ Peripheral Blood Stem Cells (Donor #902)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sample Type</label>
              <input
                type="text"
                required
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                placeholder="e.g. Primary Cells, Genomic DNA, Tissue Core"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Host Organism / Species</label>
              <input
                type="text"
                value={formData.organism}
                onChange={(e) => setFormData({ ...formData, organism: e.target.value })}
                placeholder="e.g. Homo sapiens, Mus musculus, S. cerevisiae"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storage Location (Freezer / Shelf / Box / Slot) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                placeholder="e.g. -80°C Alpha, Shelf 2, Box 14, Slot D3"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Temperature</label>
              <select
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="-196°C">-196°C (Liquid Nitrogen Vapor)</option>
                <option value="-80°C">-80°C (Ultra-Low Freezer)</option>
                <option value="-20°C">-20°C (Standard Freezer)</option>
                <option value="4°C">4°C (Cold Room / Refrigerator)</option>
                <option value="Room Temp">Room Temperature (20-25°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Concentration / Purity</label>
              <input
                type="text"
                value={formData.concentration}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                placeholder="e.g. 1.2 x 10^7 cells/mL or 84.6 ng/uL"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Volume / Aliquots</label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="e.g. 1.0 mL (4 vials)"
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
                <option value="Available">Available</option>
                <option value="In Assay">In Assay</option>
                <option value="Depleted">Depleted</option>
                <option value="Quarantined">Quarantined</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Experiment</label>
              <select
                value={formData.associatedExperiment}
                onChange={(e) => setFormData({ ...formData, associatedExperiment: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">None (Unassigned Inventory)</option>
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.id} - {exp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Biosafety Level</label>
              <select
                value={formData.biosafetyLevel}
                onChange={(e) => setFormData({ ...formData, biosafetyLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="BSL-1">BSL-1 (Non-pathogenic)</option>
                <option value="BSL-2">BSL-2 (Moderate hazard, primary human cells)</option>
                <option value="BSL-3">BSL-3 (High containment)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingSample(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              {editingSample ? 'Save Sample Details' : 'Register Sample'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Sample Details Modal */}
      {viewingSample && (
        <Modal
          isOpen={!!viewingSample}
          onClose={() => setViewingSample(null)}
          title={viewingSample.name}
          subtitle={`Specimen ID: ${viewingSample.id} • Registered ${formatDate(viewingSample.collectionDate)}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Sample Type
                </span>
                <span className="font-bold text-navy-900">{viewingSample.sampleType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Biosafety Containment
                </span>
                <span className="font-bold text-amber-700">{viewingSample.biosafetyLevel}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Storage Temperature
                </span>
                <span className="font-mono font-bold text-teal-700">{viewingSample.temperature}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Inventory Status
                </span>
                <StatusBadge status={viewingSample.status} size="xs" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Exact Cold Storage Coordinate
                </span>
                <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {viewingSample.storageLocation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Concentration / Purity
                  </span>
                  <p className="font-mono font-semibold text-navy-900">{viewingSample.concentration}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Volume & Aliquots
                  </span>
                  <p className="font-mono font-semibold text-navy-900">{viewingSample.volume} ({viewingSample.aliquots} vials)</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Associated Experiment & Biological Source
                </span>
                <p className="font-semibold text-navy-900">
                  {viewingSample.associatedExperiment || 'No linked experiment'}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Host: {viewingSample.organism} • Source: {viewingSample.source}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingSample(null)}
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
        isOpen={!!deletingSampleId}
        onClose={() => setDeletingSampleId(null)}
        onConfirm={handleDelete}
        title="Decommission Biological Sample"
        message="Are you sure you want to remove this sample from active inventory? Audit records will reflect decommissioned status."
      />
    </div>
  );
}
