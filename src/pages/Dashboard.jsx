import React from 'react';
import { useData } from '../context/DataContext';

// 6 Role-Specific Dashboard Views
import PIDashboardView from '../components/dashboard/PIDashboardView';
import ScientistDashboardView from '../components/dashboard/ScientistDashboardView';
import TechnicianDashboardView from '../components/dashboard/TechnicianDashboardView';
import BioinformaticsDashboardView from '../components/dashboard/BioinformaticsDashboardView';
import AuditorDashboardView from '../components/dashboard/AuditorDashboardView';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';

export default function Dashboard() {
  const {
    projects,
    experiments,
    samples,
    datasets,
    analyses,
    results,
    protocols,
    activities,
    deadlines,
    settings,
    backendOnline,
    currentUser
  } = useData();

  const activeRole = currentUser?.role || 'Principal Investigator';

  // 1. Principal Investigator View
  if (activeRole === 'Principal Investigator' || activeRole === 'PI') {
    return (
      <PIDashboardView
        projects={projects}
        experiments={experiments}
        results={results}
        protocols={protocols}
        deadlines={deadlines}
        currentUser={currentUser}
      />
    );
  }

  // 2. Research Scientist View
  if (['Research Scientist', 'Scientist', 'Researcher'].includes(activeRole)) {
    return (
      <ScientistDashboardView
        experiments={experiments}
        protocols={protocols}
        samples={samples}
        datasets={datasets}
        results={results}
        projects={projects}
        currentUser={currentUser}
      />
    );
  }

  // 3. Laboratory Technician View
  if (activeRole === 'Laboratory Technician' || activeRole === 'Technician') {
    return (
      <TechnicianDashboardView
        samples={samples}
        protocols={protocols}
        experiments={experiments}
        currentUser={currentUser}
      />
    );
  }

  // 4. Bioinformatics Analyst View
  if (activeRole === 'Bioinformatics Analyst' || activeRole === 'Bioinformatician') {
    return (
      <BioinformaticsDashboardView
        datasets={datasets}
        analyses={analyses}
        results={results}
        experiments={experiments}
        currentUser={currentUser}
      />
    );
  }

  // 5. Compliance Auditor View
  if (['Compliance Auditor', 'Auditor', 'Viewer'].includes(activeRole)) {
    return (
      <AuditorDashboardView
        activities={activities}
        datasets={datasets}
        results={results}
        protocols={protocols}
        currentUser={currentUser}
      />
    );
  }

  // 6. System Administrator View
  if (activeRole === 'System Administrator' || activeRole === 'Admin') {
    return (
      <AdminDashboardView
        settings={settings}
        backendOnline={backendOnline}
        currentUser={currentUser}
      />
    );
  }

  // Fallback default
  return (
    <PIDashboardView
      projects={projects}
      experiments={experiments}
      results={results}
      protocols={protocols}
      deadlines={deadlines}
      currentUser={currentUser}
    />
  );
}
