import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tickets } = useApi(userApi.getTickets);
  const ticket = tickets?.tickets?.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found</p>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">{ticket.subject}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-700 mt-1">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm text-gray-700">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-700">
                {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {ticket.resolution && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Resolution</p>
              <p className="text-sm text-green-700 mt-1">{ticket.resolution}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;