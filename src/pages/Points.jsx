import React from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  SparklesIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  GiftIcon,
  UserPlusIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Points = () => {
  const { data, loading } = useApi(userApi.getPoints);

  const totalPoints = data?.totalPoints || 0;
  const pointsBySource = data?.pointsBySource || [];

  // Calculate additional stats
  const totalEarned = pointsBySource.reduce((sum, item) => sum + item.total, 0);
  const sourceCount = pointsBySource.length;

  const sourceLabels = {
    login: 'Daily Login',
    referral: 'Referrals',
    offer: 'Offers',
    other: 'Other',
  };

  const sourceColors = {
    login: 'bg-blue-100 text-blue-700 border-blue-200',
    referral: 'bg-green-100 text-green-700 border-green-200',
    offer: 'bg-purple-100 text-purple-700 border-purple-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sourceIcons = {
    login: ClockIcon,
    referral: UserPlusIcon,
    offer: GiftIcon,
    other: StarIcon,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0 pb-20">
 {/* Header with Logo */}
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    {/* Left Section: Logo + Text Below */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/images/logo3.jpeg" 
            alt="Logo" 
            className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
          />
        </div>
        {/* Text Below Logo - On all devices */}
        <div className="flex flex-col items-center mt-1">
          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Asset - Wealth Management
          </p>
          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>
    </div>

    {/* Right Section: My Points + Points Badge */}
    <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="text-right">
        <h1 className="text-lg sm:text-2xl font-bold truncate">My Points</h1>
        <p className="text-blue-100 text-xs sm:text-sm truncate">Track your reward points</p>
      </div>
      
      {/* Points Badge */}
      <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm flex-shrink-0">
        <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <span className="font-semibold text-sm sm:text-base truncate">
          {totalPoints} Points
        </span>
      </div>
    </div>
  </div>
</div>

      {/* Total Points Card - Premium (Yellow removed) */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -ml-10 -mb-10"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              Total Points Balance
            </p>
            <p className="text-4xl sm:text-6xl font-bold mt-1">{totalPoints}</p>
            <p className="text-sm text-blue-100 mt-1">Keep earning more rewards!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-blue-100">Points Earned</p>
              <p className="text-xl font-bold">{totalEarned}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-blue-100">Sources</p>
              <p className="text-xl font-bold">{sourceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Total Points</p>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">
            {totalPoints}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Points Earned</p>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
            {totalEarned}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Sources</p>
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
              <GiftIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 mt-1 sm:mt-2">
            {sourceCount}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Rank</p>
            <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg">
              <TrophyIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-amber-600 mt-1 sm:mt-2">
            {totalPoints >= 100 ? 'Gold' : totalPoints >= 50 ? 'Silver' : 'Bronze'}
          </p>
        </div>
      </div>

      {/* Points by Source */}
      {pointsBySource.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-blue-500" />
                  Points Breakdown
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Points earned from different sources</p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                Total: {totalPoints} pts
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pointsBySource.map((item) => {
              const Icon = sourceIcons[item.source] || StarIcon;
              const color = sourceColors[item.source] || 'bg-gray-100 text-gray-700 border-gray-200';
              const percentage = totalEarned > 0 ? (item.total / totalEarned) * 100 : 0;
              
              return (
                <div
                  key={item.source}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${color.split(' ')[0]}`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${color}`}>
                        {sourceLabels[item.source] || item.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">
                        {item.total} pts
                      </span>
                      <span className="text-xs text-gray-400 min-w-[40px] text-right">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.source === 'login' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        item.source === 'referral' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        item.source === 'offer' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                        'bg-gradient-to-r from-gray-400 to-gray-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    

   
    </div>
  );
};

export default Points;