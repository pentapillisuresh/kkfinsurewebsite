import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

const BottomNav = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/dashboard', label: 'Home', icon: HomeIcon, activeIcon: HomeIconSolid },
    { path: '/investments', label: 'Investments', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
    { path: '/returns', label: 'Returns', icon: CurrencyDollarIcon, activeIcon: CurrencyDollarIconSolid },
    { path: '/profile', label: 'Profile', icon: UserIcon, activeIcon: UserIconSolid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              <Icon
                className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
              />
              <span
                className={`text-xs mt-0.5 ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 py-1"
        >
          <Bars3Icon className="h-6 w-6 text-gray-500" />
          <span className="text-xs mt-0.5 text-gray-500">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;