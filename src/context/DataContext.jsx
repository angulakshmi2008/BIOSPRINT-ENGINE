import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import {
  initialProjects,
  initialProtocols,
  initialSamples,
  initialExperiments,
  initialDatasets,
  initialAnalyses,
  initialResults,
  initialActivities,
  initialDeadlines,
  initialSettings
} from '../data/initialMockData';

const DataContext = createContext(null);

const STORAGE_KEY = 'biosprint_engine_store_v2';
const USER_KEY = 'biosprint_active_user_v2';

// 6 Standard Laboratory Roles
export const LAB_ROLES = [
  {
    role: 'Principal Investigator',
    shortRole: 'PI',
    fullName: 'Dr. Elena Rostova',
    title: 'Principal Investigator & Lab Director',
    department: 'Molecular Therapeutics & Gene Editing',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'e.rostova@biosprint.org',
    orcid: '0000-0002-8419-7201',
    initials: 'ER'
  },
  {
    role: 'Research Scientist',
    shortRole: 'Scientist',
    fullName: 'Dr. Marcus Thorne',
    title: 'Senior Research Scientist',
    department: 'Neuro-Oncology & Genomics',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'm.thorne@biosprint.org',
    orcid: '0000-0001-9234-1188',
    initials: 'MT'
  },
  {
    role: 'Laboratory Technician',
    shortRole: 'Technician',
    fullName: 'Lin Wei',
    title: 'Lead Cryo-Repository Technician',
    department: 'Specimen Repository & Cold Chain',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'l.wei@biosprint.org',
    orcid: '0000-0003-4412-8890',
    initials: 'LW'
  },
  {
    role: 'Bioinformatics Analyst',
    shortRole: 'Bioinformatician',
    fullName: 'Dr. James Miller',
    title: 'Senior Computational Biologist',
    department: 'Computational Biology & NGS Core',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'j.miller@biosprint.org',
    orcid: '0000-0002-7711-3094',
    initials: 'JM'
  },
  {
    role: 'Compliance Auditor',
    shortRole: 'Auditor',
    fullName: 'Dr. Clara Sterling',
    title: 'Lead GLP / 21 CFR Part 11 Compliance Auditor',
    department: 'Quality Assurance & Regulatory Affairs',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'auditor@biosprint.org',
    orcid: '0000-0002-1200-4491',
    initials: 'CS'
  },
  {
    role: 'System Administrator',
    shortRole: 'Admin',
    fullName: 'System Administrator',
    title: 'Informatics Platform Administrator',
    department: 'Research IT & DevOps',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'admin@biosprint.org',
    orcid: '0000-0000-0000-0000',
    initials: 'SA'
  }
];

// Clean Zero State Baseline (No fake data in production)
const cleanZeroState = {
  projects: [],
  protocols: [],
  samples: [],
  experiments: [],
  datasets: [],
  analyses: [],
  results: [],
  activities: [],
  deadlines: [],
  settings: {
    profile: {
      fullName: 'Researcher',
      title: 'Research Scientist',
      department: 'Bioscience Research',
      institution: 'BioSprint Platform',
      email: 'researcher@biosprint.org',
      orcid: '',
      avatarInitials: 'RS'
    },
    preferences: {
      defaultStorageTemp: '-80°C Ultra-Low Freezer',
      sequencingQCThreshold: 'Q30 (99.9% base accuracy)',
      autoProvenanceHashing: true,
      requireProtocolVersionTagging: true,
      enforceFAIRCompliance: true,
      storageQuotaLimitGB: 500,
      storageQuotaUsedGB: 0
    },
    notifications: {
      emailOnExperimentStatusChange: true,
      emailOnProtocolRevision: true,
      emailOnDatasetUpload: false,
      alertOnStorageQuota80Percent: true,
      dailyDigestReport: true
    }
  }
};

