import React from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  CurrencyRupeeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { data, loading } = useApi(userApi.getDashboard);

  const stats = data?.summary || {};
  const investments = data?.investments || [];
  const monthlyReturns = data?.monthlyReturns || [];

  const statCards = [
    {
      title: 'Total Invested',
      value: `₹${(stats.totalInvested || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Returns',
      value: `₹${(stats.totalPaidReturns || 0).toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Active Investments',
      value: stats.totalInvestments || 0,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Profit',
      value: `₹${(stats.totalProfit || 0).toLocaleString()}`,
      icon: UserGroupIcon,
      color: 'bg-orange-500',
    },
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
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Monthly Returns Chart (Simplified) */}
      {monthlyReturns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Returns</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyReturns.slice(-6).map((item, index) => {
              const maxAmount = Math.max(...monthlyReturns.map((r) => r.totalAmount || 0));
              const height = maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t">
                    <div
                      className="bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Investments */}
      {investments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Investments</h2>
          <div className="space-y-3">
            {investments.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{inv.planName}</p>
                  <p className="text-sm text-gray-500">
                    Invested: ₹{inv.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    +₹{inv.totalProfit?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.investmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;