import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quotationApi, customerApi, machineApi, auxiliaryCostApi } from '../utils/api';
import { formatCurrency, formatTime, QUOTATION_STATUSES } from '../utils/helpers';
import { IconPlus, IconTrash, IconEdit } from '../components/Icons';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [auxCostTypes, setAuxCostTypes] = useState([]);
  
  const [quotation, setQuotation] = useState({
    customer_id: '',
    margin_percent: 0,
    notes: '',
    valid_until: '',
    status: 'Draft',
  });
  
  const [parts, setParts] = useState([]);
  
  // Modals
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [auxCostModalOpen, setAuxCostModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [editingOperation, setEditingOperation] = useState(null);
  const [editingAuxCost, setEditingAuxCost] = useState(null);
  const [currentPartId, setCurrentPartId] = useState(null);

  // Form states
  const [partForm, setPartForm] = useState({ part_number: '', part_description: '', unit_material_cost: 0, quantity: 1 });
  const [operationForm, setOperationForm] = useState({ machine_id: '', operation_name: '', estimated_hours: 0, estimated_minutes: 0, notes: '' });
  const [auxCostForm, setAuxCostForm] = useState({ aux_type_id: '', cost: '' });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, machinesRes, auxCostsRes] = await Promise.all([
        customerApi.getAll({ activeOnly: true }),
        machineApi.getAll(true),
        auxiliaryCostApi.getAll(true),
      ]);
      
      setCustomers(customersRes.data);
      setMachines(machinesRes.data);
      setAuxCostTypes(auxCostsRes.data);

      if (isEdit) {
        const quotationRes = await quotationApi.getById(id);
        const q = quotationRes.data;
        setQuotation({
          customer_id: q.customer_id || '',
          margin_percent: q.margin_percent || 0,
          notes: q.notes || '',
          valid_until: q.valid_until ? q.valid_until.split('T')[0] : '',
          status: q.status || 'Draft',
        });
        setParts(q.parts || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotation = async () => {
    if (!isEdit) return;
    try {
      const quotationRes = await quotationApi.getById(id);
      const q = quotationRes.data;
      setQuotation({
        customer_id: q.customer_id || '',
        margin_percent: q.margin_percent || 0,
        notes: q.notes || '',
        valid_until: q.valid_until ? q.valid_until.split('T')[0] : '',
        status: q.status || 'Draft',
      });
      setParts(q.parts || []);
    } catch (error) {
      toast.error('Failed to refresh quotation');
    }
  };

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveQuotation = async () => {
    if (!quotation.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await quotationApi.update(id, quotation);
        toast.success('Quotation updated');
      } else {
        const response = await quotationApi.create(quotation);
        toast.success('Quotation created');
        navigate(`/quotations/${response.data.quotation_id}/edit`);
      }
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  // Part handlers
  const openPartModal = (part = null) => {
    if (part) {
      setEditingPart(part);
      setPartForm({
        part_number: part.part_number,
        part_description: part.part_description || '',
        unit_material_cost: part.unit_material_cost || 0,
        quantity: part.quantity || 1,
      });
    } else {
      setEditingPart(null);
      setPartForm({ part_number: '', part_description: '', unit_material_cost: 0, quantity: 1 });
    }
    setPartModalOpen(true);
  };

  const handlePartSubmit = async () => {
    try {
      if (editingPart) {
        await quotationApi.updatePart(id, editingPart.part_id, partForm);
        toast.success('Part updated');
      } else {
        await quotationApi.addPart(id, partForm);
        toast.success('Part added');
      }
      setPartModalOpen(false);
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to save part');
    }
  };

  const handleDeletePart = async (partId) => {
    if (!window.confirm('Delete this part and all its operations?')) return;
    try {
      await quotationApi.deletePart(id, partId);
      toast.success('Part deleted');
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to delete part');
    }
  };

  // Operation handlers
  const openOperationModal = (partId, operation = null) => {
    setCurrentPartId(partId);
    if (operation) {
      setEditingOperation(operation);
      setOperationForm({
        machine_id: operation.machine_id || '',
        operation_name: operation.operation_name || '',
        estimated_hours: operation.estimated_hours || 0,
        estimated_minutes: operation.estimated_minutes || 0,
        notes: operation.notes || '',
      });
    } else {
      setEditingOperation(null);
      setOperationForm({ machine_id: machines[0]?.machine_id || '', operation_name: '', estimated_hours: 0, estimated_minutes: 0, notes: '' });
    }
    setOperationModalOpen(true);
  };

  const handleOperationSubmit = async () => {
    if (!operationForm.machine_id) {
      toast.error('Please select a machine');
      return;
    }
    try {
      if (editingOperation) {
        await quotationApi.updateOperation(id, currentPartId, editingOperation.operation_id, operationForm);
        toast.success('Operation updated');
      } else {
        await quotationApi.addOperation(id, currentPartId, operationForm);
        toast.success('Operation added');
      }
      setOperationModalOpen(false);
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to save operation');
    }
  };

  const handleDeleteOperation = async (partId, opId) => {
    if (!window.confirm('Delete this operation?')) return;
    try {
      await quotationApi.deleteOperation(id, partId, opId);
      toast.success('Operation deleted');
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to delete operation');
    }
  };

  // Auxiliary Cost handlers
  const openAuxCostModal = (partId, auxCost = null) => {
    setCurrentPartId(partId);
    if (auxCost) {
      setEditingAuxCost(auxCost);
      setAuxCostForm({
        aux_type_id: auxCost.aux_type_id || '',
        cost: auxCost.cost || '',
      });
    } else {
      setEditingAuxCost(null);
      const firstAuxType = auxCostTypes[0];
      setAuxCostForm({
        aux_type_id: firstAuxType?.aux_type_id || '',
        cost: firstAuxType?.default_cost || '',
      });
    }
    setAuxCostModalOpen(true);
  };

  const handleAuxTypeChange = (e) => {
    const auxTypeId = e.target.value;
    const selectedType = auxCostTypes.find(t => t.aux_type_id === parseInt(auxTypeId));
    setAuxCostForm({
      aux_type_id: auxTypeId,
      cost: selectedType?.default_cost || '',
    });
  };

  const handleAuxCostSubmit = async () => {
    if (!auxCostForm.aux_type_id) {
      toast.error('Please select an auxiliary cost type');
      return;
    }
    try {
      if (editingAuxCost) {
        await quotationApi.updatePartAuxCost(id, currentPartId, editingAuxCost.id, auxCostForm);
        toast.success('Auxiliary cost updated');
      } else {
        await quotationApi.addPartAuxCost(id, currentPartId, auxCostForm);
        toast.success('Auxiliary cost added');
      }
      setAuxCostModalOpen(false);
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to save auxiliary cost');
    }
  };

  const handleDeleteAuxCost = async (partId, auxId) => {
    if (!window.confirm('Delete this auxiliary cost?')) return;
    try {
      await quotationApi.deletePartAuxCost(id, partId, auxId);
      toast.success('Auxiliary cost deleted');
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to delete auxiliary cost');
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalPartsCost = 0;
    let totalOpsCost = 0;
    let totalAuxCost = 0;

    parts.forEach((part) => {
      const qty = parseInt(part.quantity) || 1;
      totalPartsCost += (parseFloat(part.unit_material_cost) || 0) * qty;
      totalOpsCost += (parseFloat(part.unit_operations_cost) || 0) * qty;
      totalAuxCost += (parseFloat(part.unit_auxiliary_cost) || 0) * qty;
    });

    const subtotal = totalPartsCost + totalOpsCost + totalAuxCost;
    const marginAmount = subtotal * (parseFloat(quotation.margin_percent) || 0) / 100;
    const total = subtotal + marginAmount;

    return { totalPartsCost, totalOpsCost, totalAuxCost, subtotal, marginAmount, total };
  };

  const totals = calculateTotals();

  if (loading) return <Loading text="Loading quotation..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Quotation' : 'New Quotation'}</h1>
          <p className="page-subtitle">
            {isEdit ? `Editing quotation details` : 'Create a new quotation'}
          </p>
        </div>
        <div className="flex gap-md">
          <Link to="/quotations" className="btn btn-secondary">Cancel</Link>
          <button className="btn btn-primary" onClick={handleSaveQuotation} disabled={saving}>
            {saving ? 'Saving...' : 'Save Quotation'}
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="quotation-layout">
          <div className="quotation-main">
            {/* Header Info */}
            <div className="card mb-lg">
              <div className="card-header">
                <h3 className="card-title">Quotation Details</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer *</label>
                    <select
                      name="customer_id"
                      className="form-select"
                      value={quotation.customer_id}
                      onChange={handleQuotationChange}
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c.customer_id} value={c.customer_id}>
                          {c.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={quotation.status}
                      onChange={handleQuotationChange}
                    >
                      {QUOTATION_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Margin %</label>
                    <input
                      type="number"
                      name="margin_percent"
                      className="form-input"
                      value={quotation.margin_percent}
                      onChange={handleQuotationChange}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valid Until</label>
                    <input
                      type="date"
                      name="valid_until"
                      className="form-input"
                      value={quotation.valid_until}
                      onChange={handleQuotationChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-textarea"
                    value={quotation.notes}
                    onChange={handleQuotationChange}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Parts Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Parts</h3>
                {isEdit && (
                  <button className="btn btn-accent btn-sm" onClick={() => openPartModal()}>
                    <IconPlus /> Add Part
                  </button>
                )}
              </div>
              <div className="card-body">
                {!isEdit ? (
                  <div className="empty-state">
                    <div className="empty-state-text">Save the quotation first to add parts</div>
                  </div>
                ) : parts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-title">No parts yet</div>
                    <div className="empty-state-text">Add parts to this quotation</div>
                    <button className="btn btn-primary" onClick={() => openPartModal()}>
                      <IconPlus /> Add Part
                    </button>
                  </div>
                ) : (
                  parts.map((part) => (
                    <div key={part.part_id} className="part-card">
                      <div className="part-card-header">
                        <div>
                          <span className="part-number">{part.part_number}</span>
                          <span className="text-muted" style={{ marginLeft: '8px' }}>
                            Qty: {part.quantity}
                          </span>
                        </div>
                        <div className="part-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openPartModal(part)}>
                            <IconEdit /> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeletePart(part.part_id)}>
                            <IconTrash />
                          </button>
                        </div>
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

                        <div className="divider" />

                        {/* Operations */}
                        <div className="flex justify-between items-center mb-sm">
                          <strong className="text-secondary">Operations</strong>
                          <button className="btn btn-secondary btn-sm" onClick={() => openOperationModal(part.part_id)}>
                            <IconPlus /> Add Operation
                          </button>
                        </div>
                        {part.operations?.length > 0 ? (
                          <div className="operations-list">
                            {part.operations.map((op) => (
                              <div key={op.operation_id} className="operation-item">
                                <div>
                                  <strong>{op.operation_name || 'Unnamed Operation'}</strong>
                                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    {op.machine_name} ({op.machine_type})
                                  </div>
                                </div>
                                <div className="text-secondary">
                                  {formatTime(op.estimated_hours, op.estimated_minutes)}
                                </div>
                                <div className="text-muted">
                                  @ ${parseFloat(op.hourly_rate || 0).toFixed(2)}/hr
                                </div>
                                <div className="cost">
                                  {parseFloat(op.operation_cost || 0).toFixed(2)}
                                </div>
                                <div className="action-buttons">
                                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openOperationModal(part.part_id, op)}>
                                    <IconEdit />
                                  </button>
                                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteOperation(part.part_id, op.operation_id)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No operations added</p>
                        )}

                        <div className="divider" />

                        {/* Auxiliary Costs */}
                        <div className="flex justify-between items-center mb-sm">
                          <strong className="text-secondary">Auxiliary Costs</strong>
                          <button className="btn btn-secondary btn-sm" onClick={() => openAuxCostModal(part.part_id)}>
                            <IconPlus /> Add Aux Cost
                          </button>
                        </div>
                        {part.auxiliary_costs?.length > 0 ? (
                          <div className="operations-list">
                            {part.auxiliary_costs.map((aux) => (
                              <div key={aux.id} className="operation-item" style={{ gridTemplateColumns: '1fr 100px auto' }}>
                                <div>
                                  <strong>{aux.aux_type}</strong>
                                  {aux.description && (
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{aux.description}</div>
                                  )}
                                </div>
                                <div className="cost">{parseFloat(aux.cost || 0).toFixed(2)}</div>
                                <div className="action-buttons">
                                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openAuxCostModal(part.part_id, aux)}>
                                    <IconEdit />
                                  </button>
                                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteAuxCost(part.part_id, aux.id)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No auxiliary costs added</p>
                        )}

                        <div className="divider" />
                        <div className="text-right">
                          <span className="text-muted">Part Subtotal: </span>
                          <span className="cost font-bold" style={{ fontSize: '1.1rem' }}>
                            {parseFloat(part.part_subtotal || 0).toFixed(2)}
                          </span>
                        </div>
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
              <h3 className="card-title mb-lg">Summary</h3>
              <div className="summary-row">
                <span className="summary-label">Material Costs</span>
                <span className="summary-value">{formatCurrency(totals.totalPartsCost)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Operations Costs</span>
                <span className="summary-value">{formatCurrency(totals.totalOpsCost)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Auxiliary Costs</span>
                <span className="summary-value">{formatCurrency(totals.totalAuxCost)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Margin ({quotation.margin_percent}%)</span>
                <span className="summary-value">{formatCurrency(totals.marginAmount)}</span>
              </div>
              <div className="summary-row summary-total">
                <span className="summary-label">Total Quote Value</span>
                <span className="summary-value">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part Modal */}
      <Modal
        isOpen={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        title={editingPart ? 'Edit Part' : 'Add Part'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPartModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePartSubmit}>
              {editingPart ? 'Update' : 'Add'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Part Number *</label>
          <input
            type="text"
            className="form-input"
            value={partForm.part_number}
            onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })}
            placeholder="e.g., PN-001"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={partForm.part_description}
            onChange={(e) => setPartForm({ ...partForm, part_description: e.target.value })}
            placeholder="Part description"
            rows={2}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Unit Material Cost ($)</label>
            <input
              type="number"
              className="form-input"
              value={partForm.unit_material_cost}
              onChange={(e) => setPartForm({ ...partForm, unit_material_cost: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              className="form-input"
              value={partForm.quantity}
              onChange={(e) => setPartForm({ ...partForm, quantity: e.target.value })}
              min="1"
              required
            />
          </div>
        </div>
      </Modal>

      {/* Operation Modal */}
      <Modal
        isOpen={operationModalOpen}
        onClose={() => setOperationModalOpen(false)}
        title={editingOperation ? 'Edit Operation' : 'Add Operation'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOperationModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleOperationSubmit}>
              {editingOperation ? 'Update' : 'Add'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Machine *</label>
          <select
            className="form-select"
            value={operationForm.machine_id}
            onChange={(e) => setOperationForm({ ...operationForm, machine_id: e.target.value })}
            required
          >
            <option value="">Select Machine</option>
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_name} ({m.machine_type}) - ${parseFloat(m.hourly_rate).toFixed(2)}/hr
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Operation Name</label>
          <input
            type="text"
            className="form-input"
            value={operationForm.operation_name}
            onChange={(e) => setOperationForm({ ...operationForm, operation_name: e.target.value })}
            placeholder="e.g., Rough Milling"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              className="form-input"
              value={operationForm.estimated_hours}
              onChange={(e) => setOperationForm({ ...operationForm, estimated_hours: e.target.value })}
              min="0"
              step="1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Minutes</label>
            <input
              type="number"
              className="form-input"
              value={operationForm.estimated_minutes}
              onChange={(e) => setOperationForm({ ...operationForm, estimated_minutes: e.target.value })}
              min="0"
              max="59"
              step="1"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={operationForm.notes}
            onChange={(e) => setOperationForm({ ...operationForm, notes: e.target.value })}
            placeholder="Operation notes"
            rows={2}
          />
        </div>
      </Modal>

      {/* Auxiliary Cost Modal */}
      <Modal
        isOpen={auxCostModalOpen}
        onClose={() => setAuxCostModalOpen(false)}
        title={editingAuxCost ? 'Edit Auxiliary Cost' : 'Add Auxiliary Cost'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAuxCostModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAuxCostSubmit}>
              {editingAuxCost ? 'Update' : 'Add'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Auxiliary Cost Type *</label>
          <select
            className="form-select"
            value={auxCostForm.aux_type_id}
            onChange={handleAuxTypeChange}
            required
          >
            <option value="">Select Type</option>
            {auxCostTypes.map((t) => (
              <option key={t.aux_type_id} value={t.aux_type_id}>
                {t.aux_type} (Default: ${parseFloat(t.default_cost).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cost ($)</label>
          <input
            type="number"
            className="form-input"
            value={auxCostForm.cost}
            onChange={(e) => setAuxCostForm({ ...auxCostForm, cost: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>
      </Modal>
    </>
  );
};

export default QuotationForm;
