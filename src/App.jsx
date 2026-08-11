import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import MobileLayout from './components/layouts/MobileLayout';
import DesktopLayout from './components/layouts/DesktopLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import InvestmentDetails from './pages/InvestmentDetails';
import Returns from './pages/Returns';
import ReturnDetails from './pages/ReturnDetails';
import Profile from './pages/Profile';
import BalanceSheet from './pages/BalanceSheet';
import Documents from './pages/Documents';
import DocumentDetails from './pages/DocumentDetails';
import Referrals from './pages/Referrals';
import ReferralDetails from './pages/ReferralDetails';
import Points from './pages/Points';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import Settings from './pages/Settings';
import { useWindowSize } from './hooks/useWindowSize';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { width } = useWindowSize();
  const isDesktop = width >= 768;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const Layout = isDesktop ? DesktopLayout : MobileLayout;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/investments/:id" element={<InvestmentDetails />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/returns/:id" element={<ReturnDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/balance-sheet" element={<BalanceSheet />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/referrals/:id" element={<ReferralDetails />} />
          <Route path="/points" element={<Points />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;