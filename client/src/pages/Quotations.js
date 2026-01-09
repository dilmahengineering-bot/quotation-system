import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quotationApi } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeClass, QUOTATION_STATUSES } from '../utils/helpers';
import { IconPlus, IconEye, IconEdit, IconTrash } from '../components/Icons';
import Loading from '../components/Loading';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const fetchQuotations = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await quotationApi.getAll(params);
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await quotationApi.delete(id);
      toast.success('Quotation deleted successfully');
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await quotationApi.updateStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loading text="Loading quotations..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Manage all your quotations</p>
        </div>
        <div className="flex gap-md items-center">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            {QUOTATION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Link to="/quotations/new" className="btn btn-accent">
            <IconPlus /> New Quotation
          </Link>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {quotations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No quotations found</div>
                <div className="empty-state-text">
                  {statusFilter ? 'No quotations with this status' : 'Create your first quotation to get started'}
                </div>
                {!statusFilter && (
                  <Link to="/quotations/new" className="btn btn-primary">
                    <IconPlus /> Create Quotation
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quotation #</th>
                      <th>Customer</th>
                      <th>Subtotal</th>
                      <th>Margin</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => (
                      <tr key={quotation.quotation_id}>
                        <td>
                          <Link to={`/quotations/${quotation.quotation_id}`} className="font-mono" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                            {quotation.quotation_number}
                          </Link>
                        </td>
                        <td>{quotation.company_name || 'N/A'}</td>
                        <td><span className="cost">{parseFloat(quotation.subtotal || 0).toFixed(2)}</span></td>
                        <td>
                          <span className="text-muted">{parseFloat(quotation.margin_percent || 0).toFixed(1)}%</span>
                          <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: '4px' }}>
                            ({formatCurrency(quotation.margin_amount || 0)})
                          </span>
                        </td>
                        <td><span className="cost font-bold">{parseFloat(quotation.total_quote_value || 0).toFixed(2)}</span></td>
                        <td>
                          <select
                            className="form-select"
                            value={quotation.status || 'Draft'}
                            onChange={(e) => handleStatusChange(quotation.quotation_id, e.target.value)}
                            style={{ padding: '4px 24px 4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          >
                            {QUOTATION_STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-muted">{formatDate(quotation.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/quotations/${quotation.quotation_id}`} className="btn btn-secondary btn-sm btn-icon" title="View">
                              <IconEye />
                            </Link>
                            <Link to={`/quotations/${quotation.quotation_id}/edit`} className="btn btn-secondary btn-sm btn-icon" title="Edit">
                              <IconEdit />
                            </Link>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(quotation.quotation_id)} title="Delete">
                              <IconTrash />
                            </button>
                          </div>
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

export default Quotations;
