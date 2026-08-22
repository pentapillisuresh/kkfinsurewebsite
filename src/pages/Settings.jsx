import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import {
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'old') setShowOldPassword(!showOldPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };

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
              <h1 className="text-lg sm:text-2xl font-bold truncate">Settings</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Manage your account preferences</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-50 rounded-xl">
              <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Change Password</h3>
              <p className="text-xs text-gray-500 mt-0.5">Update your account password</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {message && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs sm:text-sm flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <KeyIcon className="h-4 w-4" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <KeyIcon className="h-4 w-4" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                  placeholder="Enter new password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <KeyIcon className="h-4 w-4" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <KeyIcon className="h-4 w-4" />
                  Update Password
                </>
              )}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <ul className="text-[10px] sm:text-xs text-gray-500 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                At least 6 characters long
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                Use a combination of letters, numbers, and symbols
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                Avoid using common passwords
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl">
              <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Account</h3>
              <p className="text-xs text-gray-500 mt-0.5">Sign out of your account</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
          <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-2">
            You will be redirected to the login page
          </p>
        </div>
      </div>

      {/* App Info - Dynamic Year */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
          <span className="font-medium text-blue-600">KKFINSUREAPP</span>
          <span className="text-gray-300">|</span>
          <span>v1.0.0</span>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
          © {currentYear} KKFINSUREAPP. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-[8px] sm:text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 transition">Privacy Policy</span>
          <span className="text-gray-300">•</span>
          <span className="text-[8px] sm:text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 transition">Terms of Service</span>
          <span className="text-gray-300">•</span>
          <span className="text-[8px] sm:text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 transition">Support</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;