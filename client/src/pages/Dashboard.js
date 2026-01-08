import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationApi, machineApi, customerApi, auxiliaryCostApi } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';
import { IconDocument, IconUsers, IconGear, IconTrendingUp, IconPlus, IconEye } from '../components/Icons';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalCustomers: 0,
    totalMachines: 0,
    totalValue: 0,
  });
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quotationsRes, customersRes, machinesRes] = await Promise.all([
        quotationApi.getAll(),
        customerApi.getAll({ activeOnly: true }),
        machineApi.getAll(true),
      ]);

      const quotations = quotationsRes.data;
      const totalValue = quotations.reduce((sum, q) => sum + parseFloat(q.total_quote_value || 0), 0);

      setStats({
        totalQuotations: quotations.length,
        totalCustomers: customersRes.data.length,
        totalMachines: machinesRes.data.length,
        totalValue: totalValue,
      });

      setRecentQuotations(quotations.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your quotation management system</p>
        </div>
        <Link to="/quotations/new" className="btn btn-accent">
          <IconPlus /> New Quotation
        </Link>
      </div>

      <div className="page-content">
        {/* Stats Grid */}
        <div className="grid grid-4 mb-lg">
          <div className="stat-card blue">
            <div className="stat-icon">
              <IconDocument />
            </div>
            <div className="stat-value">{stats.totalQuotations}</div>
            <div className="stat-label">Total Quotations</div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <IconTrendingUp />
            </div>
            <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
            <div className="stat-label">Total Quote Value</div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <IconUsers />
            </div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Active Customers</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <IconGear />
            </div>
            <div className="stat-value">{stats.totalMachines}</div>
            <div className="stat-label">Active Machines</div>
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Quotations</h3>
            <Link to="/quotations" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentQuotations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No quotations yet</div>
                <div className="empty-state-text">Create your first quotation to get started</div>
                <Link to="/quotations/new" className="btn btn-primary">
                  <IconPlus /> Create Quotation
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quotation #</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total Value</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotations.map((quotation) => (
                      <tr key={quotation.quotation_id}>
                        <td>
                          <span className="font-mono">{quotation.quotation_number}</span>
                        </td>
                        <td>{quotation.company_name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(quotation.status)}`}>
                            {quotation.status}
                          </span>
                        </td>
                        <td>
                          <span className="cost">{parseFloat(quotation.total_quote_value || 0).toFixed(2)}</span>
                        </td>
                        <td className="text-muted">{formatDate(quotation.created_at)}</td>
                        <td>
                          <Link
                            to={`/quotations/${quotation.quotation_id}`}
                            className="btn btn-secondary btn-sm btn-icon"
                            title="View"
                          >
                            <IconEye />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
