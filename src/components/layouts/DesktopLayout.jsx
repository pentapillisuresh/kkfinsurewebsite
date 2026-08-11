import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';

const DesktopLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={true} onClose={() => {}} />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;