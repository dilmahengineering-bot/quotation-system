import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Master Data Components
import MachineList from './components/Masters/MachineList';
import CustomerList from './components/Masters/CustomerList';
import AuxiliaryCostList from './components/Masters/AuxiliaryCostList';
import UserList from './components/Masters/UserList';

// Quotation Components
import QuotationList from './components/Quotations/QuotationList';
import QuotationForm from './components/Quotations/QuotationForm';
import QuotationView from './components/Quotations/QuotationView';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Protected Route Component
const ProtectedRoute = ({ children, requiredLevel }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredLevel && !requiredLevel.includes(user.user_level)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`content-area ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        
        {/* Master Data Routes */}
        <Route path="/machines" element={<ProtectedRoute><Layout><MachineList /></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><CustomerList /></Layout></ProtectedRoute>} />
        <Route path="/auxiliary-costs" element={<ProtectedRoute><Layout><AuxiliaryCostList /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute requiredLevel={['admin', 'approver']}><Layout><UserList /></Layout></ProtectedRoute>} />
        
        {/* Quotation Routes */}
        <Route path="/quotations" element={<ProtectedRoute><Layout><QuotationList /></Layout></ProtectedRoute>} />
        <Route path="/quotations/new" element={<ProtectedRoute><Layout><QuotationForm /></Layout></ProtectedRoute>} />
        <Route path="/quotations/edit/:id" element={<ProtectedRoute><Layout><QuotationForm /></Layout></ProtectedRoute>} />
        <Route path="/quotations/view/:id" element={<ProtectedRoute><Layout><QuotationView /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
