import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ReturnDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: returns } = useApi(userApi.getReturns);
  const returnData = returns?.returns?.find(r => r.id === id);

  if (!returnData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Return not found</p>
        <button
          onClick={() => navigate('/returns')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Returns
        </button>
      </div>
    );
  }

  const getTypeLabel = (type) => {
    const labels = {
      monthly: 'Monthly Return',
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

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/returns')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Return Details</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(returnData.type)}`}>
            {getTypeLabel(returnData.type)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-2xl font-bold text-green-600">
              +₹{returnData.amount.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Month</p>
              <p className="font-medium text-gray-800">
                {new Date(returnData.month).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-800">
                {returnData.paidOn ? 'Paid' : 'Pending'}
              </p>
            </div>
            {returnData.paidOn && (
              <div>
                <p className="text-sm text-gray-500">Paid On</p>
                <p className="font-medium text-gray-800">
                  {new Date(returnData.paidOn).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Investment</p>
              <p className="font-medium text-gray-800">
                {returnData.investment?.plan?.name || 'N/A'}
              </p>
            </div>
          </div>

          {returnData.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700 mt-1">{returnData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;