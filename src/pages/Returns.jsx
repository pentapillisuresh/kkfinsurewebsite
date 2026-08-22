import React, { useState, useEffect, useRef, useCallback } from 'react';
import { userApi } from '../api';
import {
  CurrencyRupeeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  GiftIcon,
  UserGroupIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Icon mapping for different return types
const TYPE_ICONS = {
  monthly: ArrowTrendingUpIcon,
  annual_bonus: GiftIcon,
  quarterly_senior: UserGroupIcon,
  offer: SparklesIcon,
  default: CurrencyRupeeIcon,
};

const Returns = () => {
  const [type, setType] = useState('');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  const itemsPerPage = 20;
  const summary = localStorage.getItem("InvestmentsSummery::")
  const totalReturns = JSON.parse(summary).totalPaidReturns;

  const fetchReturns = async (pageNum, resetData = false) => {
    try {
      const { data } = await userApi.getReturns({
        type: type || undefined,
        page: pageNum,
        limit: itemsPerPage
      });

      if (data.success) {
        const newReturns = data.data.returns || [];
        const totalCount = data.data.total || 0;

        if (resetData) {
          setReturns(newReturns);
        } else {
          setReturns(prev => [...prev, ...newReturns]);
        }

        const currentTotal = resetData ? newReturns.length : returns.length + newReturns.length;
        setHasMore(currentTotal < totalCount && newReturns.length === itemsPerPage);
        setPage(pageNum);
      } else {
        setError(data.message || 'Failed to fetch returns');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setReturns([]);
    setPage(1);
    setHasMore(true);
    fetchReturns(1, true);
  }, [type]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && !loadingMore) {
      setLoadingMore(true);
      fetchReturns(page + 1);
    }
  }, [hasMore, loading, loadingMore, page]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver]);

  const getTypeLabel = (type) => {
    const labels = {
      monthly: 'Monthly',
      annual_bonus: 'Annual Bonus',
      quarterly_senior: 'Quarterly (Senior)'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      monthly: 'bg-green-100 text-green-700 border-green-200',
      annual_bonus: 'bg-purple-100 text-purple-700 border-purple-200',
      quarterly_senior: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTypeIcon = (type) => {
    return TYPE_ICONS[type] || TYPE_ICONS.default;
  };

  const currentMonthPaidReturns = returns
    .filter(r => {
      const date = new Date(r.month);

      return (
        r.type === 'monthly' &&
        r.status === 'active' &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
      );
    })
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const bonusReturns = returns.filter(r => r.type === 'annual_bonus').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && returns.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <div className="flex justify-center text-red-500 mb-4">
          <ExclamationTriangleIcon className="h-16 w-16" />
        </div>
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
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0 pb-20">
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
              <p className="text-[10px] sm:hidden text-blue-200 font-medium tracking-wide text-center">
                Wealth | Trust | Growth
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">Returns</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Track your investment returns</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              ₹{totalReturns.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Returns</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            ₹{totalReturns.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Current Month</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            ₹{currentMonthPaidReturns.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Returns</p>
          <p className="text-lg sm:text-2xl font-bold text-orange-600">
            {returns.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 sticky top-0 z-10">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['', 'monthly', 'annual_bonus', 'quarterly_senior'].map((filter) => (
            <button
              key={filter || 'all'}
              onClick={() => setType(filter)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${type === filter
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                }`}
            >
              {filter ? getTypeLabel(filter) : 'All'}
              {filter && (
                <span className="ml-1 sm:ml-2 text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {returns.filter(r => r.type === filter).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center text-gray-300 mb-4">
            <DocumentTextIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No returns found</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Start investing to see your returns</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {returns.map((ret) => {
              const TypeIcon = getTypeIcon(ret.type);
              const typeColor = getTypeColor(ret.type);

              return (
                <div
                  key={ret.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-full">
                            {ret.investment?.InvestmentCode || 'Return'}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${typeColor} flex-shrink-0`}
                          >
                            <TypeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {getTypeLabel(ret.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                          <p className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-0.5 sm:gap-1">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {new Date(ret.month).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {ret.paidOn && (
                            <p className="text-[10px] sm:text-sm text-gray-400 flex items-center gap-0.5 sm:gap-1">
                              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              Paid: {new Date(ret.paidOn).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-2xl font-bold text-green-600">
                          +₹{parseFloat(ret.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {ret.type === 'monthly' ? 'Monthly Return' :
                            ret.type === 'annual_bonus' ? 'Bonus' :
                              ret.type === 'quarterly_senior' ? 'Senior Plan' : 'Offer'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                        <span>Return Status</span>
                        <span className="flex items-center gap-1">
                          <CheckCircleIcon className="h-3 w-3 text-green-500" />
                          Completed
                        </span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loader for infinite scroll */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingMore && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Loading more returns...</span>
              </div>
            )}
            {!hasMore && returns.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">You've seen all {returns.length} returns</p>
              </div>
            )}
            {!loadingMore && hasMore && returns.length >= 20 && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400">Scroll down to load more</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Returns;