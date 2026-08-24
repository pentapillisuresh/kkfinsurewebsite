import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {EnvelopeIcon,PhoneIcon,CalendarIcon,IdentificationIcon,MapPinIcon,UserIcon,ShieldCheckIcon,CheckCircleIcon,ClockIcon,PencilIcon,BuildingOfficeIcon,CreditCardIcon,UserPlusIcon,BanknotesIcon,DocumentTextIcon,FolderIcon,ArrowDownTrayIcon,EyeIcon} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, loading } = useApi(userApi.getProfile);
// const baseURL="http://localhost:3000"
const baseURL="https://service.kkfinsure.org"
  const userData = profile || user || {};

  const infoItems = [
    {
      label: 'Email Address',
      value: userData.email,
      icon: EnvelopeIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Phone Number',
      value: userData.phone || 'Not provided',
      icon: PhoneIcon,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Date of Birth',
      value: userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'Not provided',
      icon: CalendarIcon,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'PAN Number',
      value: userData.pan || 'Not provided',
      icon: IdentificationIcon,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'AADHAR Number',
      value: userData.aadhar || 'Not provided',
      icon: IdentificationIcon,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Address',
      value: userData.address || 'Not provided',
      icon: MapPinIcon,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'INVESTOR ID',
      value: userData.batchId || 'N/A',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  // ---- Helper: render document link ----
  const renderDocumentLink = (filePath, title) => {
    if (!filePath) return <span className="text-gray-400 text-sm">Not uploaded</span>;
    const fullUrl = `${baseURL}/${filePath}`;
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline text-sm"
      >
        <EyeIcon className="h-4 w-4" />
        View Document
        <ArrowDownTrayIcon className="h-3.5 w-3.5 ml-1" />
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
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
              <h1 className="text-lg sm:text-2xl font-bold truncate">Profile</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">
                Manage your personal information
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-5 sm:p-7 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/20 flex items-center justify-center text-3xl sm:text-4xl font-bold border-4 border-white/30 shadow-lg">
              {userData.fullName?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              {userData.fullName || 'User'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                {userData.role === 'admin' ? 'Administrator' : 'Investor'}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm">
                <ClockIcon className="h-3.5 w-3.5" />
                Batch: {userData.batchId || 'N/A'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  userData.isActive
                    ? 'bg-green-500/30 text-white'
                    : 'bg-red-500/30 text-white'
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    userData.isActive ? 'bg-green-300' : 'bg-red-300'
                  }`}
                />
                {userData.isActive ? 'Active' : 'Inactive'}
              </span>
              {userData.isSeniorCitizen && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-white">
                  Senior Citizen
                </span>
              )}
              {userData.partnerType && userData.partnerType !== 'none' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/30 text-white">
                  Partner: {userData.partnerType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Member Since</p>
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            {userData.createdAt ? new Date(userData.createdAt).getFullYear() : '2024'}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Investments</p>
          <p className="text-sm sm:text-lg font-semibold text-blue-600">
            {userData.totalInvestments || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Returns</p>
          <p className="text-sm sm:text-lg font-semibold text-green-600">
            ₹{userData.totalReturns?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Referrals</p>
          <p className="text-sm sm:text-lg font-semibold text-purple-600">
            {userData.referrals || 0}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-600" />
            Personal Information
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Your registered profile details</p>
        </div>
        <div className="divide-y divide-gray-100">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className={`p-2 sm:p-2.5 rounded-xl ${item.color}`}>
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                  {item.value}
                </p>
              </div>
              
            </div>
          ))}
        </div>
      </div>

      {/* Nominee Details (if exists) */}
      {userData.nominee && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5 text-orange-600" />
              Nominee Details
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Your registered nominee</p>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.nominee.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Relation</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.nominee.relation}
                </p>
              </div>
            </div>
            {userData.nominee.phone && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {userData.nominee.phone}
                  </p>
                </div>
              </div>
            )}
            {userData.nominee.email && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {userData.nominee.email}
                  </p>
                </div>
              </div>
            )}
            {userData.nominee.address && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Address</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 whitespace-pre-line">
                    {userData.nominee.address}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600">
                <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Document</p>
                {userData.nominee.documentPath ? (
                  <a
                    href={`${baseURL}/${userData.nominee.documentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Document
                    <ArrowDownTrayIcon className="h-3.5 w-3.5 ml-1" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details (if exists) */}
      {userData.bankDetail && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-purple-600" />
              Bank Details
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Your linked bank account</p>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Account Holder</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.accountHolderName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Bank Name</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.bankName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Account Number</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.accountNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <IdentificationIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">IFSC Code</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.ifscCode}
                </p>
              </div>
            </div>
            {userData.bankDetail.branch && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Branch</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {userData.bankDetail.branch}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Account Type</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.accountType || 'Savings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Verification Status</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {userData.bankDetail.isVerified ? 'Verified ✅' : 'Pending ⏳'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Section (if any) */}
      {userData.documents && userData.documents.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <FolderIcon className="h-5 w-5 text-blue-600" />
              KYC Documents
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Your uploaded documents</p>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {userData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {doc.type?.toUpperCase() || 'Document'} •{' '}
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {renderDocumentLink(doc.filePath, doc.title)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;