import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ArrowLeftIcon, UserIcon, GiftIcon } from '@heroicons/react/24/outline';

const ReferralDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: referrals } = useApi(userApi.getReferrals);
  const referral = referrals?.referrals?.find(r => r.id === id);

  if (!referral) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Referral not found</p>
        <button
          onClick={() => navigate('/referrals')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Referrals
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/referrals')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Referral Details</h1>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Referred User</p>
              <p className="font-medium text-gray-800">
                {referral.referredUser?.fullName || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {referral.referredUser?.email || ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Investment Amount</p>
              <p className="font-medium text-gray-800">
                ₹{referral.investmentAmount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reward Points</p>
              <p className="font-medium text-green-600">
                +{referral.rewardPoints || 0} pts
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-800">
                {new Date(referral.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-800">
                {referral.status || 'Active'}
              </p>
            </div>
          </div>

          {referral.offer && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <GiftIcon className="h-5 w-5 text-purple-600" />
                <p className="font-medium text-purple-800">Offer Applied</p>
              </div>
              <p className="text-sm text-purple-700 mt-1">{referral.offer.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;