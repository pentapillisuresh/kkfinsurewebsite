import React, { useEffect, useState } from 'react';
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
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";

// Function to get dynamic months returns from first return to current month (auto-updates)
const getDynamicMonthsReturns = (monthlyReturns = []) => {
  const now = new Date();
  
  // Get all months that have returns
  const returnMonths = monthlyReturns
    .filter(item => item.month && Number(item.amount) > 0)
    .map(item => new Date(item.month))
    .sort((a, b) => a - b);

  let startDate;
  
  if (returnMonths.length > 0) {
    // Start from the first month with returns
    startDate = new Date(returnMonths[0]);
    startDate.setDate(1);
  } else {
    // If no returns, start from 12 months ago
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  }

  // Get current month
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Calculate number of months from start to current (including current)
  const monthsDifference = (currentMonth.getFullYear() - startDate.getFullYear()) * 12 + 
                          (currentMonth.getMonth() - startDate.getMonth()) + 1;

  // Generate months from start date to current month
  const months = Array.from({ length: monthsDifference }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + index,
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
      totalAmount: 0,
      month: date,
      isCurrentMonth: date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(),
      isFirstMonth: index === 0,
      isFutureMonth: date > now // Check if it's a future month
    };
  });

  // Map returns to months
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
  const [userData, setUserData] = useState({});
  const { data, loading } = useApi(userApi.getDashboard);
  const navigate = useNavigate();

  const stats = data?.summary || {};
  localStorage.setItem("InvestmentsSummery::", JSON.stringify(stats));
  const investments = data?.investments || [];
  const monthlyReturns = data?.monthlyReturns || [];

  useEffect(() => {
    const userDetails = localStorage.getItem("user");
    if (userDetails) {
      setUserData(JSON.parse(userDetails));
    }
  }, []);

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
      title: 'Total Payout',
      value: `₹${(stats.totalProfit || 0).toLocaleString()}`,
      icon: UserGroupIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const dynamicMonthsReturns = getDynamicMonthsReturns(monthlyReturns);
  
  // Find max value for scaling
  const maxAmount = Math.max(
    ...dynamicMonthsReturns.map(item => item.totalAmount),
    1000 // Minimum for visibility
  );

  // Get months with returns for count
  const monthsWithReturns = dynamicMonthsReturns.filter(item => item.totalAmount > 0);
  const totalReturns = dynamicMonthsReturns.reduce((sum, item) => sum + item.totalAmount, 0);

  // Get date range for display
  const startMonth = dynamicMonthsReturns[0]?.label || '';
  const endMonth = dynamicMonthsReturns[dynamicMonthsReturns.length - 1]?.label || '';

  // Calculate if new months need to be added
  useEffect(() => {
    // This will re-run when monthlyReturns changes
    // The graph will automatically update with new months
  }, [monthlyReturns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-4">
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                <img
                  src="/images/logo3.jpeg"
                  alt="Logo"
                  className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
                />
              </div>
              <div className="flex flex-col items-center mt-1">
                <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
                  Asset - Wealth Management
                </p>
                <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
                  Wealth | Trust | Growth
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-right">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Welcome {userData.fullName}</h1>
            <p className="text-blue-100 text-xs sm:text-sm truncate">Overview of your investment portfolio</p>
          </div>
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

      {/* Dynamic Months Returns Graph */}
      {dynamicMonthsReturns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Monthly Returns
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {startMonth} - {endMonth} • {monthsWithReturns.length} month{monthsWithReturns.length !== 1 ? 's' : ''} with returns
              </p>
              {dynamicMonthsReturns[dynamicMonthsReturns.length - 1]?.isCurrentMonth && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Auto-updates with new months
                </p>
              )}
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <p className="text-xs text-gray-500">Total Returns</p>
              <p className="text-lg font-bold text-blue-600">
                ₹{totalReturns.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-end gap-2 h-80 overflow-x-auto pb-4">
            {dynamicMonthsReturns.map((item, index) => {
              // Calculate height with minimum visibility for zero values
              const hasReturn = item.totalAmount > 0;
              const height = maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 5;
              const finalHeight = hasReturn ? Math.max(height, 10) : 5;
              
              // Check if it's a new month (future month)
              const isNewMonth = item.isCurrentMonth && !hasReturn;
              
              return (
                <div
                  key={item.key}
                  className="flex-1 min-w-[80px] h-full flex flex-col justify-end items-center"
                >
                  {/* Amount Label */}
                  <div className={`mb-1 text-[10px] font-medium ${hasReturn ? 'text-gray-700' : 'text-gray-400'}`}>
                    {hasReturn ? `₹${item.totalAmount.toLocaleString('en-IN')}` : '₹0'}
                  </div>

                  {/* Bar */}
                  <div className="w-full h-64 flex items-end justify-center relative">
                    <div
                      className={`w-3/4 rounded-t-lg transition-all duration-500 cursor-pointer relative ${
                        hasReturn 
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500' 
                          : isNewMonth 
                            ? 'bg-yellow-200 border-2 border-yellow-400 border-dashed' 
                            : 'bg-gray-200'
                      }`}
                      style={{ 
                        height: `${finalHeight}%`,
                        minHeight: hasReturn ? '10px' : '5px'
                      }}
                    >
                      {/* Tooltip on hover for months with returns */}
                      {hasReturn && (
                        <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </div>
                      )}
                      {/* Zero return indicator */}
                      {!hasReturn && !isNewMonth && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-400 whitespace-nowrap">
                          No return
                        </div>
                      )}
                      {/* New month indicator */}
                      {isNewMonth && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[8px] font-medium text-yellow-600 whitespace-nowrap">
                          Waiting for return
                        </div>
                      )}
                    </div>
                    
                    {/* First month indicator */}
                    {item.isFirstMonth && hasReturn && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className="text-[8px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          First Return
                        </span>
                      </div>
                    )}
                    
                    {/* Current month indicator */}
                    {item.isCurrentMonth && hasReturn && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className="text-[8px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          Current
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Month Label */}
                  <span className={`text-[10px] mt-3 whitespace-nowrap ${hasReturn ? 'text-gray-500' : isNewMonth ? 'text-yellow-600 font-medium' : 'text-gray-400'}`}>
                    {item.label}
                    {isNewMonth && ' 🔄'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Returns</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{totalReturns.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Months with Returns</p>
                <p className="text-lg font-bold text-purple-600">
                  {monthsWithReturns.length} / {dynamicMonthsReturns.length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Auto Update</p>
                <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  New months added automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Investments */}
      {investments.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Investments</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Your latest investment activities</p>
            </div>
            <div
              className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium cursor-pointer"
              onClick={() => navigate("/investments")}
            >
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
                  <div className={`p-2 rounded-lg ${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <ChartBarIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${index % 2 === 0 ? 'text-blue-600' : 'text-green-600'}`} />
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
    </div>
  );
};

export default Dashboard;