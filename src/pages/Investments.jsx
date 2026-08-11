import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const Investments = () => {
  const [status, setStatus] = useState('');
  const { data, loading } = useApi(userApi.getInvestments, { status });

  const investments = data?.investments || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Investments</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'active', 'matured', 'closed'].map((filter) => (
          <button
            key={filter || 'all'}
            onClick={() => setStatus(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              status === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter || 'All'}
          </button>
        ))}
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No investments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{inv.planName}</h3>
                  <p className="text-sm text-gray-500">
                    Investment ID: {inv.id.slice(0, 8)}
                  </p>
                </div>
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

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-800">
                    ₹{inv.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="font-semibold text-green-600">
                    ₹{inv.currentValue?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Returns</p>
                  <p className="font-semibold text-blue-600">
                    ₹{inv.totalReturns?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maturity</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(inv.maturityDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Investments;