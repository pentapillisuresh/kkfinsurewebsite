import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../common/BottomNav';
import Sidebar from '../common/Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import Disclaimer from '../common/Disclaimer';

const MobileLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Bottom Navigation */}
      <BottomNav
        onMenuClick={() => setIsSidebarOpen(true)}
      />

    </div>
  );
};

export default MobileLayout;