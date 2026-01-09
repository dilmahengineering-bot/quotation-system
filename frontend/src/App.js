import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import MachineList from './components/Machines/MachineList';
import CustomerList from './components/Customers/CustomerList';
import AuxiliaryCostList from './components/AuxiliaryCosts/AuxiliaryCostList';
import QuotationList from './components/Quotations/QuotationList';
import QuotationForm from './components/Quotations/QuotationForm';
import QuotationView from './components/Quotations/QuotationView';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app">
        {user && (
          <nav className="navbar">
            <div className="navbar-brand">
              <h1>Quotation Management System</h1>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.9 }}>
                Welcome, {user.full_name} ({user.role})
              </p>
            </div>
            <ul className="navbar-menu">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/quotations">Quotations</Link></li>
              <li><Link to="/machines">Machines</Link></li>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/auxiliary-costs">Auxiliary Costs</Link></li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-small"
                  style={{ padding: '0.4rem 1rem' }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}

        <main className={user ? "main-content" : ""}>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/machines" element={
              <ProtectedRoute>
                <MachineList />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            } />
            <Route path="/auxiliary-costs" element={
              <ProtectedRoute>
                <AuxiliaryCostList />
              </ProtectedRoute>
            } />
            <Route path="/quotations" element={
              <ProtectedRoute>
                <QuotationList />
              </ProtectedRoute>
            } />
            <Route path="/quotations/new" element={
              <ProtectedRoute>
                <QuotationForm />
              </ProtectedRoute>
            } />
            <Route path="/quotations/:id" element={
              <ProtectedRoute>
                <QuotationView />
              </ProtectedRoute>
            } />
            <Route path="/quotations/:id/edit" element={
              <ProtectedRoute>
                <QuotationForm />
              </ProtectedRoute>
            } />

            {/* Redirect unknown routes to dashboard or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
