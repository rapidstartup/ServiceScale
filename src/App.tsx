import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCustomerStore } from './store/customerStore';
import { usePricebookStore } from './store/pricebookStore';
import { useQuoteStore } from './store/quoteStore';
import { useTemplateStore } from './store/templateStore';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PricebookUpload from './components/PricebookUpload';
import CustomerUpload from './components/CustomerUpload';
import QuoteTemplate from './components/QuoteTemplate';
import Templates from './components/Templates';
import TemplateEditor from './components/TemplateEditor';
import Quotes from './components/Quotes';
import NewQuote from './components/NewQuote';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import PasswordReset from './components/PasswordReset';
import AdminDashboard from './components/admin/AdminDashboard';
import Settings from './components/admin/Settings';
import HVACZoneSettings from './components/admin/HVACZoneSettings';
import NewRule from './components/admin/NewRule';
import { Toaster } from 'react-hot-toast';
import QuoteDetail from './components/QuoteDetail';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchCustomers } = useCustomerStore();
  const { fetchEntries } = usePricebookStore();
  const { fetchQuotes } = useQuoteStore();
  const { fetchTemplates } = useTemplateStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers();
      fetchEntries();
      fetchQuotes();
      fetchTemplates();
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/quotes" element={
          <ProtectedRoute>
            <Quotes />
          </ProtectedRoute>
        } />
        <Route path="/quotes/new" element={
          <ProtectedRoute>
            <NewQuote />
          </ProtectedRoute>
        } />
        <Route path="/pricebook" element={
          <ProtectedRoute>
            <PricebookUpload />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <CustomerUpload />
          </ProtectedRoute>
        } />
        <Route path="/templates" element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        } />
        <Route path="/templates/new" element={
          <ProtectedRoute requireAdmin>
            <TemplateEditor />
          </ProtectedRoute>
        } />
        <Route path="/templates/:id" element={
          <ProtectedRoute requireAdmin>
            <TemplateEditor />
          </ProtectedRoute>
        } />
        <Route path="/quotes/:id" element={
          <ProtectedRoute>
            <QuoteTemplate />
          </ProtectedRoute>
        } />
        <Route path="/quote/:id" element={<QuoteDetail />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/admin/hvac-zones" element={
          <ProtectedRoute requireAdmin>
            <HVACZoneSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/new" element={
          <ProtectedRoute requireAdmin>
            <NewRule />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}