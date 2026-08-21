import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const Tickets = () => {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allTickets, setAllTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const itemsPerPage = 20;

  const { data, loading, execute } = useApi(userApi.getTickets, {
    page: page,
    limit: itemsPerPage
  });

  // Append new data when API returns
  useEffect(() => {
    if (data?.tickets) {
      const newTickets = data.tickets || [];
      const totalCount = data.total || 0;
      
      if (page === 1) {
        setAllTickets(newTickets);
      } else {
        setAllTickets(prev => [...prev, ...newTickets]);
      }
      
      const currentTotal = page === 1 ? newTickets.length : allTickets.length + newTickets.length;
      setHasMore(currentTotal < totalCount && newTickets.length === itemsPerPage);
    }
  }, [data]);

  // Reset when new ticket is created
  const refreshTickets = async () => {
    setAllTickets([]);
    setPage(1);
    setHasMore(true);
    await execute();
  };

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && !loadingMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading, loadingMore]);

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

  const tickets = allTickets || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.createTicket({ subject, description });
      setSubject('');
      setDescription('');
      setShowForm(false);
      await refreshTickets();
    } catch (error) {
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: ClockIcon,
      'in-progress': ExclamationTriangleIcon,
      resolved: CheckCircleIcon,
      closed: XMarkIcon,
    };
    return icons[status] || ClockIcon;
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return labels[status] || status;
  };

  // Calculate stats
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <h1 className="text-lg sm:text-2xl font-bold truncate">Support Tickets</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Manage your support requests</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            New Ticket
          </button>
        </div>
        <div className="hidden sm:block mt-1">
          <p className="text-xs text-blue-200 font-medium tracking-wide">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">
            {tickets.length}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Open</p>
            <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600 mt-1 sm:mt-2">
            {openTickets}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">
            {inProgressTickets}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">Resolved</p>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
            {resolvedTickets}
          </p>
        </div>
      </div>

      {/* Create Ticket Form - Premium */}
      {showForm && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                Create New Ticket
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Submit your support request</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <DocumentTextIcon className="h-4 w-4" />
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter ticket subject"
                required
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Describe your issue in detail"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    Create Ticket
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center text-gray-300 mb-4">
            <DocumentTextIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No support tickets</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Create a ticket for any support request</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow flex items-center gap-2 mx-auto"
          >
            <PlusIcon className="h-4 w-4" />
            Create Ticket
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const statusColor = getStatusColor(ticket.status);
              
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-full">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusColor} flex-shrink-0`}
                          >
                            <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                          <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-0.5 sm:gap-1">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                          {ticket.resolution && (
                            <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-0.5 sm:gap-1">
                              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              Resolved
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {ticket.status === 'open' && (
                          <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-blue-100 transition flex items-center gap-1">
                            <span>Respond</span>
                            <ArrowRightIcon className="h-3 w-3" />
                          </button>
                        )}
                        {ticket.status === 'resolved' && (
                          <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-green-100 transition">
                            View Resolution
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                        <span>Ticket Status</span>
                        <span className={`flex items-center gap-1 ${
                          ticket.status === 'resolved' ? 'text-green-600' : 
                          ticket.status === 'open' ? 'text-yellow-600' : 
                          ticket.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          <StatusIcon className="h-3 w-3" />
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            ticket.status === 'resolved' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            ticket.status === 'in-progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            ticket.status === 'open' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-gray-400 to-gray-600'
                          }`}
                          style={{ 
                            width: ticket.status === 'resolved' ? '100%' : 
                                   ticket.status === 'in-progress' ? '60%' : 
                                   ticket.status === 'open' ? '30%' : '20%' 
                          }}
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
                <span className="text-sm text-gray-500">Loading more tickets...</span>
              </div>
            )}
            {!hasMore && tickets.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">You've seen all {tickets.length} tickets</p>
              </div>
            )}
            {!loadingMore && hasMore && tickets.length >= 20 && (
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

export default Tickets;