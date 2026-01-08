import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await quotationAPI.getAll();
      const quotations = response.data;

      // Calculate statistics
      const stats = {
        total: quotations.length,
        draft: quotations.filter(q => q.quotation_status === 'Draft').length,
        submitted: quotations.filter(q => q.quotation_status === 'Submitted').length,
        approved: quotations.filter(q => q.quotation_status === 'Approved').length,
        rejected: quotations.filter(q => q.quotation_status === 'Rejected').length
      };

      setStats(stats);
      setRecentQuotations(quotations.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '2rem', color: '#1e3c72' }}>Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="summary-card">
          <h3>Total Quotations</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="summary-card" style={{ borderLeftColor: '#6c757d' }}>
          <h3>Draft</h3>
          <div className="value">{stats.draft}</div>
        </div>
        <div className="summary-card" style={{ borderLeftColor: '#17a2b8' }}>
          <h3>Submitted</h3>
          <div className="value">{stats.submitted}</div>
        </div>
        <div className="summary-card" style={{ borderLeftColor: '#28a745' }}>
          <h3>Approved</h3>
          <div className="value">{stats.approved}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/quotations/new">
              <button className="btn btn-primary">Create New Quotation</button>
            </Link>
            <Link to="/quotations">
              <button className="btn btn-secondary">View All Quotations</button>
            </Link>
            <Link to="/machines">
              <button className="btn btn-secondary">Manage Machines</button>
            </Link>
            <Link to="/customers">
              <button className="btn btn-secondary">Manage Customers</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Quotations */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Quotations</h2>
          <Link to="/quotations">
            <button className="btn btn-secondary btn-small">View All</button>
          </Link>
        </div>
        <div className="card-body">
          {recentQuotations.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No quotations found. Create your first quotation to get started.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Quote Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((quotation) => (
                  <tr key={quotation.quotation_id}>
                    <td><strong>{quotation.quote_number}</strong></td>
                    <td>{quotation.company_name}</td>
                    <td>{new Date(quotation.quotation_date).toLocaleDateString()}</td>
                    <td>
                      {quotation.currency} {parseFloat(quotation.total_quote_value).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${quotation.quotation_status.toLowerCase()}`}>
                        {quotation.quotation_status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/quotations/${quotation.quotation_id}`}>
                        <button className="btn btn-primary btn-small">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
