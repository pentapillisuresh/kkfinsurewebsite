import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  IdentificationIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, loading } = useApi(userApi.getProfile);

  const userData = profile || user || {};

  const infoItems = [
    { label: 'Email', value: userData.email, icon: EnvelopeIcon },
    { label: 'Phone', value: userData.phone || 'Not provided', icon: PhoneIcon },
    {
      label: 'Date of Birth',
      value: userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toLocaleDateString()
        : 'Not provided',
      icon: CalendarIcon,
    },
    { label: 'PAN', value: userData.pan || 'Not provided', icon: IdentificationIcon },
    { label: 'Address', value: userData.address || 'Not provided', icon: MapPinIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {userData.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{userData.fullName}</h2>
            <p className="text-blue-100 text-sm">
              {userData.role === 'admin' ? 'Administrator' : 'Investor'}
            </p>
            <p className="text-blue-100 text-sm">
              Batch: {userData.batchId || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <item.icon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Status</h3>
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              userData.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {userData.isActive ? 'Active' : 'Inactive'}
          </span>
          {userData.isSeniorCitizen && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Senior Citizen
            </span>
          )}
          {userData.partnerType && userData.partnerType !== 'none' && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Partner: {userData.partnerType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;