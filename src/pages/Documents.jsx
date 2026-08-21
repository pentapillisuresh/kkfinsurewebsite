import React, { useState, useEffect } from 'react';
import { userApi } from '../api';
import {
  DocumentTextIcon,
  PhotoIcon,
  IdentificationIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
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
      case 'company':
        return <FolderIcon className="h-5 w-5" />;
      default:
        return <PaperClipIcon className="h-5 w-5" />;
    }
  };

  const getIconColor = (type) => {
    const colors = {
      kyc: 'bg-blue-50 text-blue-600',
      agreement: 'bg-purple-50 text-purple-600',
      certificate: 'bg-green-50 text-green-600',
      postcheque: 'bg-orange-50 text-orange-600',
      company: 'bg-indigo-50 text-indigo-600',
      other: 'bg-gray-50 text-gray-600',
    };
    return colors[type] || 'bg-gray-50 text-gray-600';
  };

  const getTypeLabel = (type) => {
    const labels = {
      kyc: 'KYC Document',
      agreement: 'Agreement',
      certificate: 'Certificate',
      postcheque: 'Post-Cheque',
      company: 'Company Document',
      other: 'Other Document',
    };
    return labels[type] || type;
  };

  const getTabIcon = (tabId) => {
    const icons = {
      kyc: IdentificationIcon,
      agreement: DocumentTextIcon,
      certificate: DocumentTextIcon,
      postcheque: DocumentTextIcon,
      company: FolderIcon,
      other: PaperClipIcon,
    };
    return icons[tabId] || PaperClipIcon;
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

  // Get count for each tab
  const getTabCount = (tabId) => {
    if (tabId === 'kyc') return documents.filter(d => d.type === 'kyc').length;
    if (tabId === 'company') return documents.filter(d => d.type === 'company').length;
    if (tabId === 'other') return documents.filter(d => d.type === 'other').length;
    if (tabId === 'agreement') return investments.filter(inv => inv.agreementDoc).length;
    if (tabId === 'certificate') return investments.filter(inv => inv.certificateDoc).length;
    if (tabId === 'postcheque') return investments.filter(inv => inv.postChequeDoc).length;
    return 0;
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
              <h1 className="text-lg sm:text-2xl font-bold truncate">Documents</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">Manage all your important documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
            <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              {filteredDocs.length} Documents
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const count = getTabCount(tab.id);
          const TabIcon = getTabIcon(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-1.5 sm:p-2 rounded-lg ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <TabIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <p className={`text-[8px] sm:text-xs font-medium mt-0.5 sm:mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </p>
                <p className={`text-xs sm:text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                  {count}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center text-gray-300 mb-4">
            <DocumentTextIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No documents found</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">No documents available for "{getTypeLabel(activeTab)}" category</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-3 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-xl ${getIconColor(doc.type)} flex-shrink-0`}>
                      {getIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <p className="font-semibold text-gray-800 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-full">
                          {doc.title}
                        </p>
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                          <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Available
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                        <p className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <PaperClipIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {getTypeLabel(doc.type)}
                        </p>
                        <p className="text-[10px] sm:text-sm text-gray-400 flex items-center gap-0.5 sm:gap-1">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        {doc.investment && (
                          <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-0.5 sm:gap-1">
                            <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {doc.investment.InvestmentCode || doc.investment.id.slice(0,8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 group-hover:shadow-md text-xs sm:text-sm font-medium"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Download</span>
                    </a>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                    <span>Document Status</span>
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3 text-green-500" />
                      Verified
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;