import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconDashboard, IconQuotation, IconMachine, IconCustomer, IconAuxCost } from './Icons';

const Sidebar = () => {
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
    </aside>
  );
};

export default Sidebar;
