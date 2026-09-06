import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import { userApi } from '../api';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Common/Pagination';

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
  const [error, setError] = useState(null);

  // =========================================================
  // PAGINATION
  // =========================================================

  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination(returns, 20);

  // =========================================================
  // TOTAL PAID RETURNS FROM LOCAL STORAGE
  // =========================================================

  const getInvestmentSummary = () => {
    try {
      const summary = localStorage.getItem(
        'InvestmentsSummery::'
      );

      if (!summary) {
        return {};
      }

      return JSON.parse(summary) || {};
    } catch (error) {
      console.error(
        'Failed to parse InvestmentsSummery::',
        error
      );

      return {};
    }
  };

  const summary = getInvestmentSummary();

  const totalPaidReturns = Number(
    summary?.totalPaidReturns || 0
  );

  // =========================================================
  // FETCH RETURNS
  // =========================================================

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await userApi.getReturns({
        type: type || undefined,
        limit: 1000 // Fetch all returns for pagination
      });

      if (data.success) {
        const allReturns =
          data.data?.returns || [];

        /*
         * Show paid, pending and active records.
         */
        const filteredReturns = allReturns.filter(
          (ret) =>
            ret.status === 'paid' ||
            ret.status === 'payed' ||
            ret.status === 'pending' ||
            ret.status === 'active'
        );

        setReturns(filteredReturns);
      } else {
        setError(
          data.message ||
            'Failed to fetch returns'
        );
      }
    } catch (err) {
      console.error(
        'Error fetching returns:',
        err
      );

      setError(
        err.message ||
          'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA WHEN FILTER CHANGES
  // =========================================================

  useEffect(() => {
    fetchReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (
    returnType
  ) => {
    const labels = {
      monthly: 'Monthly',
      annual_bonus: 'Annual Bonus',
      quarterly_senior:
        'Quarterly (Senior)',
      offer: 'Offer',
    };

    return (
      labels[returnType] ||
      returnType ||
      'Return'
    );
  };

  // =========================================================
  // TYPE COLOR
  // =========================================================

  const getTypeColor = (
    returnType
  ) => {
    const colors = {
      monthly:
        'bg-green-100 text-green-700 border-green-200',

      annual_bonus:
        'bg-purple-100 text-purple-700 border-purple-200',

      quarterly_senior:
        'bg-blue-100 text-blue-700 border-blue-200',

      offer:
        'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    return (
      colors[returnType] ||
      'bg-gray-100 text-gray-700 border-gray-200'
    );
  };

  // =========================================================
  // TYPE ICON
  // =========================================================

  const getTypeIcon = (
    returnType
  ) => {
    return (
      TYPE_ICONS[returnType] ||
      TYPE_ICONS.default
    );
  };

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const isPaidStatus = (
    status
  ) => {
    return (
      status === 'paid' ||
      status === 'payed' ||
      status === 'active'
    );
  };

  const isPendingStatus = (
    status
  ) => {
    return status === 'pending';
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  // Current month paid returns
  const currentMonthPaidReturns =
    returns
      .filter((r) => {
        if (!r.month) {
          return false;
        }

        const date = new Date(
          r.month
        );

        const now = new Date();

        return (
          r.type === 'monthly' &&
          isPaidStatus(r.status) &&
          date.getMonth() ===
            now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (sum, r) =>
          sum +
          Number.parseFloat(
            r.amount || 0
          ),
        0
      );

  // Current month pending returns
  const currentMonthPendingReturns =
    returns
      .filter((r) => {
        if (!r.month) {
          return false;
        }

        const date = new Date(
          r.month
        );

        const now = new Date();

        return (
          r.type === 'monthly' &&
          isPendingStatus(r.status) &&
          date.getMonth() ===
            now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (sum, r) =>
          sum +
          Number.parseFloat(
            r.amount || 0
          ),
        0
      );

  // Current month returns count
  const currentMonthPaidCount =
    returns.filter((r) => {
      if (!r.month) return false;
      const date = new Date(r.month);
      const now = new Date();
      return (
        r.type === 'monthly' &&
        isPaidStatus(r.status) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

  const currentMonthPendingCount =
    returns.filter((r) => {
      if (!r.month) return false;
      const date = new Date(r.month);
      const now = new Date();
      return (
        r.type === 'monthly' &&
        isPendingStatus(r.status) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

  // Determine current month status
  const getCurrentMonthStatus = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Check if there are any monthly returns for current month
    const currentMonthReturns = returns.filter((r) => {
      if (!r.month || r.type !== 'monthly') return false;
      const date = new Date(r.month);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    if (currentMonthReturns.length === 0) {
      return { 
        label: 'No Current Month', 
        color: 'text-gray-500', 
        icon: DocumentTextIcon,
        subtext: 'No monthly returns for this month'
      };
    }

    const paidInCurrentMonth = currentMonthReturns.filter((r) => 
      isPaidStatus(r.status)
    );
    const pendingInCurrentMonth = currentMonthReturns.filter((r) => 
      isPendingStatus(r.status)
    );

    if (paidInCurrentMonth.length > 0 && pendingInCurrentMonth.length === 0) {
      return { 
        label: 'All Paid', 
        color: 'text-green-600', 
        icon: CheckCircleIcon,
        subtext: `${paidInCurrentMonth.length} returns paid this month`
      };
    }

    if (pendingInCurrentMonth.length > 0 && paidInCurrentMonth.length === 0) {
      return { 
        label: 'All Pending', 
        color: 'text-orange-600', 
        icon: ClockIcon,
        subtext: `${pendingInCurrentMonth.length} returns pending this month`
      };
    }

    if (paidInCurrentMonth.length > 0 && pendingInCurrentMonth.length > 0) {
      return { 
        label: 'Mixed', 
        color: 'text-yellow-600', 
        icon: ClockIcon,
        subtext: `${paidInCurrentMonth.length} paid, ${pendingInCurrentMonth.length} pending`
      };
    }

    return { label: 'Unknown', color: 'text-gray-500', icon: DocumentTextIcon };
  };

  const currentMonthStatus = getCurrentMonthStatus();
  const StatusIcon = currentMonthStatus.icon;

  // Paid returns count (overall)
  const paidReturnsCount =
    returns.filter((r) =>
      isPaidStatus(r.status)
    ).length;

  // Pending returns count (overall)
  const pendingReturnsCount =
    returns.filter((r) =>
      isPendingStatus(r.status)
    ).length;

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />

      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (
    error &&
    returns.length === 0
  ) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">

        <div className="flex justify-center text-red-500 mb-4">

          <ExclamationTriangleIcon className="h-16 w-16" />

        </div>

        <p className="text-red-500 font-medium">
          {error}
        </p>

        <button
          onClick={() =>
            window.location.reload()
          }
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
        >
          Retry
        </button>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0 pb-20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

          {/* LEFT - LOGO */}

          <div className="flex items-center gap-3 sm:gap-4">

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

          {/* RIGHT */}

          <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 min-w-0">

            <div className="text-right">

              <h1 className="text-lg sm:text-2xl font-bold truncate">
                Returns
              </h1>

              <p className="text-blue-100 text-xs sm:text-sm truncate">
                Track your investment returns
              </p>

            </div>

            {/* TOTAL PAID BADGE */}

            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm flex-shrink-0">

              <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />

              <span className="font-semibold text-sm sm:text-base truncate">

                ₹
                {totalPaidReturns.toLocaleString()}

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          STATS CARDS - CURRENT MONTH STATUS
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">

        {/* TOTAL PAID RETURNS */}

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">

          <p className="text-xs sm:text-sm text-gray-500">
            Total Paid Returns
          </p>

          <p className="text-lg sm:text-2xl font-bold text-green-600">

            ₹
            {totalPaidReturns.toLocaleString()}

          </p>

        </div>

        {/* CURRENT MONTH PAID */}

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">

          <p className="text-xs sm:text-sm text-gray-500">
            Current Month Paid
          </p>

          <p className="text-lg sm:text-2xl font-bold text-blue-600">

            ₹
            {currentMonthPaidReturns.toLocaleString()}

          </p>

          {currentMonthPendingReturns > 0 && (
            <p className="text-xs text-orange-500 mt-1">
              Pending: ₹{currentMonthPendingReturns.toLocaleString()}
            </p>
          )}

        </div>

        {/* PAID RETURNS COUNT */}

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">

          <p className="text-xs sm:text-sm text-gray-500">
            Paid Returns
          </p>

          <p className="text-lg sm:text-2xl font-bold text-orange-600">

            {paidReturnsCount}

          </p>

          {pendingReturnsCount > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {pendingReturnsCount} pending
            </p>
          )}

        </div>

        {/* CURRENT MONTH STATUS - DYNAMIC */}

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">

          <p className="text-xs sm:text-sm text-gray-500">
            Current Month Status
          </p>

          <div className="flex flex-col">

            <p className={`text-lg sm:text-2xl font-bold ${currentMonthStatus.color} flex items-center gap-1`}>

              <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6" />

              {currentMonthStatus.label}

            </p>

            {currentMonthStatus.subtext && (
              <p className="text-xs text-gray-400 mt-1">
                {currentMonthStatus.subtext}
              </p>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 sticky top-0 z-10">

        <div className="flex flex-wrap gap-1.5 sm:gap-2">

          {[
            '',
            'monthly',
            'annual_bonus',
            'quarterly_senior',
          ].map((filter) => (

            <button
              key={
                filter || 'all'
              }
              onClick={() =>
                setType(filter)
              }
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                type === filter
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
              }`}
            >

              {filter
                ? getTypeLabel(
                    filter
                  )
                : 'All'}

              {filter && (

                <span className="ml-1 sm:ml-2 text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">

                  {
                    returns.filter(
                      (r) =>
                        r.type ===
                        filter
                    ).length
                  }

                </span>

              )}

            </button>

          ))}

        </div>

      </div>

      {/* =====================================================
          NO RETURNS
      ===================================================== */}

      {returns.length === 0 ? (

        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">

          <div className="flex justify-center text-gray-300 mb-4">

            <DocumentTextIcon className="h-16 w-16" />

          </div>

          <p className="text-gray-500 text-base sm:text-lg">

            No returns found

          </p>

          <p className="text-gray-400 text-xs sm:text-sm mt-2">

            Returns will appear here once processed

          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              RETURNS LIST
          ================================================= */}

          <div className="space-y-3 sm:space-y-4">

            {currentData.map(
              (ret) => {

                const TypeIcon =
                  getTypeIcon(
                    ret.type
                  );

                const typeColor =
                  getTypeColor(
                    ret.type
                  );

                const isBonus =
                  ret.type ===
                  'annual_bonus';

                const isSenior =
                  ret.type ===
                  'quarterly_senior';

                const isPending =
                  isPendingStatus(
                    ret.status
                  );

                const isPaid =
                  isPaidStatus(
                    ret.status
                  );

                const amount =
                  Number.parseFloat(
                    ret.amount || 0
                  );

                return (

                  <div
                    key={ret.id}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >

                    <div className="p-3 sm:p-5">

                      <div className="flex items-start justify-between gap-2">

                        {/* LEFT */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">

                            {/* INVESTMENT CODE */}

                            <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-full">

                              {ret
                                .investment
                                ?.InvestmentCode ||
                                'Return'}

                            </h3>

                            {/* TYPE */}

                            <span
                              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${typeColor} flex-shrink-0`}
                            >

                              <TypeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />

                              {getTypeLabel(
                                ret.type
                              )}

                            </span>

                            {/* STATUS */}

                            {isPending ? (

                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 flex-shrink-0">

                                <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />

                                Pending

                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 border border-green-200 flex-shrink-0">

                                <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />

                                Paid

                              </span>

                            )}

                          </div>

                          {/* DATE INFORMATION */}

                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">

                            {ret.month && (

                              <p className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-0.5 sm:gap-1">

                                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />

                                {new Date(
                                  ret.month
                                ).toLocaleDateString(
                                  'en-US',
                                  {
                                    month:
                                      'long',
                                    year:
                                      'numeric',
                                  }
                                )}

                              </p>

                            )}

                            {/* PAID DATE */}

                            {ret.paidOn &&
                              isPaid && (

                                <p className="text-[10px] sm:text-sm text-gray-400 flex items-center gap-0.5 sm:gap-1">

                                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />

                                  Paid:{' '}

                                  {new Date(
                                    ret.paidOn
                                  ).toLocaleDateString()}

                                </p>

                              )}

                            {/* BONUS */}

                            {isBonus && (

                              <span className="text-[10px] sm:text-xs text-purple-600 font-medium flex items-center gap-1">

                                <GiftIcon className="h-3 w-3" />

                                Bonus

                              </span>

                            )}

                            {/* SENIOR */}

                            {isSenior && (

                              <span className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1">

                                <UserGroupIcon className="h-3 w-3" />

                                Senior Plan

                              </span>

                            )}

                          </div>

                        </div>

                        {/* ===============================
                            AMOUNT
                        =============================== */}

                        <div className="text-right flex-shrink-0">

                          <p
                            className={`text-base sm:text-2xl font-bold ${
                              isPending
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                          >

                            {isPaid
                              ? '+'
                              : ''}

                            ₹
                            {amount.toLocaleString()}

                          </p>

                          <p className="text-[10px] sm:text-xs text-gray-400">

                            {ret.type ===
                            'monthly'
                              ? 'Monthly Return'
                              : ret.type ===
                                'annual_bonus'
                              ? 'Bonus'
                              : ret.type ===
                                'quarterly_senior'
                              ? 'Senior Plan'
                              : 'Return'}

                          </p>

                        </div>

                      </div>

                      {/* ===============================
                          PAYMENT STATUS
                      =============================== */}

                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">

                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-1">

                          <span>
                            Payment Status
                          </span>

                          {isPending ? (

                            <span className="flex items-center gap-1 text-orange-600 font-medium">

                              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />

                              Pending

                            </span>

                          ) : (

                            <span className="flex items-center gap-1 text-green-600 font-medium">

                              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />

                              Completed

                            </span>

                          )}

                        </div>

                        {/* PROGRESS BAR */}

                        <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isPending
                                ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                : 'bg-gradient-to-r from-green-400 to-green-600'
                            }`}
                            style={{
                              width:
                                isPending
                                  ? '50%'
                                  : '100%',
                            }}
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

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

        </>

      )}

    </div>
  );
};

export default Returns;