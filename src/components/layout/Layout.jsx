import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ToastContainer from '../common/ToastContainer';
import AuthModal from '../auth/AuthModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-navy-900">
      <div className="flex-1 flex min-h-0">
        {/* Persistent Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main App Container */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopNavbar onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Authentication Modal (Access Code Unlock & Session Lock) */}
      <AuthModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
