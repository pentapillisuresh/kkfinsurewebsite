import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  UserIcon,
  DocumentTextIcon,
  GiftIcon,
  SparklesIcon,
  TicketIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/investments', label: 'Investments', icon: ChartBarIcon },
    { path: '/returns', label: 'Returns', icon: CurrencyRupeeIcon },
    { path: '/roi', label: 'ROI & Returns', icon: ArrowTrendingUpIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
    { path: '/balance-sheet', label: 'Balance Sheet', icon: DocumentTextIcon },
    { path: '/documents', label: 'Documents', icon: DocumentTextIcon },
    { path: '/referrals', label: 'Referrals', icon: GiftIcon },
    { path: '/points', label: 'Points', icon: SparklesIcon },
    { path: '/tickets', label: 'Tickets', icon: TicketIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <img 
            src="/images/logo3.jpeg" 
            alt="Logo" 
            className="h-12 w-auto object-contain mx-auto"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 md:hidden flex-shrink-0"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-semibold text-gray-800 block">Asset - Wealth Management</span>
          <span className="text-xs text-gray-500 block">Wealth || Trust || Growth</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="overflow-y-auto p-2 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer - Logout at bottom with proper spacing */}
      <div className="p-4 pt-2 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="font-medium text-sm">Logout</span>
        </button>
        <div className="text-center mt-2">
          <p className="text-[9px] text-gray-400">v1.0.0</p>
        </div>
      </div>
    </div>
  );

  // Desktop sidebar - always visible
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0 h-screen sticky top-0 border-r border-gray-200 bg-white overflow-y-auto">
        {sidebarContent}
      </div>

      {/* Mobile - Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;