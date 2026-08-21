import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  DocumentArrowDownIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const BalanceSheet = () => {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [allSheets, setAllSheets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const itemsPerPage = 20;

  const { data, loading, error } = useApi(userApi.getBalanceSheets, { 
    periodStart, 
    periodEnd,
    page: page,
    limit: itemsPerPage 
  });

  // Reset when filters change
  useEffect(() => {
    setAllSheets([]);
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);
  }, [periodStart, periodEnd]);

  // Append new data when API returns
  useEffect(() => {
    if (data?.balanceSheets) {
      const newSheets = data.balanceSheets || [];
      const totalCount = data.total || 0;
      
      if (page === 1) {
        setAllSheets(newSheets);
      } else {
        setAllSheets(prev => [...prev, ...newSheets]);
      }
      
      const currentTotal = page === 1 ? newSheets.length : allSheets.length + newSheets.length;
      setHasMore(currentTotal < totalCount && newSheets.length === itemsPerPage);
    }
  }, [data]);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && !loadingMore && !error) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading, loadingMore, error]);

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

  useEffect(() => {
    if (data && loadingMore) {
      setLoadingMore(false);
    }
  }, [data]);

  const balanceSheets = allSheets || [];

  // Calculate summary stats - Fixed to handle undefined values
  const totalNetWorth = balanceSheets.reduce((sum, sheet) => sum + (parseFloat(sheet.netWorth) || 0), 0);
  const totalInvestments = balanceSheets.reduce((sum, sheet) => sum + (parseFloat(sheet.totalInvestments) || 0), 0);
  const totalReturns = balanceSheets.reduce((sum, sheet) => sum + (parseFloat(sheet.totalReturns) || 0), 0);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && balanceSheets.length === 0) {
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
              <h1 className="text-lg sm:text-2xl font-bold truncate">Balance Sheets</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Track your financial statements</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              ₹{totalNetWorth.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards - Fixed formatting */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-gray-500">Total Net Worth</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
            ₹{totalNetWorth.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-gray-500">Total Investments</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
            ₹{totalInvestments.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-gray-500">Total Returns</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
            ₹{totalReturns.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-gray-500">Total Sheets</p>
          <p className="text-lg sm:text-2xl font-bold text-orange-600">
            {balanceSheets.length}
          </p>
        </div>
      </div>

      {/* Filters - Original logic preserved */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 sticky top-0 z-10">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              From
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              To
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Balance Sheets List */}
      {balanceSheets.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center text-gray-300 mb-4">
            <DocumentTextIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No balance sheets available</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Adjust filters to find your statements</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {balanceSheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="p-3 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-full">
                          Balance Sheet
                        </h3>
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Generated
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                        <p className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(sheet.periodStart).toLocaleDateString()} -{' '}
                          {new Date(sheet.periodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] sm:text-sm text-gray-400 flex items-center gap-0.5 sm:gap-1">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(sheet.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Net Worth</p>
                      <p className="text-base sm:text-2xl font-bold text-green-600">
                        ₹{parseFloat(sheet.netWorth || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid - Original logic preserved */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                        <ChartBarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Investments
                      </p>
                      <p className="font-semibold text-gray-800 text-[10px] sm:text-sm truncate">
                        ₹{parseFloat(sheet.totalInvestments || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                        <ArrowTrendingUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Returns
                      </p>
                      <p className="font-semibold text-blue-600 text-[10px] sm:text-sm truncate">
                        ₹{parseFloat(sheet.totalReturns || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                        <UserGroupIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Commission
                      </p>
                      <p className="font-semibold text-purple-600 text-[10px] sm:text-sm truncate">
                        ₹{parseFloat(sheet.totalCommission || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Download - Original logic preserved */}
                  {sheet.balanceSheetFile && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                          <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">PDF Document</span>
                      </div>
                      <a
                        href={sheet.balanceSheetFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
                      >
                        <span>Download</span>
                        <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loader for infinite scroll */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingMore && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Loading more sheets...</span>
              </div>
            )}
            {!hasMore && balanceSheets.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">You've seen all {balanceSheets.length} balance sheets</p>
              </div>
            )}
            {!loadingMore && hasMore && balanceSheets.length >= 20 && (
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

export default BalanceSheet;