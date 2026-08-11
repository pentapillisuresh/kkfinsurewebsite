import React from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';

const Points = () => {
  const { data, loading } = useApi(userApi.getPoints);

  const totalPoints = data?.totalPoints || 0;
  const pointsBySource = data?.pointsBySource || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sourceLabels = {
    login: 'Daily Login',
    referral: 'Referrals',
    offer: 'Offers',
    other: 'Other',
  };

  const sourceColors = {
    login: 'bg-blue-100 text-blue-700',
    referral: 'bg-green-100 text-green-700',
    offer: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Points</h1>

      {/* Total Points Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-100">Total Points</p>
            <p className="text-4xl font-bold">{totalPoints}</p>
          </div>
          <SparklesIcon className="h-12 w-12 text-yellow-200" />
        </div>
      </div>

      {/* Points by Source */}
      {pointsBySource.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Points Breakdown
          </h3>
          <div className="space-y-2">
            {pointsBySource.map((item) => (
              <div
                key={item.source}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[item.source] || 'bg-gray-100 text-gray-700'}`}
                >
                  {sourceLabels[item.source] || item.source}
                </span>
                <span className="font-medium text-gray-800">
                  {item.total} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">How to earn points?</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Daily login: 1 point</li>
              <li>• Refer a friend: 10+ points</li>
              <li>• Complete offers: Variable points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Points;