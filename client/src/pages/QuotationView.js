import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quotationApi } from '../utils/api';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass } from '../utils/helpers';
import { IconEdit } from '../components/Icons';
import Loading from '../components/Loading';

const QuotationView = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await quotationApi.getById(id);
      setQuotation(response.data);
    } catch (error) {
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading quotation..." />;
  if (!quotation) return <div className="page-content"><p>Quotation not found</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{quotation.quotation_number}</h1>
          <p className="page-subtitle">View quotation details</p>
        </div>
        <div className="flex gap-md">
          <Link to="/quotations" className="btn btn-secondary">Back to List</Link>
          <Link to={`/quotations/${id}/edit`} className="btn btn-primary">
            <IconEdit /> Edit Quotation
          </Link>
        </div>
      </div>

      <div className="page-content">
        <div className="quotation-layout">
          <div className="quotation-main">
            {/* Customer Info */}
            <div className="card mb-lg">
              <div className="card-header">
                <h3 className="card-title">Customer Information</h3>
                <span className={`badge ${getStatusBadgeClass(quotation.status)}`}>
                  {quotation.status}
                </span>
              </div>
              <div className="card-body">
                <div className="grid grid-2">
                  <div>
                    <p className="text-muted mb-sm">Company</p>
                    <p><strong>{quotation.company_name}</strong></p>
                  </div>
                  <div>
                    <p className="text-muted mb-sm">Contact Person</p>
                    <p>{quotation.contact_person_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-sm">Email</p>
                    <p>{quotation.customer_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-sm">Phone</p>
                    <p>{quotation.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-sm">VAT Number</p>
                    <p>{quotation.vat_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-sm">Valid Until</p>
                    <p>{quotation.valid_until ? formatDate(quotation.valid_until) : '-'}</p>
                  </div>
                </div>
                {quotation.address && (
                  <div className="mt-md">
                    <p className="text-muted mb-sm">Address</p>
                    <p>{quotation.address}</p>
                  </div>
                )}
                {quotation.notes && (
                  <div className="mt-md">
                    <p className="text-muted mb-sm">Notes</p>
                    <p>{quotation.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parts */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Parts ({quotation.parts?.length || 0})</h3>
              </div>
              <div className="card-body">
                {!quotation.parts || quotation.parts.length === 0 ? (
                  <p className="text-muted">No parts in this quotation</p>
                ) : (
                  quotation.parts.map((part) => (
                    <div key={part.part_id} className="part-card">
                      <div className="part-card-header">
                        <div>
                          <span className="part-number">{part.part_number}</span>
                          <span className="text-muted" style={{ marginLeft: '8px' }}>
                            Qty: {part.quantity}
                          </span>
                        </div>
                        <span className="cost font-bold">
                          {formatCurrency(part.part_subtotal || 0)}
                        </span>
                      </div>
                      <div className="part-card-body">
                        {part.part_description && (
                          <p className="text-secondary mb-md">{part.part_description}</p>
                        )}

                        <div className="grid grid-3 mb-md">
                          <div>
                            <span className="text-muted">Material Cost:</span>
                            <span className="cost" style={{ marginLeft: '8px' }}>
                              {parseFloat(part.unit_material_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted">Operations Cost:</span>
                            <span className="cost" style={{ marginLeft: '8px' }}>
                              {parseFloat(part.unit_operations_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted">Auxiliary Cost:</span>
                            <span className="cost" style={{ marginLeft: '8px' }}>
                              {parseFloat(part.unit_auxiliary_cost || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Operations */}
                        {part.operations?.length > 0 && (
                          <>
                            <div className="divider" />
                            <strong className="text-secondary mb-sm" style={{ display: 'block' }}>Operations</strong>
                            <div className="table-container">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>Operation</th>
                                    <th>Machine</th>
                                    <th>Time</th>
                                    <th>Rate</th>
                                    <th>Cost</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {part.operations.map((op) => (
                                    <tr key={op.operation_id}>
                                      <td>{op.operation_name || '-'}</td>
                                      <td>
                                        {op.machine_name}
                                        <span className="machine-type" style={{ marginLeft: '8px' }}>{op.machine_type}</span>
                                      </td>
                                      <td>{formatTime(op.estimated_hours, op.estimated_minutes)}</td>
                                      <td>${parseFloat(op.hourly_rate || 0).toFixed(2)}/hr</td>
                                      <td className="cost">{parseFloat(op.operation_cost || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {/* Auxiliary Costs */}
                        {part.auxiliary_costs?.length > 0 && (
                          <>
                            <div className="divider" />
                            <strong className="text-secondary mb-sm" style={{ display: 'block' }}>Auxiliary Costs</strong>
                            <div className="table-container">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Cost</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {part.auxiliary_costs.map((aux) => (
                                    <tr key={aux.id}>
                                      <td><strong>{aux.aux_type}</strong></td>
                                      <td className="text-muted">{aux.description || '-'}</td>
                                      <td className="cost">{parseFloat(aux.cost || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="quotation-sidebar">
            <div className="quotation-summary">
              <h3 className="card-title mb-lg">Quotation Summary</h3>
              <div className="summary-row">
                <span className="summary-label">Quotation #</span>
                <span className="summary-value font-mono">{quotation.quotation_number}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Created</span>
                <span className="summary-value">{formatDate(quotation.created_at)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Updated</span>
                <span className="summary-value">{formatDate(quotation.updated_at)}</span>
              </div>
              <div className="divider" />
              <div className="summary-row">
                <span className="summary-label">Parts Cost</span>
                <span className="summary-value">{formatCurrency(quotation.total_parts_cost || 0)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Auxiliary Cost</span>
                <span className="summary-value">{formatCurrency(quotation.total_auxiliary_cost || 0)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatCurrency(quotation.subtotal || 0)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Margin ({quotation.margin_percent || 0}%)</span>
                <span className="summary-value">{formatCurrency(quotation.margin_amount || 0)}</span>
              </div>
              <div className="summary-row summary-total">
                <span className="summary-label">Total Quote Value</span>
                <span className="summary-value">{formatCurrency(quotation.total_quote_value || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationView;
