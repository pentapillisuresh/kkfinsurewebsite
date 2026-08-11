import api from './axios';

export const userApi = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (oldPassword, newPassword) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),

  // User Profile
  getProfile: () => api.get('/users/profile'),
  getDashboard: () => api.get('/users/Dashboard'),

  // Investments
  getInvestments: (params) => api.get('/users/investments', { params }),
  getInvestmentDetails: (id) => api.get(`/users/investments/${id}`),

  // Returns
  getReturns: (params) => api.get('/users/returns', { params }),
  getReturnDetails: (id) => api.get(`/users/returns/${id}`),

  // Balance Sheets
  getBalanceSheets: (params) => api.get('/users/balance-sheet', { params }),
  getBalanceSheetDetails: (id) => api.get(`/users/balance-sheet/${id}`),

  // Documents
  getDocuments: (params) => api.get('/users/documents', { params }),
  getDocumentDetails: (id) => api.get(`/users/documents/${id}`),

  // Referrals
  getReferrals: (params) => api.get('/users/referrals', { params }),
  getReferralDetails: (id) => api.get(`/users/referrals/${id}`),
  getReferralStats: () => api.get('/users/referrals/stats'),

  // Points
  getPoints: () => api.get('/users/points'),
  getPointHistory: (params) => api.get('/users/points/history', { params }),

  // Tickets
  getTickets: (params) => api.get('/users/tickets', { params }),
  getTicketDetails: (id) => api.get(`/users/tickets/${id}`),
  createTicket: (data) => api.post('/users/ticket', data),
};