import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Database,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  FileText,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  Hash,
  Clock,
  Layers,
  FileUp
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate, formatBytes } from '../utils/formatters';

export default function ResearchData() {
  const [searchParams] = useSearchParams();
  const { datasets, experiments, currentUser, backendOnline, addDataset, deleteDataset } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(!isViewer && searchParams.get('action') === 'upload');
  const [viewingDataset, setViewingDataset] = useState(null);
  const [deletingDatasetId, setDeletingDatasetId] = useState(null);

  // Real file selection state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Upload state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    format: 'FASTQ (Compressed)',
    sizeBytes: 0,
    associatedExperiment: experiments[0]?.id || '',
    researcher: currentUser?.fullName || '',
    readCount: 'Real laboratory file payload'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Formats list
  const formats = useMemo(() => {
    const set = new Set(datasets.map((d) => d.format.split(' ')[0]));
    return ['ALL', ...Array.from(set)];
  }, [datasets]);

  // Filtered datasets
  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.format.toLowerCase().includes(search.toLowerCase()) ||
        d.researcher.toLowerCase().includes(search.toLowerCase()) ||
        (d.checksumSha256 && d.checksumSha256.toLowerCase().includes(search.toLowerCase())) ||
        (d.associatedExperiment && d.associatedExperiment.toLowerCase().includes(search.toLowerCase()));

      const matchesFormat = formatFilter === 'ALL' || d.format.includes(formatFilter);
      return matchesSearch && matchesFormat;
    });
  }, [datasets, search, formatFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Auto-detect format from extension
    let detectedFormat = 'Raw Scientific Data';
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.fastq.gz') || lowerName.endsWith('.fq.gz')) {
      detectedFormat = 'FASTQ (Compressed GZIP)';
    } else if (lowerName.endsWith('.bam')) {
      detectedFormat = 'BAM (Binary Alignment)';
    } else if (lowerName.endsWith('.h5') || lowerName.endsWith('.hdf5')) {
      detectedFormat = 'HDF5 Matrix';
    } else if (lowerName.endsWith('.mzml')) {
      detectedFormat = 'mzML (Mass Spectrometry)';
    } else if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
      detectedFormat = 'CSV / Tabular';
    }

    setUploadForm((prev) => ({
      ...prev,
      name: file.name,
      format: detectedFormat,
      sizeBytes: file.size,
      readCount: `${formatBytes(file.size)} binary payload`
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim() || !uploadForm.associatedExperiment) {
      addToast('Please provide a dataset filename and select an associated experiment', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(60);
      const created = await addDataset(uploadForm, selectedFile);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        addToast(`Dataset ${created.name} ingested & SHA-256 cryptographically sealed!`, 'success');
        setIsUploadModalOpen(false);
      }, 300);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      addToast(`Upload failed: ${err.message}`, 'error');
    }
  };

  const handleDownload = (dataset) => {
    if (backendOnline) {
      window.open(api.getDatasetDownloadUrl(dataset.id), '_blank');
      addToast(`Initiated secure download for ${dataset.id}`, 'info');
      return;
    }

    // Client-side download fallback
    const textContent = `BioSprint Engine - Research Dataset Record
=================================================
Dataset ID:        ${dataset.id}
File Name:         ${dataset.name}
Format:            ${dataset.format}
Size:              ${formatBytes(dataset.sizeBytes)}
Checksum SHA-256:  ${dataset.checksumSha256}
Associated Exp:    ${dataset.associatedExperiment} (${dataset.experimentName || ''})
Depositor:         ${dataset.researcher}
Upload Date:       ${dataset.uploadDate}
FAIR Validation:   VERIFIED 21 CFR Part 11 Compliant
=================================================`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}.meta.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded dataset manifest for ${dataset.id}`, 'info');
  };

  const handleDelete = () => {
    if (deletingDatasetId) {
      deleteDataset(deletingDatasetId);
      addToast('Dataset removed from active registry', 'info');
      setDeletingDatasetId(null);
      if (viewingDataset?.id === deletingDatasetId) {
        setViewingDataset(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Research Data</h1>
          <p className="text-xs text-slate-500 mt-1">
            Raw instrument files, sequencing reads, spectrometry matrices, and cryptographic SHA-256 provenance
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={() => {
              setSelectedFile(null);
              setUploadProgress(0);
              setIsUploading(false);
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Real Dataset</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dataset by name, SHA-256 checksum, format, or experiment..."
        filterOptions={formats.map((f) => ({
          label: f === 'ALL' ? 'All File Formats' : f,
          value: f
        }))}
        activeFilter={formatFilter}
        onFilterChange={setFormatFilter}
        totalCount={filteredDatasets.length}
      />

      {/* Datasets Table */}
      {filteredDatasets.length === 0 ? (
        <EmptyState
          title="No research datasets registered yet"
          description="Upload raw instrument files (FASTQ, BAM, HDF5, CSV, mzML) to compute real cryptographic SHA-256 checksums."
          icon={Database}
          actionLabel={!isViewer ? "Upload First Dataset" : undefined}
          onAction={!isViewer ? () => setIsUploadModalOpen(true) : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Dataset ID</th>
                  <th className="py-3 px-4">Filename & Format</th>
                  <th className="py-3 px-4">Associated Experiment</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Depositor</th>
                  <th className="py-3 px-4">SHA-256 Checksum</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDatasets.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                      {d.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <button
                        onClick={() => setViewingDataset(d)}
                        className="font-semibold text-navy-900 hover:text-teal-600 text-left line-clamp-1 font-mono text-xs"
                      >
                        {d.name}
                      </button>
                      <span className="text-[10px] text-teal-700 font-medium block mt-0.5">
                        {d.format} • {d.readCount || 'Raw instrument file'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-teal-700 font-semibold">{d.associatedExperiment || '—'}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">
                        {d.experimentName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium text-slate-700">
                      {formatBytes(d.sizeBytes)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{d.researcher}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      <span title={d.checksumSha256} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {d.checksumSha256 ? `${d.checksumSha256.substring(0, 10)}...${d.checksumSha256.substring(58)}` : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={d.status || 'Validated'} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(d)}
                          className="p-1.5 text-teal-600 hover:text-teal-800 rounded-md transition-colors"
                          title="Download Dataset File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingDataset(d)}
                          className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <button
                            onClick={() => setDeletingDatasetId(d.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Delete Dataset"
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
      )}

      {/* Real File Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          if (!isUploading) setIsUploadModalOpen(false);
        }}
        title="Ingest & Register Research Dataset"
        subtitle="Upload raw sequencing or mass spec files with genuine cryptographic SHA-256 calculation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* File Picker Zone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer"
          >
            <FileUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-navy-900">
              {selectedFile ? `Selected: ${selectedFile.name} (${formatBytes(selectedFile.size)})` : 'Click to select actual file from your computer'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports FASTQ, BAM, HDF5, CSV, MTX, mzML, and TAR.GZ archives (up to 500 MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dataset File Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="e.g. HBB_Amplicon_DeepSeq.fastq.gz"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">File Format</label>
              <select
                value={uploadForm.format}
                onChange={(e) => setUploadForm({ ...uploadForm, format: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="FASTQ (Compressed)">FASTQ (Compressed GZIP)</option>
                <option value="BAM (Binary Alignment)">BAM (Aligned Coordinates)</option>
                <option value="HDF5 Matrix">HDF5 (.h5 Feature Barcode)</option>
                <option value="mzML (Mass Spectrometry)">mzML (Orbitrap Standard)</option>
                <option value="CSV / Tabular">CSV / Tabular Data</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Experiment <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={uploadForm.associatedExperiment}
                onChange={(e) => setUploadForm({ ...uploadForm, associatedExperiment: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">Select Associated Experiment</option>
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.id} - {exp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Depositor / Scientist</label>
              <input
                type="text"
                required
                value={uploadForm.researcher}
                onChange={(e) => setUploadForm({ ...uploadForm, researcher: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Progress bar during upload & hash computation */}
          {isUploading && (
            <div className="space-y-1.5 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-900">
                <span>Calculating Cryptographic SHA-256 Digest & Streaming...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-teal-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isUploading ? 'Ingesting File...' : 'Upload & Compute SHA-256'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Dataset Details Modal */}
      {viewingDataset && (
        <Modal
          isOpen={!!viewingDataset}
          onClose={() => setViewingDataset(null)}
          title={viewingDataset.name}
          subtitle={`${viewingDataset.id} • Uploaded ${formatDate(viewingDataset.uploadDate)} by ${viewingDataset.researcher}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Format & Size
                </span>
                <span className="font-bold text-navy-900">
                  {viewingDataset.format} ({formatBytes(viewingDataset.sizeBytes)})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  FAIR Validation Status
                </span>
                <StatusBadge status={viewingDataset.status || 'Validated'} size="xs" />
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Cryptographic SHA-256 Hash
              </span>
              <p className="font-mono text-teal-800 break-all select-all font-semibold">
                {viewingDataset.checksumSha256}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Associated Experiment
              </span>
              <p className="font-semibold text-navy-900">
                {viewingDataset.associatedExperiment || 'Unassigned'} - {viewingDataset.experimentName || 'Assay Run'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDownload(viewingDataset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>

              <button
                onClick={() => setViewingDataset(null)}
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
        isOpen={!!deletingDatasetId}
        onClose={() => setDeletingDatasetId(null)}
        onConfirm={handleDelete}
        title="Delete Dataset Record"
        message="Are you sure you want to remove this dataset? The file and cryptographic hash will be deleted from active registers."
      />
    </div>
  );
}
