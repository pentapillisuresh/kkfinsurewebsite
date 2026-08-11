import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../common/BottomNav';
import Sidebar from '../common/Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';

const MobileLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default MobileLayout;