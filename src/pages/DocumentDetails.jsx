import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import { ArrowLeftIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: documents } = useApi(userApi.getDocuments);
  const document = documents?.find(d => d.id === id);

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Document not found</p>
        <button
          onClick={() => navigate('/documents')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const getTypeLabel = (type) => {
    const labels = {
      kyc: 'KYC Document',
      agreement: 'Agreement',
      company: 'Company Document',
      other: 'Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            <DocumentTextIcon className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{document.title}</h1>
            <p className="text-sm text-gray-500">{getTypeLabel(document.type)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Uploaded By</p>
              <p className="font-medium text-gray-800">
                {document.uploader?.fullName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Uploaded On</p>
              <p className="font-medium text-gray-800">
                {new Date(document.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <a
              href={document.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download Document
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;