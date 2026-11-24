import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FlaskConical,
  FileCode2,
  TestTube2,
  Database,
  LineChart,
  GitFork,
  FileSpreadsheet,
  Settings,
  Dna,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
  LogOut
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Sidebar({ isOpen, onClose }) {
  const { projects, experiments, samples, datasets, currentUser } = useData();

  const currentRole = currentUser?.role || 'Principal Investigator';

  // Master navigation catalog (10 Core Modules)
  const allNavItems = useMemo(() => [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Overview'
    },
    {
      name: 'Research Projects',
      path: '/projects',
      icon: FolderGit2,
      count: projects.length
    },
    {
      name: 'Experiments',
      path: '/experiments',
      icon: FlaskConical,
      count: experiments.length
    },
    {
      name: 'Protocols',
      path: '/protocols',
      icon: FileCode2
    },
    {
      name: 'Samples',
      path: '/samples',
      icon: TestTube2,
      count: samples.length
    },
    {
      name: 'Research Data',
      path: '/data',
      icon: Database,
      count: datasets.length
    },
    {
      name: 'Analysis & Results',
      path: '/analysis',
      icon: LineChart
    },
    {
      name: 'Data Provenance',
      path: '/provenance',
      icon: GitFork,
      highlight: 'FAIR'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileSpreadsheet
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ], [projects.length, experiments.length, samples.length, datasets.length]);

  const filteredNavItems = allNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-[#0B132B]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">BioSprint</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Orchestration & Provenance</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {currentRole === 'Compliance Auditor' ? 'Audit Operations' :
               currentRole === 'Laboratory Technician' ? 'Specimen Operations' :
               currentRole === 'Bioinformatics Analyst' ? 'Computational Pipelines' :
               'Laboratory Modules'}
            </span>
            <span className="text-[9px] font-semibold bg-slate-800 text-teal-400 px-1.5 py-0.5 rounded">
              {filteredNavItems.length} active
            </span>
          </div>

          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.highlight && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 border border-teal-400/40 animate-pulse">
                        {item.highlight}
                      </span>
                    )}
                    {item.count !== undefined && !item.highlight && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          isActive
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Provenance Compliance Badge */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>21 CFR Part 11 Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Automated cryptographic hashing and FAIR audit logging enabled.
          </p>
        </div>

        {/* User Profile Mini Footer with Live Role Badge */}
        <div className="p-3 border-t border-slate-800 bg-[#0B132B]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-teal-200 font-semibold text-xs flex items-center justify-center border border-teal-600/40">
              {currentUser?.initials || (currentUser?.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BS')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {currentUser?.fullName || currentUser?.email || 'User'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-teal-300 font-semibold truncate">{currentRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
