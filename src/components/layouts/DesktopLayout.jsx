import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import Disclaimer from '../common/Disclaimer';

const DesktopLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar isOpen={true} onClose={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        {/* Disclaimer - appears on every page */}
        <Disclaimer />

      </div>
    </div>
  );
};

export default DesktopLayout;