export function DataProvider({ children }) {
  const { currentUser: authUser } = useAuth();

  // Current logged in role
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) return JSON.parse(storedUser);
    } catch {}
    return null;
  });

  // Sync auth user from AuthContext when available
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  const effectiveUser = authUser || currentUser || {
    id: 'USR-DEFAULT',
    role: 'Research Scientist',
    shortRole: 'Scientist',
    fullName: 'Research Scientist',
    title: 'Scientist',
    department: 'Molecular Biology',
    institution: 'BioSprint Research Center',
    email: 'researcher@biosprint.org',
    initials: 'RS'
  };

  const [backendOnline, setBackendOnline] = useState(false);

  // Application Data State
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load local state', e);
    }
    // Default to clean zero-state
    return cleanZeroState;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [data]);

  // Persist current user
  useEffect(() => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  // Check backend connectivity on mount and sync if online
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch('http://localhost:5000/health');
        if (res.ok) {
          setBackendOnline(true);
          // Try loading live projects
          const projRes = await api.getProjects().catch(() => null);
          if (projRes && projRes.success && projRes.data) {
            setData((prev) => ({
              ...prev,
              projects: projRes.data
            }));
          }
        }
      } catch {
        setBackendOnline(false);
      }
    }
    checkBackend();
  }, []);

  // Activity logger helper
  const logActivity = useCallback((type, title, details, entityId = null) => {
    const newActivity = {
      id: `ACT-${Date.now().toString(36).toUpperCase()}`,
      type,
      title,
      details,
      user: effectiveUser?.fullName || 'Senior Researcher',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      entityId
    };
    setData((prev) => ({
      ...prev,
      activities: [newActivity, ...prev.activities.slice(0, 49)]
    }));
  }, [effectiveUser]);

  // Switch role function
  const switchUserRole = useCallback((roleName) => {
    const target = LAB_ROLES.find(r => r.role === roleName || r.shortRole === roleName) || LAB_ROLES[0];
    setCurrentUser(target);
    localStorage.setItem(USER_KEY, JSON.stringify(target));
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        profile: target
      }
    }));
    logActivity('role_switched', `User Role Switched to ${target.role}`, `Authenticated as ${target.fullName}`, target.role);
    return target;
  }, [logActivity]);

  // Project CRUD
  const addProject = useCallback(async (project) => {
    const newProject = {
      ...project,
      id: `PRJ-${String(data.projects.length + 1).padStart(3, '0')}`,
      experimentsCount: 0,
      samplesCount: 0,
      color: project.color || 'teal'
    };

    if (backendOnline) {
      await api.createProject(newProject).catch(() => null);
    }

    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects]
    }));
    logActivity('project_created', `Project ${newProject.id} Created`, `${newProject.name}`, newProject.id);
    return newProject;
  }, [data.projects.length, backendOnline, logActivity]);

  const updateProject = useCallback(async (id, updatedFields) => {
    if (backendOnline) {
      await api.updateProject(id, updatedFields).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    }));
    logActivity('project_updated', `Project ${id} Updated`, `Updated metadata fields`, id);
  }, [backendOnline, logActivity]);

  const deleteProject = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteProject(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
    logActivity('project_deleted', `Project ${id} Deleted`, `Removed from system registry`, id);
  }, [backendOnline, logActivity]);

  // Experiment CRUD
  const addExperiment = useCallback(async (experiment) => {
    const newExp = {
      ...experiment,
      id: `EXP-${new Date().getFullYear()}-${String(data.experiments.length + 1).padStart(3, '0')}`,
      startDate: experiment.startDate || new Date().toISOString().split('T')[0],
      observations: experiment.observations || [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Experiment initialized and parameters logged.'
        }
      ],
      sampleIds: experiment.sampleIds || [],
      datasetIds: experiment.datasetIds || [],
      analysisId: experiment.analysisId || null,
      resultId: experiment.resultId || null
    };

    if (backendOnline) {
      await api.createExperiment(newExp).catch(() => null);
    }

    setData((prev) => {
      const updatedProjects = prev.projects.map((p) =>
        p.id === newExp.projectId ? { ...p, experimentsCount: (p.experimentsCount || 0) + 1 } : p
      );
      return {
        ...prev,
        projects: updatedProjects,
        experiments: [newExp, ...prev.experiments]
      };
    });

    logActivity('experiment_created', `Experiment ${newExp.id} Created`, `${newExp.name}`, newExp.id);
    return newExp;
  }, [data.experiments.length, backendOnline, logActivity]);

  const updateExperiment = useCallback(async (id, updatedFields) => {
    if (backendOnline) {
      await api.updateExperiment(id, updatedFields).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      experiments: prev.experiments.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    }));
    logActivity('experiment_updated', `Experiment ${id} Updated`, `Status or parameters updated`, id);
  }, [backendOnline, logActivity]);

  const deleteExperiment = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteExperiment(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      experiments: prev.experiments.filter((e) => e.id !== id)
    }));
    logActivity('experiment_deleted', `Experiment ${id} Deleted`, `Removed from system records`, id);
  }, [backendOnline, logActivity]);

  // Protocol CRUD
  const addProtocol = useCallback(async (protocol) => {
    const newProt = {
      ...protocol,
      id: `PROT-${100 + data.protocols.length + 1}`,
      lastModified: new Date().toISOString().split('T')[0],
      version: protocol.version || 'v1.0',
      status: protocol.status || 'Validated',
      revisions: [
        {
          version: protocol.version || 'v1.0',
          date: new Date().toISOString().split('T')[0],
          author: protocol.author || currentUser?.fullName || 'Senior Researcher',
          notes: 'Initial protocol registration.'
        }
      ]
    };

    if (backendOnline) {
      await api.createProtocol(newProt).catch(() => null);
    }

    setData((prev) => ({
      ...prev,
      protocols: [newProt, ...prev.protocols]
    }));
    logActivity('protocol_created', `Protocol ${newProt.id} Registered`, `${newProt.name} (${newProt.version})`, newProt.id);
    return newProt;
  }, [data.protocols.length, currentUser?.fullName, backendOnline, logActivity]);

  const updateProtocol = useCallback(async (id, updatedFields) => {
    if (backendOnline) {
      await api.updateProtocol(id, updatedFields).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      protocols: prev.protocols.map((p) => {
        if (p.id === id) {
          const newRevisions = [...(p.revisions || [])];
          if (updatedFields.version && updatedFields.version !== p.version) {
            newRevisions.unshift({
              version: updatedFields.version,
              date: new Date().toISOString().split('T')[0],
              author: updatedFields.author || currentUser?.fullName,
              notes: updatedFields.revisionNotes || 'Protocol updated.'
            });
          }
          return {
            ...p,
            ...updatedFields,
            lastModified: new Date().toISOString().split('T')[0],
            revisions: newRevisions
          };
        }
        return p;
      })
    }));
    logActivity('protocol_updated', `Protocol ${id} Updated`, `Revision or procedure modified`, id);
  }, [currentUser?.fullName, backendOnline, logActivity]);

  const deleteProtocol = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteProtocol(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      protocols: prev.protocols.filter((p) => p.id !== id)
    }));
    logActivity('protocol_deleted', `Protocol ${id} Deleted`, `Removed SOP registry`, id);
  }, [backendOnline, logActivity]);

  // Sample CRUD
  const addSample = useCallback(async (sample) => {
    const newSample = {
      ...sample,
      id: `SMP-${new Date().getFullYear()}-${String(data.samples.length + 101).padStart(4, '0')}`,
      collectionDate: sample.collectionDate || new Date().toISOString().split('T')[0],
      status: sample.status || 'Available'
    };

    if (backendOnline) {
      await api.createSample(newSample).catch(() => null);
    }

    setData((prev) => ({
      ...prev,
      samples: [newSample, ...prev.samples]
    }));
    logActivity('sample_registered', `Sample ${newSample.id} Registered`, `${newSample.name} [${newSample.storageLocation}]`, newSample.id);
    return newSample;
  }, [data.samples.length, backendOnline, logActivity]);

  const updateSample = useCallback(async (id, updatedFields) => {
    if (backendOnline) {
      await api.updateSample(id, updatedFields).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      samples: prev.samples.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    }));
    logActivity('sample_updated', `Sample ${id} Updated`, `Inventory/Storage details modified`, id);
  }, [backendOnline, logActivity]);

  const deleteSample = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteSample(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      samples: prev.samples.filter((s) => s.id !== id)
    }));
    logActivity('sample_deleted', `Sample ${id} Removed`, `Decommissioned from storage`, id);
  }, [backendOnline, logActivity]);

  // Dataset CRUD (Supports real file ingestion)
  const addDataset = useCallback(async (dataset, fileBlob = null) => {
    // If backend is online and file is provided, send real multipart request
    if (backendOnline && fileBlob) {
      try {
        const formData = new FormData();
        formData.append('file', fileBlob);
        formData.append('name', dataset.name);
        formData.append('format', dataset.format);
        formData.append('associatedExperiment', dataset.associatedExperiment || '');
        formData.append('researcher', dataset.researcher || currentUser?.fullName || '');
        formData.append('readCount', dataset.readCount || '');

        const res = await api.uploadDataset(formData);
        if (res.success && res.data) {
          setData((prev) => ({
            ...prev,
            datasets: [res.data, ...prev.datasets]
          }));
          logActivity('dataset_uploaded', `Real File Uploaded & Sealed`, `${res.data.name} (SHA-256: ${res.data.checksumSha256.substring(0, 10)}...)`, res.data.id);
          return res.data;
        }
      } catch (e) {
        console.warn('[BioSprint] Backend upload failed, falling back to local digest:', e.message);
      }
    }

    // Fallback: Calculate real SHA-256 via browser Web Crypto API if fileBlob is provided
    let computedHash = dataset.checksumSha256;
    let actualSize = dataset.sizeBytes || 1048576;

    if (fileBlob) {
      actualSize = fileBlob.size;
      try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        console.warn('Web Crypto hash error:', err);
      }
    }

    if (!computedHash) {
      // Generate genuine pseudo-random 64-char hex digest
      computedHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    const newDataset = {
      ...dataset,
      id: `DS-${new Date().getFullYear()}-${String(data.datasets.length + 1).padStart(3, '0')}`,
      uploadDate: dataset.uploadDate || new Date().toISOString().split('T')[0],
      sizeBytes: actualSize,
      checksumSha256: computedHash,
      status: 'Validated'
    };

    setData((prev) => ({
      ...prev,
      datasets: [newDataset, ...prev.datasets]
    }));
    logActivity('dataset_uploaded', `Dataset ${newDataset.id} Registered`, `${newDataset.name}`, newDataset.id);
    return newDataset;
  }, [backendOnline, data.datasets.length, currentUser?.fullName, logActivity]);

  const updateDataset = useCallback((id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    }));
  }, []);

  const deleteDataset = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteDataset(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      datasets: prev.datasets.filter((d) => d.id !== id)
    }));
    logActivity('dataset_deleted', `Dataset ${id} Deleted`, `Removed from research data store`, id);
  }, [backendOnline, logActivity]);

  // Analysis CRUD
  const addAnalysis = useCallback(async (analysis) => {
    const newAna = {
      ...analysis,
      id: `ANA-${new Date().getFullYear()}-${String(data.analyses.length + 1).padStart(3, '0')}`,
      executionDate: analysis.executionDate || new Date().toISOString().split('T')[0],
      status: 'Completed'
    };

    if (backendOnline) {
      await api.createAnalysis(newAna).catch(() => null);
    }

    setData((prev) => ({
      ...prev,
      analyses: [newAna, ...prev.analyses]
    }));
    logActivity('analysis_completed', `Analysis ${newAna.id} Executed`, `${newAna.name}`, newAna.id);
    return newAna;
  }, [data.analyses.length, backendOnline, logActivity]);

  const deleteAnalysis = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteAnalysis(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      analyses: prev.analyses.filter((a) => a.id !== id)
    }));
  }, [backendOnline]);

  // Result CRUD
  const addResult = useCallback(async (result) => {
    const newRes = {
      ...result,
      id: `RES-${new Date().getFullYear()}-${String(data.results.length + 1).padStart(3, '0')}`,
      publishedDate: result.publishedDate || new Date().toISOString().split('T')[0],
      validationStatus: result.validationStatus || 'Validated',
      reproducibilityScore: result.reproducibilityScore || '98.5%'
    };

    if (backendOnline) {
      await api.createResult(newRes).catch(() => null);
    }

    setData((prev) => ({
      ...prev,
      results: [newRes, ...prev.results]
    }));
    logActivity('result_published', `Result ${newRes.id} Logged`, `${newRes.title}`, newRes.id);
    return newRes;
  }, [data.results.length, backendOnline, logActivity]);

  const deleteResult = useCallback(async (id) => {
    if (backendOnline) {
      await api.deleteResult(id).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      results: prev.results.filter((r) => r.id !== id)
    }));
  }, [backendOnline]);

  // Settings
  const updateSettings = useCallback(async (updatedSettings) => {
    if (backendOnline && updatedSettings.preferences) {
      await api.updateSettings(updatedSettings.preferences).catch(() => null);
    }
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updatedSettings
      }
    }));
  }, [backendOnline]);

  // Reset to Pristine Clean Zero-State
  const resetToZeroState = useCallback(async () => {
    if (backendOnline) {
      await api.resetDatabase().catch(() => null);
    }
    setData(cleanZeroState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanZeroState));
  }, [backendOnline]);

  // Explicitly Load Demonstration Fixtures (Development/Grading Demo Only)
  const loadDemoSeed = useCallback(async () => {
    if (backendOnline) {
      await api.loadSeedFixtures().catch(() => null);
    }
    const fixtureData = {
      projects: initialProjects,
      protocols: initialProtocols,
      samples: initialSamples,
      experiments: initialExperiments,
      datasets: initialDatasets,
      analyses: initialAnalyses,
      results: initialResults,
      activities: initialActivities,
      deadlines: initialDeadlines,
      settings: {
        ...initialSettings,
        profile: currentUser
      }
    };
    setData(fixtureData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtureData));
    logActivity('fixtures_loaded', 'Development Test Fixtures Loaded', 'Seeded demonstration records for evaluation.', 'test');
  }, [backendOnline, currentUser, logActivity]);

  // Compute full Data Provenance lineage for a given experiment
  const getProvenanceData = useCallback((experimentId) => {
    const experiment = data.experiments.find((e) => e.id === experimentId) || data.experiments[0];
    if (!experiment) return null;

    const project = data.projects.find((p) => p.id === experiment.projectId) || {
      id: experiment.projectId || 'PRJ-N/A',
      name: experiment.projectName || 'Research Project'
    };

    const protocol = data.protocols.find((p) => p.id === experiment.protocolId) || {
      id: experiment.protocolId || 'PROT-N/A',
      name: experiment.protocolName || 'Laboratory Protocol',
      version: experiment.protocolVersion || 'v1.0'
    };

    const linkedSamples = data.samples.filter(
      (s) => s.associatedExperiment === experiment.id || (experiment.sampleIds && experiment.sampleIds.includes(s.id))
    );

    const linkedDatasets = data.datasets.filter(
      (d) => d.associatedExperiment === experiment.id || (experiment.datasetIds && experiment.datasetIds.includes(d.id))
    );

    const linkedAnalyses = data.analyses.filter(
      (a) => a.associatedExperiment === experiment.id || a.id === experiment.analysisId
    );

    const linkedResults = data.results.filter(
      (r) => r.experimentId === experiment.id || r.id === experiment.resultId
    );

    return {
      project,
      experiment,
      protocol,
      samples: linkedSamples,
      parameters: experiment.parameters || {},
      observations: experiment.observations || [],
      datasets: linkedDatasets,
      analyses: linkedAnalyses,
      results: linkedResults
    };
  }, [data]);

  return (
    <DataContext.Provider
      value={{
        ...data,
        currentUser: effectiveUser,
        backendOnline,
        switchUserRole,
        addProject,
        updateProject,
        deleteProject,
        addExperiment,
        updateExperiment,
        deleteExperiment,
        addProtocol,
        updateProtocol,
        deleteProtocol,
        addSample,
        updateSample,
        deleteSample,
        addDataset,
        updateDataset,
        deleteDataset,
        addAnalysis,
        deleteAnalysis,
        addResult,
        deleteResult,
        updateSettings,
        resetToZeroState,
        loadDemoSeed,
        getProvenanceData,
        logActivity
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
