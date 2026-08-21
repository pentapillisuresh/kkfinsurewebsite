import React from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  GiftIcon,
  UserPlusIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const Referrals = () => {
  const { data, loading } = useApi(userApi.getReferrals);
  const { data: pointsData } = useApi(userApi.getPoints);

  const referrals = data?.referrals || [];
  const totalPoints = pointsData?.totalPoints || 0;

  // Calculate stats
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.isActive !== false).length;
  const totalRewardPoints = referrals.reduce((sum, ref) => sum + (ref.rewardPoints || 0), 0);

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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="flex-shrink-0">
                <img 
                  src="/images/logo3.jpeg" 
                  alt="Logo" 
                  className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
                />
              </div>
              <p className="text-[10px] sm:hidden text-blue-200 font-medium tracking-wide text-center">
                Wealth | Trust | Growth
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">Referrals</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Invite friends and earn rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              {totalPoints} Points
            </span>
          </div>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Total Referrals</p>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">
            {totalReferrals}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Active</p>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
            {activeReferrals}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Reward Points</p>
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
              <GiftIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 mt-1 sm:mt-2">
            {totalPoints}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Points Earned</p>
            <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg">
              <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-orange-600 mt-1 sm:mt-2">
            {totalRewardPoints}
          </p>
        </div>
      </div>

      {/* Referral Code / Link */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ClipboardDocumentIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-gray-800">Your Referral Link</p>
            <p className="text-xs text-gray-500">Share this link with your friends</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={`${window.location.origin}/?ref=${localStorage.getItem('userId') || ''}`}
            readOnly
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/?ref=${localStorage.getItem('userId') || ''}`
              );
              alert('Referral link copied!');
            }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center text-gray-300 mb-4">
            <UserPlusIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No referrals yet</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Share your referral link to earn points!
          </p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow flex items-center gap-2 mx-auto">
            <UserPlusIcon className="h-4 w-4" />
            Invite Friends
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="p-3 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex-shrink-0">
                        <UserPlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-lg truncate">
                          {ref.referredUser?.fullName || 'User'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {ref.referredUser?.email || ''}
                        </p>
                        {ref.investmentAmount && (
                          <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <CurrencyRupeeIcon className="h-3 w-3" />
                            Investment: ₹{ref.investmentAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 rounded-full">
                        <GiftIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <p className="text-xs sm:text-sm font-bold text-green-600">
                          +{ref.rewardPoints || 0}
                        </p>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                      <span>Referral Status</span>
                      <span className={`flex items-center gap-1 ${ref.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className="h-3 w-3" />
                        {ref.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          ref.isActive !== false 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                        style={{ width: ref.isActive !== false ? '100%' : '30%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer with total */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="text-sm sm:text-base font-medium text-gray-700">Total Referrals</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-sm sm:text-base font-bold text-gray-800">{referrals.length}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-sm sm:text-base font-bold text-purple-600">{totalPoints} pts</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Referrals;