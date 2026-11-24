import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Plus,
  FlaskConical,
  TestTube2,
  Database,
  FileCode2,
  FolderGit2,
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  X,
  ShieldCheck,
  ChevronDown,
  Server,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { activities, currentUser, backendOnline } = useData();
  const { lockSession, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const quickAddRef = useRef(null);
  const roleRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setShowQuickAdd(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/experiments?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Right: Search, Quick Add, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Online Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{backendOnline ? 'API Connected' : 'Local Sandbox Engine'}</span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="relative hidden md:block w-52 lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search experiments, samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Record</span>
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Create Laboratory Entity
              </div>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/experiments?action=new'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors"
              >
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>New Experiment</span>
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/samples?action=new'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors"
              >
                <TestTube2 className="w-4 h-4 text-teal-600" />
                <span>Register Sample</span>
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/data?action=upload'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors"
              >
                <Database className="w-4 h-4 text-teal-600" />
                <span>Upload Dataset</span>
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/protocols?action=new'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors"
              >
                <FileCode2 className="w-4 h-4 text-teal-600" />
                <span>New SOP Protocol</span>
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/projects?action=new'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors border-t border-slate-100"
              >
                <FolderGit2 className="w-4 h-4 text-slate-500" />
                <span>New Research Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="System Notifications & Audit"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-navy-900">Laboratory Audit Stream</h4>
                  <p className="text-[10px] text-slate-500">Live operational events & status updates</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {activities.length} Events
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No recent audit activity recorded yet.
                  </div>
                ) : (
                  activities.slice(0, 6).map((act) => (
                    <div key={act.id} className="p-3 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-navy-900 leading-tight">
                            {act.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {act.timestamp ? act.timestamp.split(' ')[1] || act.timestamp : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-normal pl-5">
                        {act.details}
                      </p>
                      <div className="mt-1 pl-5 text-[10px] text-slate-400 font-medium">
                        by {act.user}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/reports');
                  }}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Complete Audit Trail &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Profile Menu */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-lg transition-all"
            title="User Profile & Security"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 text-teal-300 font-semibold text-xs flex items-center justify-center border border-navy-700 shadow-xs">
              {currentUser?.initials || (currentUser?.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BS')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-navy-900 leading-tight truncate max-w-[120px]">
                {currentUser?.fullName || currentUser?.email || 'Researcher'}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[110px]">
                  {currentUser?.role || 'Research Scientist'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              {/* Authenticated User Profile Card */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-900 text-teal-300 font-bold text-sm flex items-center justify-center border border-navy-700 flex-shrink-0">
                    {currentUser?.initials || (currentUser?.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BS')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-navy-900 truncate">
                      {currentUser?.fullName || 'Authenticated User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email || 'user@institution.org'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {currentUser?.role || 'Research Scientist'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-3 py-2 border-t border-slate-100 space-y-1.5 bg-slate-50/70">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    lockSession();
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lock Session (Access Code)</span>
                </button>

                <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      navigate('/settings');
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-navy-900 inline-flex items-center gap-1 px-1 py-1"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 px-1 py-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
