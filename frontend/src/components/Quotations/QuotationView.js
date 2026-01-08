import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotationAPI } from '../../services/api';

function QuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await quotationAPI.getById(id);
      setQuotation(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      try {
        await quotationAPI.updateStatus(id, newStatus);
        fetchQuotation();
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await quotationAPI.delete(id);
        navigate('/quotations');
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Error deleting quotation');
      }
    }
  };

  const handleExportPDF = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/quotations/${id}/export/pdf`, '_blank');
  };

  const handleExportExcel = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/quotations/${id}/export/excel`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="card">
        <div className="card-body">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Quotation not found</p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/quotations">
              <button className="btn btn-primary">Back to Quotations</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Quotation Details</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
              Quote Number: <strong>{quotation.quote_number}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Export Buttons */}
            <button
              className="btn btn-secondary"
              onClick={handleExportPDF}
              title="Export as PDF"
            >
              📄 Export PDF
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleExportExcel}
              title="Export as Excel"
            >
              📊 Export Excel
            </button>
            
            {quotation.quotation_status === 'Draft' && (
              <>
                <Link to={`/quotations/${id}/edit`}>
                  <button className="btn btn-warning">Edit</button>
                </Link>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange('Submitted')}
                >
                  Submit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}
            {quotation.quotation_status === 'Submitted' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange('Approved')}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleStatusChange('Rejected')}
                >
                  Reject
                </button>
              </>
            )}
            <Link to="/quotations">
              <button className="btn btn-secondary">Back to List</button>
            </Link>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="card">
        <div className="card-header">
          <h3>General Information</h3>
          <span className={`badge badge-${quotation.quotation_status.toLowerCase()}`}>
            {quotation.quotation_status}
          </span>
        </div>
        <div className="card-body">
          <div className="grid-3">
            <div>
              <strong style={{ color: '#6c757d' }}>Customer:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.company_name}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Contact Person:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.contact_person_name || 'N/A'}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Email:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.email}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Phone:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.phone || 'N/A'}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Quotation Date:</strong>
              <p style={{ marginTop: '0.25rem' }}>
                {new Date(quotation.quotation_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Currency:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.currency}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Lead Time:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.lead_time || 'N/A'}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Payment Terms:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.payment_terms || 'N/A'}</p>
            </div>
            <div>
              <strong style={{ color: '#6c757d' }}>Shipment Type:</strong>
              <p style={{ marginTop: '0.25rem' }}>{quotation.shipment_type || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parts Details */}
      <div className="card">
        <div className="card-header">
          <h3>Parts Breakdown</h3>
        </div>
        <div className="card-body">
          {quotation.parts && quotation.parts.map((part, index) => (
            <div key={part.part_id} className="part-section">
              <div className="part-header">
                <h4 style={{ color: '#2a5298' }}>
                  Part #{index + 1}: {part.part_number}
                </h4>
              </div>

              {part.part_description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#6c757d' }}>Description:</strong>
                  <p style={{ marginTop: '0.25rem' }}>{part.part_description}</p>
                </div>
              )}

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <strong style={{ color: '#6c757d' }}>Quantity:</strong>
                  <p style={{ marginTop: '0.25rem' }}>{part.quantity}</p>
                </div>
                <div>
                  <strong style={{ color: '#6c757d' }}>Unit Material Cost:</strong>
                  <p style={{ marginTop: '0.25rem' }}>
                    {quotation.currency} {parseFloat(part.unit_material_cost).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Operations */}
              {part.operations && part.operations.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#495057' }}>
                    Operations:
                  </strong>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Machine</th>
                        <th>Type</th>
                        <th>Hourly Rate</th>
                        <th>Time (hours)</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {part.operations.map((op, opIndex) => (
                        <tr key={opIndex}>
                          <td>{op.machine_name}</td>
                          <td>{op.machine_type}</td>
                          <td>{quotation.currency} {parseFloat(op.hourly_rate).toFixed(2)}</td>
                          <td>{parseFloat(op.operation_time_hours).toFixed(2)}</td>
                          <td>
                            <strong>
                              {quotation.currency} {parseFloat(op.operation_cost).toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Auxiliary Costs */}
              {part.auxiliary_costs && part.auxiliary_costs.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#495057' }}>
                    Auxiliary Costs:
                  </strong>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {part.auxiliary_costs.map((aux, auxIndex) => (
                        <tr key={auxIndex}>
                          <td>{aux.aux_type}</td>
                          <td>{aux.description}</td>
                          <td>
                            <strong>
                              {quotation.currency} {parseFloat(aux.cost).toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Part Summary */}
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                <div className="grid-2">
                  <div>
                    <strong style={{ color: '#6c757d' }}>Unit Operations Cost:</strong>
                    <p style={{ marginTop: '0.25rem' }}>
                      {quotation.currency} {parseFloat(part.unit_operations_cost).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d' }}>Unit Auxiliary Cost:</strong>
                    <p style={{ marginTop: '0.25rem' }}>
                      {quotation.currency} {parseFloat(part.unit_auxiliary_cost).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #2a5298' }}>
                  <strong style={{ color: '#1e3c72', fontSize: '1.1rem' }}>Part Subtotal:</strong>
                  <p style={{ marginTop: '0.25rem', fontSize: '1.2rem', fontWeight: '700', color: '#1e3c72' }}>
                    {quotation.currency} {parseFloat(part.part_subtotal).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <div className="card-header">
          <h3>Financial Summary</h3>
        </div>
        <div className="card-body">
          <div className="cost-summary">
            <div className="cost-row">
              <span className="cost-label">Total Parts Cost:</span>
              <span className="cost-value">
                {quotation.currency} {parseFloat(quotation.total_parts_cost).toFixed(2)}
              </span>
            </div>
            <div className="cost-row">
              <span className="cost-label">Subtotal:</span>
              <span className="cost-value">
                {quotation.currency} {parseFloat(quotation.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="cost-row">
              <span className="cost-label">
                Discount ({parseFloat(quotation.discount_percent).toFixed(1)}%):
              </span>
              <span className="cost-value">
                - {quotation.currency} {parseFloat(quotation.discount_amount).toFixed(2)}
              </span>
            </div>
            <div className="cost-row">
              <span className="cost-label">
                Margin ({parseFloat(quotation.margin_percent).toFixed(1)}%):
              </span>
              <span className="cost-value">
                + {quotation.currency} {parseFloat(quotation.margin_amount).toFixed(2)}
              </span>
            </div>
            <div className="cost-row">
              <span className="cost-label">
                VAT ({parseFloat(quotation.vat_percent).toFixed(1)}%):
              </span>
              <span className="cost-value">
                + {quotation.currency} {parseFloat(quotation.vat_amount).toFixed(2)}
              </span>
            </div>
            <div className="cost-row total">
              <span className="cost-label">Total Quote Value:</span>
              <span className="cost-value">
                {quotation.currency} {parseFloat(quotation.total_quote_value).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationView;
