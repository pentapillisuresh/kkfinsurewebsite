import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const BalanceSheet = () => {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const { data, loading } = useApi(userApi.getBalanceSheets, { periodStart, periodEnd });

  const balanceSheets = data?.balanceSheets || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Balance Sheets</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500">From</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">To</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Balance Sheets List */}
      {balanceSheets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No balance sheets available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {balanceSheets.map((sheet) => (
            <div
              key={sheet.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(sheet.periodStart).toLocaleDateString()} -{' '}
                    {new Date(sheet.periodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Generated: {new Date(sheet.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Net Worth</p>
                  <p className="font-bold text-green-600">
                    ₹{sheet.netWorth?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Investments</p>
                  <p className="text-sm font-medium text-gray-700">
                    ₹{sheet.totalInvestments?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Returns</p>
                  <p className="text-sm font-medium text-gray-700">
                    ₹{sheet.totalReturns?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="text-sm font-medium text-gray-700">
                    ₹{sheet.totalCommission?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {sheet.balanceSheetFile && (
                <a
                  href={sheet.balanceSheetFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;