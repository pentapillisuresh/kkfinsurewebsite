import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title || 'KKFINSUREAPP'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.fullName?.split(' ')[0] || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;