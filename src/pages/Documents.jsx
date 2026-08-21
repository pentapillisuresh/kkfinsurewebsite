import React, { useState, useEffect } from 'react';
import { userApi } from '../api';
import {
  DocumentTextIcon,
  PhotoIcon,
  IdentificationIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('kyc');
  const [documents, setDocuments] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch documents and investments in parallel
        const [docRes, invRes] = await Promise.all([
          userApi.getDocuments({ type: activeTab === 'kyc' ? 'kyc' : activeTab === 'company' ? 'company' : 'other' }),
          userApi.getInvestments({ limit: 100 }),
        ]);
        if (docRes.data.success) {
          console.log("DocData inside::",docRes.data.data);
          setDocuments(docRes.data.data || []);
        } else {
          setError(docRes.message || 'Failed to fetch documents');
        }
        
        if (invRes.data.success) {
          console.log("InvestData inside::",invRes.data.data.investments);
          setInvestments(invRes.data.data.investments || []);
        } else {
          // Don't set error for investments; just log
          console.warn('Failed to fetch investments:', invRes.message);
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Build document list based on active tab
  const getFilteredDocuments = () => {
    if (activeTab === 'kyc') {
      return documents.filter(d => d.type === 'kyc');
    } else if (activeTab === 'company') {
      return documents.filter(d => d.type === 'company');
    } else if (activeTab === 'other') {
      return documents.filter(d => d.type === 'other');
    } else if (activeTab === 'agreement') {
      // Flatten investments with agreementDoc
      return investments
        .filter(inv => inv.agreementDoc)
        .map(inv => ({
          id: inv.id + '-agreement',
          title: `Agreement - ${inv.InvestmentCode || inv.id.slice(0,8)}`,
          type: 'agreement',
          filePath: inv.agreementDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    } else if (activeTab === 'certificate') {
      return investments
        .filter(inv => inv.certificateDoc)
        .map(inv => ({
          id: inv.id + '-certificate',
          title: `Certificate - ${inv.InvestmentCode || inv.id.slice(0,8)}`,
          type: 'certificate',
          filePath: inv.certificateDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    } else if (activeTab === 'postcheque') {
      return investments
        .filter(inv => inv.postChequeDoc)
        .map(inv => ({
          id: inv.id + '-postcheque',
          title: `Post-Cheque - ${inv.InvestmentCode || inv.id.slice(0,8)}`,
          type: 'postcheque',
          filePath: inv.postChequeDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    }
    return [];
  };

  const filteredDocs = getFilteredDocuments();

  const getIcon = (type) => {
    switch (type) {
      case 'kyc':
        return <IdentificationIcon className="h-5 w-5" />;
      case 'agreement':
      case 'certificate':
      case 'postcheque':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <PaperClipIcon className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      kyc: 'KYC',
      agreement: 'Agreement',
      certificate: 'Certificate',
      postcheque: 'Post-Cheque',
      company: 'Company',
      other: 'Other',
    };
    return labels[type] || type;
  };

  // Tab definitions
  const tabs = [
    { id: 'kyc', label: 'KYC' },
    { id: 'agreement', label: 'Agreement' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'postcheque', label: 'Post-Cheque' },
    { id: 'company', label: 'Company' },
    { id: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Documents</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No documents found for this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
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
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {doc.investment && (
                      <p className="text-xs text-gray-400">
                        Investment: {doc.investment.InvestmentCode || doc.investment.id.slice(0,8)}
                      </p>
                    )}
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