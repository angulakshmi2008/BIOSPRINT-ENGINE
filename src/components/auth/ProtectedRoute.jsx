import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Dna } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, currentUser, loadingSession } = useAuth();
  const location = useLocation();

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2.5 text-navy-900 font-bold text-lg mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Dna className="w-4 h-4 animate-spin" />
          </div>
          <span>BioSprint Engine</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span>Verifying credentials and laboratory permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check if requiredRoles is provided
  if (requiredRoles.length > 0 && currentUser) {
    const userRole = currentUser.role || '';
    const isAdmin = userRole === 'System Administrator' || userRole === 'Admin';
    const isResearcher = [
      'Principal Investigator',
      'Research Scientist',
      'Bioinformatics Analyst',
      'Laboratory Technician',
      'Researcher'
    ].includes(userRole);
    const isViewer = [
      'Compliance Auditor',
      'Viewer',
      'Auditor'
    ].includes(userRole);

    let hasPermission = false;
    if (isAdmin) {
      hasPermission = true;
    } else if (requiredRoles.includes('Admin') && isAdmin) {
      hasPermission = true;
    } else if (requiredRoles.includes('Researcher') && isResearcher) {
      hasPermission = true;
    } else if (requiredRoles.includes('Viewer') && (isViewer || isResearcher)) {
      hasPermission = true;
    } else if (requiredRoles.includes(userRole)) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
            Your authenticated role (<strong>{userRole}</strong>) lacks sufficient laboratory permissions to access this view.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition shadow-xs"
          >
            Return to Dashboard
          </a>
        </div>
      );
    }
  }

  return children;
}
