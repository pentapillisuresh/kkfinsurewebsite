import React, { useState, useEffect } from 'react';
import { userApi } from '../api';

const Investments = () => {
  const [status, setStatus] = useState('');
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const {data} = await userApi.getInvestments({ status: status || undefined });
        if (data.success) {

          setInvestments(data.data.investments || []);
        } else {
          setError(data.message || 'Failed to fetch investments');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
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
                  <h3 className="font-semibold text-gray-800">{inv.plan?.name || inv.planName}</h3>
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
                    ₹{parseFloat(inv.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="font-semibold text-green-600">
                    ₹{parseFloat(inv.currentValue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Returns</p>
                  <p className="font-semibold text-blue-600">
                    ₹{parseFloat(inv.totalReturns || 0).toLocaleString()}
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