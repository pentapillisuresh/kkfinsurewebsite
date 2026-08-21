import React, { useState, useEffect } from 'react';
import { userApi } from '../api';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Common/Pagination';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Investments = () => {
  const [status, setStatus] = useState('');
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination(investments, 20);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Active', icon: CheckCircleIcon, color: 'bg-green-100 text-green-800 border-green-200' },
      matured: { label: 'Matured', icon: ArrowTrendingUpIcon, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      closed: { label: 'Closed', icon: XCircleIcon, color: 'bg-gray-100 text-gray-800 border-gray-200' },
      pending: { label: 'Pending', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    };
    return statusMap[status] || statusMap.active;
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
      {/* Header with Logo - Mobile Responsive */}
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
              {/* Tagline below logo on mobile, beside logo on desktop */}
              <p className="text-[10px] sm:hidden text-blue-200 font-medium tracking-wide text-center">
                Wealth | Trust | Growth
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">My Investments</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Track and manage your portfolio</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              ₹{investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
        {/* Tagline for desktop - beside the logo area */}
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{investments.length}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Active</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {investments.filter(inv => inv.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Matured</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            {investments.filter(inv => inv.status === 'matured').length}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Returns</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 text-truncate">
            ₹{investments.reduce((sum, inv) => sum + parseFloat(inv.totalReturns || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['', 'active', 'matured', 'closed', 'pending'].map((filter) => (
            <button
              key={filter || 'all'}
              onClick={() => setStatus(filter)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                status === filter
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : 'All'}
              {filter && (
                <span className="ml-1 sm:ml-2 text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {investments.filter(inv => inv.status === filter).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl sm:text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-base sm:text-lg">No investments found</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Start your investment journey today</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {currentData.map((inv) => {
              const StatusIcon = getStatusBadge(inv.status).icon;
              const statusBadge = getStatusBadge(inv.status);
              const isExpanded = expandedId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-3 sm:p-5 cursor-pointer" onClick={() => toggleExpand(inv.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[120px] sm:max-w-full">
                            {inv.plan?.name || inv.planName}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusBadge.color} flex-shrink-0`}
                          >
                            <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="hidden xs:inline">{statusBadge.label}</span>
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                          ID: {inv.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                        <div className="text-right hidden xs:block">
                          <p className="text-[10px] sm:text-sm text-gray-500">Amount</p>
                          <p className="font-bold text-gray-800 text-xs sm:text-base">
                            ₹{parseFloat(inv.amount).toLocaleString()}
                          </p>
                        </div>
                        <button className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats - Mobile Responsive */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <CurrencyRupeeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Amount
                        </p>
                        <p className="font-semibold text-gray-800 text-[10px] sm:text-sm truncate">
                          ₹{parseFloat(inv.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <ArrowTrendingUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Value
                        </p>
                        <p className="font-semibold text-green-600 text-[10px] sm:text-sm truncate">
                          ₹{parseFloat(inv.currentValue || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <ChartBarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Returns
                        </p>
                        <p className="font-semibold text-blue-600 text-[10px] sm:text-sm truncate">
                          ₹{parseFloat(inv.totalReturns || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <CalendarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Maturity
                        </p>
                        <p className="font-semibold text-gray-800 text-[10px] sm:text-sm truncate">
                          {new Date(inv.maturityDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-3 sm:p-4 -mx-1 sm:-mx-2">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <div>
                            <p className="text-[8px] sm:text-xs text-gray-500">Investment Date</p>
                            <p className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">
                              {new Date(inv.createdAt || inv.investmentDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] sm:text-xs text-gray-500">Rate of Return</p>
                            <p className="text-[10px] sm:text-sm font-medium text-gray-800">
                              {inv.rateOfReturn || '--'}%
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[8px] sm:text-xs text-gray-500">Payment Status</p>
                            <p className="text-[10px] sm:text-sm font-medium text-gray-800">
                              {inv.paymentStatus || 'Completed'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1">
                              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              View Full Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination - Mobile Responsive */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              showInfo={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Investments;