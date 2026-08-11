import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: investment, loading } = useApi(
    () => userApi.getInvestmentDetails ? userApi.getInvestmentDetails(id) : Promise.resolve({ data: { data: null } }),
    null,
    false
  );

  // Since there's no direct getInvestmentDetails in userApi, we'll fetch from investments and filter
  const { data: investments } = useApi(userApi.getInvestments);
  const investmentData = investments?.investments?.find(inv => inv.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!investmentData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Investment not found</p>
        <button
          onClick={() => navigate('/investments')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Investments
        </button>
      </div>
    );
  }

  const inv = investmentData;

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/investments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800">Investment Details</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{inv.planName}</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              inv.status === 'active'
                ? 'bg-green-100 text-green-700'
                : inv.status === 'matured'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {inv.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Investment ID</p>
            <p className="font-medium text-gray-800">{inv.id.slice(0, 12)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium text-gray-800">₹{inv.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Investment Date</p>
            <p className="font-medium text-gray-800">
              {new Date(inv.investmentDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Maturity Date</p>
            <p className="font-medium text-gray-800">
              {new Date(inv.maturityDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="font-medium text-green-600">
              ₹{inv.currentValue?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Returns</p>
            <p className="font-medium text-blue-600">
              ₹{inv.totalReturns?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Profit</p>
            <p className="font-medium text-green-600">
              ₹{inv.totalProfit?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Returns Count</p>
            <p className="font-medium text-gray-800">{inv.returnsCount || 0}</p>
          </div>
        </div>

        {inv.monthlyReturns && Object.keys(inv.monthlyReturns).length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Monthly Returns</h3>
            <div className="space-y-2">
              {Object.entries(inv.monthlyReturns).map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="font-medium text-green-600">+₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentDetails;