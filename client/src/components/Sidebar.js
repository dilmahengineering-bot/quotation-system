import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconDashboard, IconQuotation, IconMachine, IconCustomer, IconAuxCost } from './Icons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">QM</div>
          <div className="logo-text">
            QuotePro
            <span>Management System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconDashboard />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Quotations</div>
          <NavLink to="/quotations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconQuotation />
            <span>All Quotations</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Master Data</div>
          <NavLink to="/machines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconMachine />
            <span>Machines</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconCustomer />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/auxiliary-costs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconAuxCost />
            <span>Auxiliary Costs</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{user.full_name || user.username}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.role || 'User'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
