import React, { useState, useEffect } from 'react';
import { userApi } from '../api';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Common/Pagination';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
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
      try {
        const response = await userApi.getReturns({ type: type || undefined });
        if (response.data.success) {
          const returnsData = response.data.data.returns || [];
          setReturns(returnsData);
          
          // Process monthly data for double bar chart
          const monthlyMap = {};
          returnsData.forEach(ret => {
            if (ret.month) {
              const monthKey = new Date(ret.month).toISOString().slice(0, 7);
              if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                  month: monthKey,
                  monthlyAmount: 0,
                  cumulativeAmount: 0,
                  count: 0
                };
              }
              monthlyMap[monthKey].monthlyAmount += parseFloat(ret.amount || 0);
              monthlyMap[monthKey].count += 1;
            }
          });
          
          // Calculate cumulative
          let cumulative = 0;
          const sortedMonthly = Object.values(monthlyMap)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(item => {
              cumulative += item.monthlyAmount;
              return {
                ...item,
                cumulativeAmount: cumulative
              };
            });
          
          setMonthlyData(sortedMonthly);
        } else {
          setError(response.data.message || 'Failed to fetch returns');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [type]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getMonthYear = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getShortMonth = (monthKey) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    if (!year || !month) return '';
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: 'Paid', icon: CheckCircleIcon, color: 'bg-green-100 text-green-700 border-green-200' },
      payed: { label: 'Payed', icon: CheckCircleIcon, color: 'bg-green-100 text-green-700 border-green-200' },
      pending: { label: 'Pending', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      active: { label: 'Active', icon: CheckCircleIcon, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      inactive: { label: 'Inactive', icon: XCircleIcon, color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      monthly: { label: 'Monthly', color: 'bg-blue-100 text-blue-700' },
      annual_bonus: { label: 'Annual Bonus', color: 'bg-purple-100 text-purple-700' },
      quarterly_senior: { label: 'Senior Qtr', color: 'bg-green-100 text-green-700' },
      offer: { label: 'Offer', color: 'bg-orange-100 text-orange-700' }
    };
    return typeMap[type] || typeMap.monthly;
  };

  // Calculate totals
  const totalReturns = returns.reduce((sum, ret) => sum + parseFloat(ret.amount || 0), 0);
  const paidReturns = returns.filter(ret => ret.status === 'paid' || ret.status === 'payed')
    .reduce((sum, ret) => sum + parseFloat(ret.amount || 0), 0);
  const pendingReturns = returns.filter(ret => ret.status === 'pending')
    .reduce((sum, ret) => sum + parseFloat(ret.amount || 0), 0);
  
  const currentMonthROI = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.monthlyAmount || 0 : 0;

  // Double Bar Chart Data
  const getDoubleBarChartData = () => {
    const lastSixMonths = monthlyData.slice(-6);
    
    const labels = lastSixMonths.map(item => getShortMonth(item.month));
    const monthlyAmounts = lastSixMonths.map(item => item.monthlyAmount);
    const cumulativeAmounts = lastSixMonths.map(item => item.cumulativeAmount);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Monthly ROI',
          data: monthlyAmounts,
          backgroundColor: 'rgba(43, 70, 213, 0.8)',
          borderColor: 'rgba(43, 70, 213, 1)',
          borderWidth: 2,
          borderRadius: 4,
          barPercentage: 0.4,
          barThickness: 30,
        },
        {
          label: 'Cumulative ROI',
          data: cumulativeAmounts,
          backgroundColor: 'rgba(124, 184, 11, 0.8)',
          borderColor: 'rgba(124, 184, 11, 1)',
          borderWidth: 2,
          borderRadius: 4,
          barPercentage: 0.4,
          barThickness: 30,
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
            weight: '500',
          },
          boxWidth: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1A2332',
        bodyColor: '#1A2332',
        borderColor: '#E8ECF0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            return `${label}: ₹${value.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
          },
          color: '#6B7A8F',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          callback: function(value) {
            if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
            if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
            return `₹${value}`;
          },
          font: {
            size: 11,
            weight: '500',
          },
          color: '#6B7A8F',
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
        >
          Retry
        </button>
      </div>
    );
  }

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
            <h1 className="text-lg sm:text-2xl font-bold">ROI Dashboard</h1>
            <p className="text-blue-100 text-xs sm:text-sm">Track your returns and performance</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Current Month ROI</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
            {formatCurrency(currentMonthROI)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Paid ROI</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
            {formatCurrency(paidReturns)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Pending ROI</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">
            {formatCurrency(pendingReturns)}
          </p>
        </div>
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
            ROIs History
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

        {/* Tab Content - History */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-5">
            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['', 'monthly', 'annual_bonus', 'quarterly_senior', 'offer'].map((filter) => {
                const label = filter ? filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1) : 'All';
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

            {/* Table - Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Investment</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ROI</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">No returns found</td>
                    </tr>
                  ) : (
                    currentData.map((ret) => {
                      const statusBadge = getStatusBadge(ret.status);
                      const typeBadge = getTypeBadge(ret.type);
                      const StatusIcon = statusBadge.icon;

                      return (
                        <tr key={ret.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {getMonthYear(ret.month)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {formatCurrency(ret.investment?.amount || ret.amount)}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600">
                            +{formatCurrency(ret.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}>
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

            {/* Cards - Mobile */}
            <div className="sm:hidden space-y-3">
              {currentData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No returns found</div>
              ) : (
                currentData.map((ret) => {
                  const statusBadge = getStatusBadge(ret.status);
                  const typeBadge = getTypeBadge(ret.type);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div key={ret.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {getMonthYear(ret.month)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Investment: {formatCurrency(ret.investment?.amount || ret.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            +{formatCurrency(ret.amount)}
                          </p>
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}>
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

        {/* Tab Content - Graph with Double Bar */}
        {activeTab === 'graph' && (
          <div className="p-4 sm:p-5">
            {monthlyData.length > 0 ? (
              <>
                <div className="flex justify-end mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Monthly ROI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Cumulative ROI</span>
                  </div>
                </div>
                <div className="h-[300px] sm:h-[400px]">
                  <Bar
                    data={getDoubleBarChartData()}
                    options={chartOptions}
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">Monthly ROI vs Cumulative ROI (Last 6 Months)</p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500">No data available for graph</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Investments */}
        {activeTab === 'investments' && (
          <div className="p-4 sm:p-5">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-gray-500">Investments linked to your ROI</p>
              <p className="text-sm text-gray-400 mt-2">
                Total Investments: {returns.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROI;