import React from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { GiftIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Referrals = () => {
  const { data, loading } = useApi(userApi.getReferrals);
  const { data: pointsData } = useApi(userApi.getPoints);

  const referrals = data?.referrals || [];
  const totalPoints = pointsData?.totalPoints || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Referrals</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm text-purple-100">Total Referrals</p>
          <p className="text-2xl font-bold">{referrals.length}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <p className="text-sm text-pink-100">Reward Points</p>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
      </div>

      {/* Referral Code / Link */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p className="text-sm text-gray-500 mb-2">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={`${window.location.origin}/?ref=${localStorage.getItem('userId') || ''}`}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/?ref=${localStorage.getItem('userId') || ''}`
              );
              alert('Referral link copied!');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <UserPlusIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No referrals yet</p>
          <p className="text-sm text-gray-400">
            Share your referral link to earn points!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {ref.referredUser?.fullName || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ref.referredUser?.email || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    +{ref.rewardPoints || 0} pts
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {ref.investmentAmount && (
                <p className="text-sm text-gray-500 mt-2">
                  Investment: ₹{ref.investmentAmount.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Referrals;