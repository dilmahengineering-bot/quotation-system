import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationAPI } from '../../services/api';

function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await quotationAPI.getAll();
      setQuotations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await quotationAPI.delete(id);
        fetchQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Error deleting quotation');
      }
    }
  };

  const handleExportList = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/quotations/export/excel/list`, '_blank');
  };

  const filteredQuotations = filterStatus === 'All'
    ? quotations
    : quotations.filter(q => q.quotation_status === filterStatus);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Quotations</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={handleExportList}
              title="Export all quotations to Excel"
            >
              📊 Export List
            </button>
            <Link to="/quotations/new">
              <button className="btn btn-primary">Create New Quotation</button>
            </Link>
          </div>
        </div>
        <div className="card-body">
          {/* Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Filter by Status:</label>
            <select
              className="form-control form-control-small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Quotations Table */}
          {filteredQuotations.length === 0 ? (
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
                  <th>Currency</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.quotation_id}>
                    <td>
                      <strong>{quotation.quote_number}</strong>
                    </td>
                    <td>{quotation.company_name}</td>
                    <td>{new Date(quotation.quotation_date).toLocaleDateString()}</td>
                    <td>{quotation.currency}</td>
                    <td>
                      <strong>
                        {quotation.currency} {parseFloat(quotation.total_quote_value).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge badge-${quotation.quotation_status.toLowerCase()}`}>
                        {quotation.quotation_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/quotations/${quotation.quotation_id}`}>
                          <button className="btn btn-primary btn-small">View</button>
                        </Link>
                        {quotation.quotation_status === 'Draft' && (
                          <>
                            <Link to={`/quotations/${quotation.quotation_id}/edit`}>
                              <button className="btn btn-warning btn-small">Edit</button>
                            </Link>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleDelete(quotation.quotation_id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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

export default QuotationList;
