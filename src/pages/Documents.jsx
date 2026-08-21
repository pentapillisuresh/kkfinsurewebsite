import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import {
  DocumentTextIcon,
  PhotoIcon,IdentificationIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const Documents = () => {
  const [type, setType] = useState('');
  const { data, loading } = useApi(userApi.getDocuments, { type });

  const documents = data || [];

  const getIcon = (type) => {
    switch (type) { 
      case 'kyc':
        return <IdentificationIcon className="h-5 w-5" />;
      case 'agreement':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <PaperClipIcon className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      kyc: 'KYC',
      agreement: 'Agreement',
      company: 'Company',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Documents</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'kyc', 'agreement', 'company', 'other'].map((filter) => (
          <button
            key={filter || 'all'}
            onClick={() => setType(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              type === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter ? getTypeLabel(filter) : 'All'}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No documents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getIcon(doc.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{doc.title}</p>
                    <p className="text-sm text-gray-500">
                      {getTypeLabel(doc.type)} •{' '}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;