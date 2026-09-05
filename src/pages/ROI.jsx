import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../api';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Common/Pagination';
import {ClockIcon,CheckCircleIcon,XCircleIcon} from '@heroicons/react/24/outline';
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to get dynamic months returns from first return to current month (auto-updates)
const getDynamicMonthsReturns = (returnsData = []) => {
  const now = new Date();
  
  // Get all months that have returns - ONLY PAID/ACTIVE RETURNS
  const returnMonths = returnsData
    .filter(item => {
      // Only include paid/active returns
      const isPaid = item.status === 'paid' || item.status === 'payed' || item.status === 'active';
      return item.month && Number(item.amount) > 0 && isPaid;
    })
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
      roi: 0,
      month: date,
      isCurrentMonth: date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(),
      isFirstMonth: index === 0,
      isFutureMonth: date > now // Check if it's a future month
    };
  });

  // Map returns to months - ONLY PAID/ACTIVE RETURNS
  const monthMap = new Map(
    months.map(month => [month.key, month])
  );

  returnsData.forEach(item => {
    // Only include paid/active returns
    const isPaid = item.status === 'paid' || item.status === 'payed' || item.status === 'active';
    if (!item.month || !isPaid) return;

    const date = new Date(item.month);
    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    const monthData = monthMap.get(key);

    if (monthData) {
      monthData.totalAmount += Number(item.amount || 0);
      // Keep the highest ROI for that month
      monthData.roi = Math.max(monthData.roi, Number(item.ROI || 0));
    }
  });

  return months;
};

