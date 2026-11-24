import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Building,
  DollarSign,
  FlaskConical,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects, experiments, addProject, updateProject, deleteProject, currentUser } = useData();
  const { addToast } = useToast();

  const isViewer = ['Compliance Auditor', 'Viewer', 'Auditor'].includes(currentUser?.role);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(!isViewer && searchParams.get('action') === 'new');
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // Form state
  const initialForm = {
    name: '',
    code: '',
    description: '',
    leadResearcher: '',
    department: 'Molecular Therapeutics & Gene Editing',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    status: 'Active',
    budget: '$250,000'
  };
  const [formData, setFormData] = useState(initialForm);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.leadResearcher.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      code: project.code,
      description: project.description,
      leadResearcher: project.leadResearcher,
      department: project.department,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      status: project.status,
      budget: project.budget || ''
    });
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.leadResearcher.trim()) {
      addToast('Project title and lead researcher are required', 'error');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, formData);
      addToast(`Project ${editingProject.id} updated successfully`, 'success');
      setEditingProject(null);
    } else {
      const created = addProject(formData);
      addToast(`Project ${created.id} created successfully`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (deletingProjectId) {
      deleteProject(deletingProjectId);
      addToast('Project removed successfully', 'info');
      setDeletingProjectId(null);
      if (viewingProject?.id === deletingProjectId) {
        setViewingProject(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Research Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage laboratory initiatives, associated experiments, and team allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'grid' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'table' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table
            </button>
          </div>

          {!isViewer && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter projects by title, code, or investigator..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
          { label: 'On Hold', value: 'On Hold' }
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        totalCount={filteredProjects.length}
      />

      {/* Grid View */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No research projects found"
          description="Try adjusting your search criteria or register a new research project."
          icon={FolderGit2}
          actionLabel={!isViewer ? "Create Project" : undefined}
          onAction={!isViewer ? handleOpenAdd : undefined}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectExperiments = experiments.filter((e) => e.projectId === project.id);
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {project.id} • {project.code}
                    </span>
                    <StatusBadge status={project.status} size="xs" />
                  </div>

                  <h3
                    onClick={() => setViewingProject(project)}
                    className="text-sm font-bold text-navy-900 group-hover:text-teal-700 cursor-pointer transition-colors line-clamp-2"
                  >
                    {project.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-800">{project.leadResearcher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{project.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(project.startDate)} &rarr; {formatDate(project.targetEndDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                    <span>{projectExperiments.length} Experiments</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingProject(project)}
                      className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {!isViewer && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200/60 rounded-md transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProjectId(project.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded-md transition-colors"
                          title="Delete Project"
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
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code / ID</th>
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Lead Researcher</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Experiments</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProjects.map((p) => {
                  const pExp = experiments.filter((e) => e.projectId === p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                        {p.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-900 max-w-xs">
                        <button
                          onClick={() => setViewingProject(p)}
                          className="hover:text-teal-600 text-left line-clamp-1"
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{p.leadResearcher}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">{p.department}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">{formatDate(p.targetEndDate)}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-navy-900">{pExp.length} runs</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={p.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProject(p)}
                            className="p-1.5 text-slate-500 hover:text-navy-900 rounded-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {!isViewer && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 rounded-md"
                                title="Edit Project"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingProjectId(p.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProject}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? `Edit Project: ${editingProject.id}` : 'Create Research Project'}
        subtitle="Define project metadata, lead investigator, and objective milestones"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CRISPR-HSC"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scientific Objective & Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the biological hypothesis, methodology, and primary translational endpoint..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Principal Investigator <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.leadResearcher}
                onChange={(e) => setFormData({ ...formData, leadResearcher: e.target.value })}
                placeholder="e.g. Principal Investigator Name"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target End Date</label>
              <input
                type="date"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProject(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Details Modal */}
      {viewingProject && (
        <Modal
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          title={viewingProject.name}
          subtitle={`${viewingProject.id} • ${viewingProject.code} • ${viewingProject.department}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Lead Investigator
                </span>
                <span className="text-sm font-bold text-navy-900">{viewingProject.leadResearcher}</span>
              </div>
              <StatusBadge status={viewingProject.status} />
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Project Scope & Scientific Goals
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {viewingProject.description}
              </p>
            </div>

            {/* Linked Experiments in this Project */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Associated Experiments ({experiments.filter((e) => e.projectId === viewingProject.id).length})
                </h4>
                <button
                  onClick={() => {
                    setViewingProject(null);
                    navigate(`/experiments?action=new&projectId=${viewingProject.id}`);
                  }}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  + Add Experiment
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {experiments
                  .filter((e) => e.projectId === viewingProject.id)
                  .map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => {
                        setViewingProject(null);
                        navigate('/experiments');
                      }}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-navy-900">{exp.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {exp.id} • Protocol: {exp.protocolName} ({exp.protocolVersion})
                        </div>
                      </div>
                      <StatusBadge status={exp.status} size="xs" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setViewingProject(null);
                  navigate('/provenance');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100"
              >
                <span>View Provenance Lineage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewingProject(null)}
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
        isOpen={!!deletingProjectId}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDelete}
        title="Delete Research Project"
        message="Are you sure you want to delete this research project? All linked experiments and sample records will remain accessible in the audit store."
      />
    </div>
  );
}
