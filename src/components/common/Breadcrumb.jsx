import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames = {
  dashboard: 'Dashboard',
  projects: 'Research Projects',
  experiments: 'Experiments',
  protocols: 'Protocols',
  samples: 'Samples',
  data: 'Research Data',
  analysis: 'Analysis & Results',
  provenance: 'Data Provenance',
  reports: 'Reports & Audits',
  settings: 'Settings'
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-navy-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">BioSprint</span>
      </Link>
      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="text-navy-900 font-semibold">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-navy-900 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
