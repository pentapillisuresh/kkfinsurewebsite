import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';

const Returns = () => {
  const [type, setType] = useState('');
  const { data, loading } = useApi(userApi.getReturns, { type });

  const returns = data?.returns || [];

  const getTypeLabel = (type) => {
    const labels = {
      monthly: 'Monthly',
      annual_bonus: 'Annual Bonus',
      quarterly_senior: 'Quarterly (Senior)',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      monthly: 'bg-green-100 text-green-700',
      annual_bonus: 'bg-purple-100 text-purple-700',
      quarterly_senior: 'bg-blue-100 text-blue-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Returns</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'monthly', 'annual_bonus', 'quarterly_senior'].map((filter) => (
          <button
            key={filter || 'all'}
            onClick={() => setType(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              type === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter ? getTypeLabel(filter) : 'All'}
          </button>
        ))}
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No returns found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <div
              key={ret.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(ret.month).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="font-medium text-gray-800">
                    {ret.investment?.plan?.name || 'Investment'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +₹{ret.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(
                      ret.type
                    )}`}
                  >
                    {getTypeLabel(ret.type)}
                  </span>
                </div>
              </div>
              {ret.paidOn && (
                <p className="text-xs text-gray-400 mt-2">
                  Paid on: {new Date(ret.paidOn).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Returns;