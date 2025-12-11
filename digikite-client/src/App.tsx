import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAppDispatch } from './hooks/useAppDispatch';
import { store } from './store';
import { getCurrentUser } from './slices/authSlice';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import GuildPage from './pages/GuildPage';
import ELibPage from './pages/ELibPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';

// Admin pages
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import DemoRequests from './pages/admin/DemoRequests';
import Clients from './pages/admin/Clients';
import Subscriptions from './pages/admin/Subscriptions';
import Plans from './pages/admin/Plans';
import Invoices from './pages/admin/Invoices';
import Payments from './pages/admin/Payments';

// Client Portal pages
import ClientRoute from './components/common/ClientRoute';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientSubscription from './pages/client/ClientSubscription';
import ClientInvoices from './pages/client/ClientInvoices';
import ClientPayments from './pages/client/ClientPayments';
import GuildAccess from './pages/client/GuildAccess';

const AppContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<HomePage />} />
        {/* Redirect old routes to portal */}
        <Route path="/dashboard" element={<Navigate to="/portal" replace />} />
        <Route path="/profile" element={<Navigate to="/portal" replace />} />
        <Route path="/products/guild" element={<GuildPage />} />
        <Route path="/products/elib" element={<ELibPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/demos" element={<AdminRoute><DemoRequests /></AdminRoute>} />
        <Route path="/admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute><Subscriptions /></AdminRoute>} />
        <Route path="/admin/plans" element={<AdminRoute><Plans /></AdminRoute>} />
        <Route path="/admin/invoices" element={<AdminRoute><Invoices /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><Payments /></AdminRoute>} />

        {/* Client Portal Routes */}
        <Route path="/portal" element={<ClientRoute><ClientDashboard /></ClientRoute>} />
        <Route path="/portal/subscription" element={<ClientRoute><ClientSubscription /></ClientRoute>} />
        <Route path="/portal/invoices" element={<ClientRoute><ClientInvoices /></ClientRoute>} />
        <Route path="/portal/payments" element={<ClientRoute><ClientPayments /></ClientRoute>} />
        <Route path="/portal/guild" element={<ClientRoute><GuildAccess /></ClientRoute>} />
      </Routes>
      <ThemedToaster />
    </Router>
  );
};

// Toaster that respects theme
const ThemedToaster = () => {
  const { actualTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: actualTheme === 'dark' ? '#1e293b' : '#ffffff',
          color: actualTheme === 'dark' ? '#e2e8f0' : '#374151',
          border: actualTheme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
        },
      }}
    />
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;