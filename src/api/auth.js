import api from './axios';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (oldPassword, newPassword) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  getDashboard: () => api.get('/users/Dashboard'),
  getInvestments: (params) => api.get('/users/investments', { params }),
  getBalanceSheets: (params) => api.get('/users/balance-sheet', { params }),
  getDocuments: (params) => api.get('/users/documents', { params }),
  getReturns: (params) => api.get('/users/returns', { params }),
  getReferrals: (params) => api.get('/users/referrals', { params }),
  getPoints: () => api.get('/users/points'),
  getTickets: (params) => api.get('/users/tickets', { params }),
  createTicket: (data) => api.post('/users/ticket', data),
};