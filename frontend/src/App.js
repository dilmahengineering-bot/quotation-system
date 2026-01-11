import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Layout from './components/common/Layout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import QuotationsList from './components/Quotations/QuotationsList';
import QuotationForm from './components/Quotations/QuotationForm';
import QuotationDetail from './components/Quotations/QuotationDetail';
import CustomersList from './components/masters/CustomersList';
import MachinesList from './components/masters/MachinesList';
import AuxiliaryCostsList from './components/masters/AuxiliaryCostsList';
import UsersList from './components/masters/UsersList';

// Protected Route Component
const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Quotations */}
      <Route 
        path="/quotations" 
        element={
          <ProtectedRoute permission="quotations:read">
            <QuotationsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quotations/new" 
        element={
          <ProtectedRoute permission="quotations:create">
            <QuotationForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quotations/:id" 
        element={
          <ProtectedRoute permission="quotations:read">
            <QuotationDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quotations/:id/edit" 
        element={
          <ProtectedRoute permission="quotations:update">
            <QuotationForm />
          </ProtectedRoute>
        } 
      />

      {/* Customers */}
      <Route 
        path="/customers" 
        element={
          <ProtectedRoute permission="customers:read">
            <CustomersList />
          </ProtectedRoute>
        } 
      />

      {/* Machines */}
      <Route 
        path="/machines" 
        element={
          <ProtectedRoute permission="machines:read">
            <MachinesList />
          </ProtectedRoute>
        } 
      />

      {/* Auxiliary Costs */}
      <Route 
        path="/auxiliary-costs" 
        element={
          <ProtectedRoute permission="auxiliary:read">
            <AuxiliaryCostsList />
          </ProtectedRoute>
        } 
      />

      {/* Users */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute permission="users:read">
            <UsersList />
          </ProtectedRoute>
        } 
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