const ROI = () => {
  const [type, setType] = useState('');
  const [returns, setReturns] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination(returns, 20);

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await userApi.getReturns({
          type: type || undefined,        
          limit: 1000

        });

        if (!response.data.success) {
          setError(response.data.message || 'Failed to fetch returns');
          return;
        }

        const returnsData = response.data.data?.returns || [];

        setReturns(returnsData);

        /*
         * ============================================================
         * 1. CREATE MONTH + AMOUNT DATA FOR ROI GRAPH
         * ============================================================
         *
         * API response:
         *
         * month: "2026-08-31T18:30:00.000Z"
         * amount: "4000.00"
         * ROI: "36.00"
         *
         * Result:
         *
         * [
         *   {
         *     month: "2025-12",
         *     monthLabel: "Dec 2025",
         *     amount: 4000,
         *     roi: 4
         *   },
         *   ...
         * ]
         */

        const monthlyMap = {};

        returnsData.forEach((ret) => {
          if (!ret.month) return;

          const date = new Date(ret.month);

          if (Number.isNaN(date.getTime())) return;

          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}`;

          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
              month: monthKey,
              monthLabel: date.toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric'
              }),
              amount: 0,
              roi: 0,
              count: 0
            };
          }

          monthlyMap[monthKey].amount += Number(ret.amount || 0);

          /*
           * ROI in your API is cumulative:
           *
           * Dec = 4
           * Jan = 8
           * Feb = 12
           * ...
           *
           * So keep the latest/highest ROI for that month.
           */
          monthlyMap[monthKey].roi = Math.max(
            monthlyMap[monthKey].roi,
            Number(ret.ROI || 0)
          );

          monthlyMap[monthKey].count += 1;
        });

        const sortedMonthlyData = Object.values(monthlyMap)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map((item, index, arr) => ({
            ...item,

            /*
             * Cumulative amount received/expected
             */
            cumulativeAmount: arr
              .slice(0, index + 1)
              .reduce(
                (sum, current) => sum + current.amount,
                0
              )
          }));

        setMonthlyData(sortedMonthlyData);

        /*
         * ============================================================
         * 2. GET UNIQUE INVESTMENTS
         * ============================================================
         *
         * Every return contains:
         *
         * ret.investment
         *
         * Since the same investment appears in every monthly return,
         * remove duplicates using investment.id.
         */

        const investmentMap = new Map();

        returnsData.forEach((ret) => {
          const investment = ret.investment;

          if (!investment?.id) return;

          if (!investmentMap.has(investment.id)) {
            investmentMap.set(investment.id, investment);
          }
        });

        setInvestments(Array.from(investmentMap.values()));

      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [type]);

  // Get dynamic months for graph - ONLY PAID/ACTIVE RETURNS
  const dynamicMonthsData = useMemo(() => {
    if (returns.length === 0) return [];
    
    const dynamicData = getDynamicMonthsReturns(returns);
    
    // Add additional info for display
    return dynamicData.map(item => ({
      ...item,
      monthLabel: item.label,
      amount: item.totalAmount,
      roi: item.roi || 0
    }));
  }, [returns]);

  // Filter paid returns for stats
  const paidReturnsData = useMemo(() => {
    return returns.filter(ret => 
      ret.status === 'paid' || ret.status === 'payed' || ret.status === 'active'
    );
  }, [returns]);

  /*
   * ================================================================
   * HELPERS
   * ================================================================
   */

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMonthYear = (dateStr) => {
    if (!dateStr) return 'N/A';

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        icon: ClockIcon,
        color:
          'bg-yellow-100 text-yellow-700 border-yellow-200'
      },

      active: {
        label: 'Paid',
        icon: CheckCircleIcon,
        color:
          'bg-green-100 text-green-700 border-green-200'
      },

      paid: {
        label: 'Paid',
        icon: CheckCircleIcon,
        color:
          'bg-green-100 text-green-700 border-green-200'
      },

      payed: {
        label: 'Paid',
        icon: CheckCircleIcon,
        color:
          'bg-green-100 text-green-700 border-green-200'
      },

      inactive: {
        label: 'Inactive',
        icon: XCircleIcon,
        color:
          'bg-gray-100 text-gray-700 border-gray-200'
      }
    };

    return statusMap[status] || statusMap.pending;
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      monthly: {
        label: 'Monthly',
        color: 'bg-blue-100 text-blue-700'
      },

      annual_bonus: {
        label: 'Annual Bonus',
        color: 'bg-purple-100 text-purple-700'
      },

      quarterly_senior: {
        label: 'Senior Qtr',
        color: 'bg-green-100 text-green-700'
      }

    };

    return (
      typeMap[type] || {
        label: type || 'Monthly',
        color: 'bg-gray-100 text-gray-700'
      }
    );
  };

  /*
   * ================================================================
   * TOTALS - ONLY PAID RETURNS
   * ================================================================
   */

  const totalReturns = returns.reduce(
    (sum, ret) => sum + Number(ret.amount || 0),
    0
  );

  const paidReturns = returns
    .filter(
      (ret) =>
        ret.status === 'paid' ||
        ret.status === 'payed' ||
        ret.status === 'active'
    )
    .reduce(
      (sum, ret) => sum + Number(ret.amount || 0),
      0
    );

  const pendingReturns = returns
    .filter((ret) => ret.status === 'pending')
    .reduce(
      (sum, ret) => sum + Number(ret.amount || 0),
      0
    );

  /*
   * Get latest month chronologically.
   */
  const latestMonthlyData = useMemo(() => {
    if (!dynamicMonthsData.length) return null;

    // Only show if there's actual paid amount
    const paidMonths = dynamicMonthsData.filter(item => item.amount > 0);
    if (paidMonths.length === 0) return null;

    return paidMonths[paidMonths.length - 1];
  }, [dynamicMonthsData]);

  const currentMonthROI =
    latestMonthlyData?.amount || 0;

  // Get months with returns for count - ONLY PAID
  const monthsWithReturns = dynamicMonthsData.filter(item => item.amount > 0);

  // Get date range for display
  const startMonth = dynamicMonthsData[0]?.monthLabel || '';
  const endMonth = dynamicMonthsData[dynamicMonthsData.length - 1]?.monthLabel || '';

  /*
   * ================================================================
   * ROI GRAPH DATA - SINGLE BAR GRAPH (DYNAMIC - PAID ONLY)
   * ================================================================
   */

  const getROIChartData = () => {
    const chartData = dynamicMonthsData;

    return {
      labels: chartData.map((item) => item.monthLabel),

      datasets: [
        {
          label: 'Paid ROI Amount',
          data: chartData.map((item) => item.amount),

          backgroundColor: 'rgba(43, 70, 213, 0.8)',
          borderColor: 'rgba(43, 70, 213, 1)',
          borderWidth: 1,

          borderRadius: 5,

          barPercentage: 0.6,
          categoryPercentage: 0.7
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top',

        labels: {
          usePointStyle: true,
          padding: 20,

          font: {
            size: 12,
            weight: '500'
          },

          boxWidth: 20
        }
      },

      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1A2332',
        bodyColor: '#1A2332',

        borderColor: '#E8ECF0',
        borderWidth: 1,

        padding: 12,
        cornerRadius: 8,

        callbacks: {
          label: function (context) {
            const value = context.parsed.y || 0;

            return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
          },

          afterBody: function (context) {
            const index = context[0]?.dataIndex;

            if (index === undefined) return '';

            const item = dynamicMonthsData[index];

            if (!item) return '';

            return [
              `ROI: ${item.roi}%`,
              `Month: ${item.monthLabel}`
            ];
          }
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },

        ticks: {
          font: {
            size: 11,
            weight: '500'
          },

          color: '#6B7A8F'
        }
      },

      y: {
        beginAtZero: true,

        grid: {
          color: 'rgba(0, 0, 0, 0.06)'
        },

        ticks: {
          callback: function (value) {
            if (value >= 10000000) {
              return `₹${(value / 10000000).toFixed(1)}Cr`;
            }

            if (value >= 100000) {
              return `₹${(value / 100000).toFixed(1)}L`;
            }

            if (value >= 1000) {
              return `₹${(value / 1000).toFixed(1)}K`;
            }

            return `₹${value}`;
          },

          font: {
            size: 11,
            weight: '500'
          },

          color: '#6B7A8F'
        }
      }
    }
  };

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  /*
   * ================================================================
   * ERROR
   * ================================================================
   */

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <div className="text-red-500 text-6xl mb-4">
          ⚠️
        </div>

        <p className="text-red-500 font-medium">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
        >
          Retry
        </button>
      </div>
    );
  }

  /*
   * ================================================================
   * UI
   * ================================================================
   */

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">

{/* Header */}
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    {/* Left Section: Logo + Text Below */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/images/logo3.jpeg"
            alt="Logo"
            className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
          />
        </div>
        {/* Text Below Logo - On all devices */}
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

    {/* Right Section: ROI Dashboard */}
    <div className="flex-1 min-w-0 text-center sm:text-right">
      <h1 className="text-lg sm:text-2xl font-bold truncate">ROI Dashboard</h1>
      <p className="text-blue-100 text-xs sm:text-sm truncate">Track your returns and performance</p>
    </div>
  </div>
</div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">
            Current Month ROI (Paid)
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
            {formatCurrency(currentMonthROI)}
          </p>

          {latestMonthlyData && (
            <p className="text-xs text-gray-400 mt-1">
              {latestMonthlyData.monthLabel}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">
            Total Paid ROI
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
            {formatCurrency(paidReturns)}
          </p>
        </div>

        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">
            Pending ROI
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">
            {formatCurrency(pendingReturns)}
          </p>
        </div> */}

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="flex border-b border-gray-200">

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ROI History
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'graph'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ROI Graph (Paid Only)
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'investments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Investments
          </button>

        </div>

        {/* =========================================================
            HISTORY TAB
        ========================================================== */}

        {activeTab === 'history' && (
          <div className="p-4 sm:p-5">

            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-4">

              {[
                '',
                'monthly',
                'annual_bonus',
                'quarterly_senior'
              ].map((filter) => {

                const label = filter
                  ? filter
                      .replace('_', ' ')
                      .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )
                  : 'All';

                return (
                  <button
                    key={filter || 'all'}
                    onClick={() => setType(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      type === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-200">

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      Month
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      Investment
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      ROI Amount
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      ROI %
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      Type
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-gray-500"
                      >
                        No returns found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((ret) => {

                      const statusBadge =
                        getStatusBadge(ret.status);

                      const typeBadge =
                        getTypeBadge(ret.type);

                      const StatusIcon =
                        statusBadge.icon;

                      return (
                        <tr
                          key={ret.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >

                          <td className="py-3 px-4 text-sm text-gray-800">
                            {getMonthYear(ret.month)}
                          </td>

                          <td className="py-3 px-4 text-sm text-gray-800">
                            {formatCurrency(
                              ret.investment?.amount
                            )}
                          </td>

                          <td className="py-3 px-4 text-sm font-semibold text-green-600">
                            +{formatCurrency(parseInt(ret.amount) * parseInt(ret.monthNo))}
                          </td>

                          <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                            {parseInt(ret.ROI)}%
                          </td>

                          <td className="py-3 px-4">

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusBadge.label}
                            </span>

                          </td>

                          <td className="py-3 px-4">

                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}
                            >
                              {typeBadge.label}
                            </span>

                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile */}
            <div className="sm:hidden space-y-3">

              {currentData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No returns found
                </div>
              ) : (
                currentData.map((ret) => {

                  const statusBadge =
                    getStatusBadge(ret.status);

                  const typeBadge =
                    getTypeBadge(ret.type);

                  const StatusIcon =
                    statusBadge.icon;

                  return (
                    <div
                      key={ret.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {getMonthYear(ret.month)}
                          </p>

                          <p className="text-xs text-gray-500">
                            Investment:{' '}
                            {formatCurrency(
                              ret.investment?.amount
                            )}
                          </p>

                          <p className="text-xs text-blue-600 mt-1">
                            ROI: {ret.ROI}%
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-bold text-green-600">
                            +{formatCurrency(ret.amount)}
                          </p>

                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </span>

                        </div>

                      </div>

                      <div className="mt-2">

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>

                      </div>

                    </div>
                  );
                })
              )}

            </div>

            {/* Pagination */}
            {returns.length > 0 && (
              <div className="mt-4">

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  showInfo={true}
                />

              </div>
            )}

          </div>
        )}

        {/* =========================================================
            GRAPH TAB - PAID ONLY
        ========================================================== */}

        {activeTab === 'graph' && (
          <div className="p-4 sm:p-5">

            {dynamicMonthsData.length > 0 ? (
              <>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Paid ROI
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {startMonth} - {endMonth} • {monthsWithReturns.length} month{monthsWithReturns.length !== 1 ? 's' : ''} with paid returns
                    </p>
                    {dynamicMonthsData[dynamicMonthsData.length - 1]?.isCurrentMonth && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Auto-updates with new paid returns
                      </p>
                    )}
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="text-xs text-gray-500">Total Paid ROI</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(dynamicMonthsData.reduce((sum, item) => sum + item.amount, 0))}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                    <span className="text-xs text-gray-600">
                      Paid ROI
                    </span>
                  </div>
                </div>

                <div className="h-[300px] sm:h-[400px]">

                  <Bar
                    data={getROIChartData()}
                    options={chartOptions}
                  />

                </div>

                {/* Monthly ROI details - Paid Only */}
                <div className="mt-6 overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b border-gray-200">

                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                          Month
                        </th>

                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">
                          Paid Amount
                        </th>

                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">
                          ROI %
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {dynamicMonthsData.map((item) => (
                        <tr
                          key={item.key}
                          className="border-b border-gray-100"
                        >

                          <td className="py-2 px-3 text-sm text-gray-700">
                            {item.monthLabel}
                            {item.isCurrentMonth && ' 📍'}
                          </td>

                          <td className="py-2 px-3 text-sm font-semibold text-right text-blue-600">
                            {formatCurrency(item.amount)}
                          </td>

                          <td className="py-2 px-3 text-sm font-semibold text-right text-green-600">
                            {item.roi}%
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Total Paid Returns</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(dynamicMonthsData.reduce((sum, item) => sum + item.amount, 0))}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Months with Paid Returns</p>
                      <p className="text-lg font-bold text-purple-600">
                        {monthsWithReturns.length} / {dynamicMonthsData.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Auto Update</p>
                      <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        New paid returns added automatically
                      </p>
                    </div>
                  </div>
                </div>

              </>
            ) : (
              <div className="text-center py-12">

                <div className="text-6xl mb-4">
                  📊
                </div>

                <p className="text-gray-500">
                  No paid returns available for graph
                </p>

              </div>
            )}

          </div>
        )}

        {/* =========================================================
            INVESTMENTS TAB
        ========================================================== */}

        {activeTab === 'investments' && (
          <div className="p-4 sm:p-5">

            {investments.length === 0 ? (
              <div className="text-center py-12">

                <div className="text-6xl mb-4">
                  📈
                </div>

                <p className="text-gray-500">
                  No investments found
                </p>

              </div>
            ) : (
              <>

                <div className="flex justify-between items-center mb-4">

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      My Investments
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Investments linked to your ROI
                    </p>
                  </div>

                  <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                    <span className="text-xs">
                      Total Investments
                    </span>

                    <p className="font-bold text-lg">
                      {investments.length}
                    </p>
                  </div>

                </div>

                {/* Desktop Investment Table */}
                <div className="hidden sm:block overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b border-gray-200">

                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Investment Code
                        </th>

                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Amount
                        </th>

                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Investment Date
                        </th>

                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Maturity Date
                        </th>

                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {investments.map((investment) => {

                        const statusBadge =
                          getStatusBadge(
                            investment.status
                          );

                        const StatusIcon =
                          statusBadge.icon;

                        return (
                          <tr
                            key={investment.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >

                            <td className="py-3 px-4">

                              <div>
                                <p className="text-sm font-semibold text-blue-600">
                                  {investment.InvestmentCode ||
                                    'N/A'}
                                </p>
                              </div>

                            </td>

                            <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                              {formatCurrency(
                                investment.amount
                              )}
                            </td>

                            <td className="py-3 px-4 text-sm text-gray-700">
                              {formatDate(
                                investment.investmentDate
                              )}
                            </td>

                            <td className="py-3 px-4 text-sm text-gray-700">
                              {formatDate(
                                investment.maturityDate
                              )}
                            </td>

                            <td className="py-3 px-4">

                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                              >

                                <StatusIcon className="h-3 w-3" />

                                {statusBadge.label}

                              </span>

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

                {/* Mobile Investment Cards */}
                <div className="sm:hidden space-y-3">

                  {investments.map((investment) => {

                    const statusBadge =
                      getStatusBadge(
                        investment.status
                      );

                    const StatusIcon =
                      statusBadge.icon;

                    return (
                      <div
                        key={investment.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      >

                        <div className="flex justify-between items-start">

                          <div>

                            <p className="text-sm font-bold text-blue-600">
                              {investment.InvestmentCode ||
                                'N/A'}
                            </p>

                            <p className="text-lg font-bold text-gray-800 mt-1">
                              {formatCurrency(
                                investment.amount
                              )}
                            </p>

                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >

                            <StatusIcon className="h-3 w-3" />

                            {statusBadge.label}

                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">

                          <div>
                            <p className="text-xs text-gray-500">
                              Investment Date
                            </p>

                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(
                                investment.investmentDate
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Maturity Date
                            </p>

                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(
                                investment.maturityDate
                              )}
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ROI;