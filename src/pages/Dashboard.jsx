import React, { useState, useMemo, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  CurrencyRupeeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const getLastSixMonthsReturns = (monthlyReturns = []) => {
  const now = new Date();

  // Generate current month + previous 5 months
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1
    );

    const year = date.getFullYear();
    const month = date.getMonth();

    return {
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      }),
      totalAmount: 0
    };
  });

  const monthMap = new Map(
    months.map(month => [month.key, month])
  );

  monthlyReturns.forEach(item => {
    if (!item.month) return;

    const date = new Date(item.month);

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    const monthData = monthMap.get(key);

    if (monthData) {
      monthData.totalAmount += Number(item.amount || 0);
    }
  });

  return months;
};

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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Returns',
      value: `₹${(stats.totalPaidReturns || 0).toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Active Investments',
      value: stats.totalInvestments || 0,
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Profit',
      value: `₹${(stats.totalProfit || 0).toLocaleString()}`,
      icon: UserGroupIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const lastSixMonthsReturns =
    getLastSixMonthsReturns(monthlyReturns);

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
              {/* Tagline below logo on mobile */}
              <p className="text-[10px] sm:hidden text-blue-200 font-medium tracking-wide text-center">
                Wealth | Trust | Growth
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">Dashboard</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Overview of your investment portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        {/* Tagline for desktop */}
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 sm:p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.textColor}`} />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${stat.bgColor} ${stat.textColor}`}>
                {index === 0 ? 'Total' : index === 1 ? 'Earned' : index === 2 ? 'Active' : 'Net'}
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-2 sm:mt-3 truncate">{stat.value}</p>
            <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{stat.title}</p>
            <div className="mt-2 sm:mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Returns Chart */}
      {lastSixMonthsReturns.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Monthly Returns
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Last 6 months
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-gray-500">
          6 Month Total
        </p>

        <p className="text-lg font-bold text-blue-600">
          ₹
          {lastSixMonthsReturns
            .reduce((sum, item) => sum + item.totalAmount, 0)
            .toLocaleString('en-IN')}
        </p>
      </div>
    </div>

    <div className="flex items-end gap-3 h-64">
      {(() => {
        const maxAmount = Math.max(
          ...lastSixMonthsReturns.map(
            item => item.totalAmount
          ),
          0
        );

        return lastSixMonthsReturns.map(item => {
          const height =
            maxAmount > 0
              ? (item.totalAmount / maxAmount) * 100
              : 0;

          return (
            <div
              key={item.key}
              className="flex-1 h-full flex flex-col justify-end items-center"
            >
              {/* Amount */}
              <div className="mb-2 text-xs font-semibold text-gray-700">
                {item.totalAmount > 0
                  ? `₹${item.totalAmount.toLocaleString('en-IN')}`
                  : '₹0'}
              </div>

              {/* Bar */}
              <div className="w-full h-48 flex items-end">
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all duration-500"
                  style={{
                    height:
                      item.totalAmount > 0
                        ? `${height}%`
                        : '4px'
                  }}
                  title={`${item.label}: ₹${item.totalAmount.toLocaleString('en-IN')}`}
                />
              </div>

              {/* Month */}
              <span className="text-xs text-gray-500 mt-3 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );
        });
      })()}
    </div>
  </div>
)}

      {/* Recent Investments & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Investments */}
        {investments.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Investments</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Your latest investment activities</p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium">
                <span>View All</span>
                <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {investments.slice(0, 5).map((inv, index) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2 rounded-lg ${
                      index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <ChartBarIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        index % 2 === 0 ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{inv.planName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(inv.investmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      ₹{inv.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs font-medium text-green-600 flex items-center gap-1 justify-end">
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                      +₹{inv.totalProfit?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Sidebar */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Quick Stats</h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="text-sm sm:text-base text-gray-700">Active Plans</span>
              </div>
              <span className="font-bold text-blue-600 text-sm sm:text-lg">
                {stats.activeInvestments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-sm sm:text-base text-gray-700">Matured Plans</span>
              </div>
              <span className="font-bold text-green-600 text-sm sm:text-lg">
                {stats.maturedInvestments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span className="text-sm sm:text-base text-gray-700">Avg. Return</span>
              </div>
              <span className="font-bold text-purple-600 text-sm sm:text-lg">
                {stats.averageReturn || '--'}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                <span className="text-sm sm:text-base text-gray-700">Referrals</span>
              </div>
              <span className="font-bold text-orange-600 text-sm sm:text-lg">
                {stats.referrals || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <button className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105 text-sm sm:text-base">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;