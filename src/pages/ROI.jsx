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
          type: type || undefined
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

      pending: {
        label: 'Pending',
        icon: ClockIcon,
        color:
          'bg-yellow-100 text-yellow-700 border-yellow-200'
      },

      active: {
        label: 'Active',
        icon: CheckCircleIcon,
        color:
          'bg-blue-100 text-blue-700 border-blue-200'
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
      },

      offer: {
        label: 'Offer',
        color: 'bg-orange-100 text-orange-700'
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
   * TOTALS
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
    if (!monthlyData.length) return null;

    return [...monthlyData].sort((a, b) =>
      a.month.localeCompare(b.month)
    )[monthlyData.length - 1];
  }, [monthlyData]);

  const currentMonthROI =
    latestMonthlyData?.amount || 0;

  /*
   * ================================================================
   * ROI GRAPH DATA
   * ================================================================
   *
   * Uses:
   *
   * month
   * amount
   * ROI
   *
   * Example from your API:
   *
   * Dec 2025 -> ₹4,000 -> ROI 4%
   * Jan 2026 -> ₹4,000 -> ROI 8%
   * Feb 2026 -> ₹4,000 -> ROI 12%
   * ...
   */

  const getROIChartData = () => {
    const chartData = monthlyData;

    return {
      labels: chartData.map((item) => item.monthLabel),

      datasets: [
        {
          label: 'Monthly ROI Amount',
          data: chartData.map((item) => item.amount),

          backgroundColor: 'rgba(43, 70, 213, 0.8)',
          borderColor: 'rgba(43, 70, 213, 1)',
          borderWidth: 1,

          borderRadius: 5,

          barPercentage: 0.6,
          categoryPercentage: 0.7
        },

        {
          label: 'Cumulative ROI Amount',
          data: chartData.map(
            (item) => item.cumulativeAmount
          ),

          backgroundColor: 'rgba(124, 184, 11, 0.75)',
          borderColor: 'rgba(124, 184, 11, 1)',
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

            return `${
              context.dataset.label
            }: ₹${value.toLocaleString('en-IN')}`;
          },

          afterBody: function (context) {
            const index = context[0]?.dataIndex;

            if (index === undefined) return '';

            const item = monthlyData[index];

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
              return `₹${(
                value / 10000000
              ).toFixed(1)}Cr`;
            }

            if (value >= 100000) {
              return `₹${(
                value / 100000
              ).toFixed(1)}L`;
            }

            if (value >= 1000) {
              return `₹${(
                value / 1000
              ).toFixed(1)}K`;
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

        <div className="flex items-center gap-3 sm:gap-4">

          <div className="flex-shrink-0">
            <img
              src="/images/logo3.jpeg"
              alt="Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-lg p-1 shadow-md object-contain"
            />
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl font-bold">
              ROI Dashboard
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm">
              Track your returns and performance
            </p>
          </div>

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">
            Current Month ROI
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
            Paid ROI
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
            ROI Graph
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
                'quarterly_senior',
                'offer'
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
                            +{formatCurrency(ret.amount)}
                          </td>

                          <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                            {ret.ROI}%
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
            GRAPH TAB
        ========================================================== */}

        {activeTab === 'graph' && (
          <div className="p-4 sm:p-5">

            {monthlyData.length > 0 ? (
              <>

                <div className="mb-4">

                  <h3 className="text-lg font-semibold text-gray-800">
                    Monthly ROI
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Monthly return amount from your investments
                  </p>

                </div>

                <div className="flex justify-end mb-4 gap-4">

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>

                    <span className="text-xs text-gray-600">
                      Monthly ROI
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>

                    <span className="text-xs text-gray-600">
                      Cumulative ROI
                    </span>
                  </div>

                </div>

                <div className="h-[300px] sm:h-[400px]">

                  <Bar
                    data={getROIChartData()}
                    options={chartOptions}
                  />

                </div>

                {/* Monthly ROI details */}
                <div className="mt-6 overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b border-gray-200">

                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                          Month
                        </th>

                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">
                          Amount
                        </th>

                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">
                          ROI %
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {monthlyData.map((item) => (
                        <tr
                          key={item.month}
                          className="border-b border-gray-100"
                        >

                          <td className="py-2 px-3 text-sm text-gray-700">
                            {item.monthLabel}
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

              </>
            ) : (
              <div className="text-center py-12">

                <div className="text-6xl mb-4">
                  📊
                </div>

                <p className="text-gray-500">
                  No data available for graph
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

                                <p className="text-xs text-gray-400">
                                  {investment.id}
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
