import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotationAPI, customerAPI, machineAPI, auxiliaryCostAPI } from '../../services/api';

function QuotationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [auxiliaryCosts, setAuxiliaryCosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customer_id: '',
    quotation_date: new Date().toISOString().split('T')[0],
    lead_time: '',
    payment_terms: '',
    currency: 'USD',
    shipment_type: '',
    discount_percent: 0,
    margin_percent: 0,
    vat_percent: 0,
    parts: []
  });

  useEffect(() => {
    fetchMasterData();
    if (isEdit) {
      fetchQuotation();
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [customersRes, machinesRes, auxCostsRes] = await Promise.all([
        customerAPI.getAll(),
        machineAPI.getAll(),
        auxiliaryCostAPI.getAll()
      ]);
      setCustomers(customersRes.data);
      setMachines(machinesRes.data);
      setAuxiliaryCosts(auxCostsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching master data:', error);
      setLoading(false);
    }
  };

  const fetchQuotation = async () => {
    try {
      const response = await quotationAPI.getById(id);
      const quotation = response.data;
      // Transform quotation data to form format
      setFormData({
        customer_id: quotation.customer_id,
        quotation_date: quotation.quotation_date.split('T')[0],
        lead_time: quotation.lead_time || '',
        payment_terms: quotation.payment_terms || '',
        currency: quotation.currency,
        shipment_type: quotation.shipment_type || '',
        discount_percent: quotation.discount_percent,
        margin_percent: quotation.margin_percent,
        vat_percent: quotation.vat_percent,
        parts: quotation.parts.map(part => ({
          part_number: part.part_number,
          part_description: part.part_description || '',
          unit_material_cost: part.unit_material_cost,
          quantity: part.quantity,
          operations: part.operations.map(op => ({
            machine_id: op.machine_id,
            operation_time_hours: op.operation_time_hours
          })),
          auxiliary_costs: part.auxiliary_costs.map(aux => ({
            aux_type_id: aux.aux_type_id,
            cost: aux.cost
          }))
        }))
      });
    } catch (error) {
      console.error('Error fetching quotation:', error);
    }
  };

  const addPart = () => {
    setFormData({
      ...formData,
      parts: [
        ...formData.parts,
        {
          part_number: '',
          part_description: '',
          unit_material_cost: 0,
          quantity: 1,
          operations: [],
          auxiliary_costs: []
        }
      ]
    });
  };

  const removePart = (partIndex) => {
    const newParts = formData.parts.filter((_, index) => index !== partIndex);
    setFormData({ ...formData, parts: newParts });
  };

  const updatePart = (partIndex, field, value) => {
    const newParts = [...formData.parts];
    newParts[partIndex][field] = value;
    setFormData({ ...formData, parts: newParts });
  };

  const addOperation = (partIndex) => {
    const newParts = [...formData.parts];
    newParts[partIndex].operations.push({
      machine_id: '',
      operation_time_hours: 0
    });
    setFormData({ ...formData, parts: newParts });
  };

  const removeOperation = (partIndex, operationIndex) => {
    const newParts = [...formData.parts];
    newParts[partIndex].operations = newParts[partIndex].operations.filter(
      (_, index) => index !== operationIndex
    );
    setFormData({ ...formData, parts: newParts });
  };

  const updateOperation = (partIndex, operationIndex, field, value) => {
    const newParts = [...formData.parts];
    newParts[partIndex].operations[operationIndex][field] = value;
    setFormData({ ...formData, parts: newParts });
  };

  const addAuxiliaryCost = (partIndex) => {
    const newParts = [...formData.parts];
    newParts[partIndex].auxiliary_costs.push({
      aux_type_id: '',
      cost: 0
    });
    setFormData({ ...formData, parts: newParts });
  };

  const removeAuxiliaryCost = (partIndex, auxIndex) => {
    const newParts = [...formData.parts];
    newParts[partIndex].auxiliary_costs = newParts[partIndex].auxiliary_costs.filter(
      (_, index) => index !== auxIndex
    );
    setFormData({ ...formData, parts: newParts });
  };

  const updateAuxiliaryCost = (partIndex, auxIndex, field, value) => {
    const newParts = [...formData.parts];
    newParts[partIndex].auxiliary_costs[auxIndex][field] = value;
    
    // Auto-fill cost if aux_type_id is selected
    if (field === 'aux_type_id' && value) {
      const auxCost = auxiliaryCosts.find(ac => ac.aux_type_id === parseInt(value));
      if (auxCost) {
        newParts[partIndex].auxiliary_costs[auxIndex].cost = auxCost.default_cost;
      }
    }
    
    setFormData({ ...formData, parts: newParts });
  };

  const calculatePartCosts = (part) => {
    let operationsCost = 0;
    part.operations.forEach(operation => {
      if (operation.machine_id) {
        const machine = machines.find(m => m.machine_id === parseInt(operation.machine_id));
        if (machine) {
          operationsCost += parseFloat(machine.hourly_rate) * parseFloat(operation.operation_time_hours || 0);
        }
      }
    });

    let auxCost = 0;
    part.auxiliary_costs.forEach(aux => {
      auxCost += parseFloat(aux.cost || 0);
    });

    const materialCost = parseFloat(part.unit_material_cost || 0);
    const unitTotal = materialCost + operationsCost + auxCost;
    const partTotal = unitTotal * parseInt(part.quantity || 1);

    return { operationsCost, auxCost, unitTotal, partTotal };
  };

  const calculateTotals = () => {
    let totalPartsCost = 0;
    formData.parts.forEach(part => {
      const { partTotal } = calculatePartCosts(part);
      totalPartsCost += partTotal;
    });

    const subtotal = totalPartsCost;
    const discountAmount = subtotal * (parseFloat(formData.discount_percent) / 100);
    const afterDiscount = subtotal - discountAmount;
    const marginAmount = afterDiscount * (parseFloat(formData.margin_percent) / 100);
    const afterMargin = afterDiscount + marginAmount;
    const vatAmount = afterMargin * (parseFloat(formData.vat_percent) / 100);
    const total = afterMargin + vatAmount;

    return { subtotal, discountAmount, marginAmount, vatAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.parts.length === 0) {
      alert('Please add at least one part');
      return;
    }

    try {
      if (isEdit) {
        await quotationAPI.update(id, formData);
        alert('Quotation updated successfully');
      } else {
        await quotationAPI.create(formData);
        alert('Quotation created successfully');
      }
      navigate('/quotations');
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation. Please check all fields and try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>{isEdit ? 'Edit Quotation' : 'Create New Quotation'}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* General Information */}
            <h3 style={{ marginBottom: '1rem', color: '#1e3c72' }}>General Information</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-control"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quotation Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.quotation_date}
                  onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency *</label>
                <select
                  className="form-control"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                >
                  <option value="USD">USD</option>
                  <option value="LKR">LKR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Lead Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lead_time}
                  onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="e.g., Net 30"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shipment Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shipment_type}
                  onChange={(e) => setFormData({ ...formData, shipment_type: e.target.value })}
                  placeholder="e.g., Air Freight, Sea Freight"
                />
              </div>
            </div>

            {/* Parts Section */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#1e3c72' }}>Parts</h3>
                <button type="button" className="btn btn-primary" onClick={addPart}>
                  Add Part
                </button>
              </div>

              {formData.parts.map((part, partIndex) => {
                const { operationsCost, auxCost, unitTotal, partTotal } = calculatePartCosts(part);
                
                return (
                  <div key={partIndex} className="part-section">
                    <div className="part-header">
                      <h4 style={{ color: '#2a5298' }}>Part #{partIndex + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => removePart(partIndex)}
                      >
                        Remove Part
                      </button>
                    </div>

                    {/* Part Basic Info */}
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Part Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={part.part_number}
                          onChange={(e) => updatePart(partIndex, 'part_number', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Part Description</label>
                        <input
                          type="text"
                          className="form-control"
                          value={part.part_description}
                          onChange={(e) => updatePart(partIndex, 'part_description', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Unit Material Cost ({formData.currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={part.unit_material_cost}
                          onChange={(e) => updatePart(partIndex, 'unit_material_cost', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={part.quantity}
                          onChange={(e) => updatePart(partIndex, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Operations */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong>Operations</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => addOperation(partIndex)}
                        >
                          Add Operation
                        </button>
                      </div>

                      {part.operations.map((operation, opIndex) => {
                        const machine = machines.find(m => m.machine_id === parseInt(operation.machine_id));
                        const opCost = machine ? parseFloat(machine.hourly_rate) * parseFloat(operation.operation_time_hours || 0) : 0;
                        
                        return (
                          <div key={opIndex} className="operation-row">
                            <div className="grid-3" style={{ alignItems: 'end' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Machine</label>
                                <select
                                  className="form-control"
                                  value={operation.machine_id}
                                  onChange={(e) => updateOperation(partIndex, opIndex, 'machine_id', e.target.value)}
                                  required
                                >
                                  <option value="">Select Machine</option>
                                  {machines.map(machine => (
                                    <option key={machine.machine_id} value={machine.machine_id}>
                                      {machine.machine_name} (${machine.hourly_rate}/hr)
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Time (hours)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  value={operation.operation_time_hours}
                                  onChange={(e) => updateOperation(partIndex, opIndex, 'operation_time_hours', e.target.value)}
                                  required
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ fontWeight: '600' }}>
                                  Cost: {formData.currency} {opCost.toFixed(2)}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-small"
                                  onClick={() => removeOperation(partIndex, opIndex)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Auxiliary Costs */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong>Auxiliary Costs</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => addAuxiliaryCost(partIndex)}
                        >
                          Add Auxiliary Cost
                        </button>
                      </div>

                      {part.auxiliary_costs.map((aux, auxIndex) => (
                        <div key={auxIndex} className="operation-row">
                          <div className="grid-3" style={{ alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label">Type</label>
                              <select
                                className="form-control"
                                value={aux.aux_type_id}
                                onChange={(e) => updateAuxiliaryCost(partIndex, auxIndex, 'aux_type_id', e.target.value)}
                                required
                              >
                                <option value="">Select Type</option>
                                {auxiliaryCosts.map(auxCost => (
                                  <option key={auxCost.aux_type_id} value={auxCost.aux_type_id}>
                                    {auxCost.aux_type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label">Cost ({formData.currency})</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={aux.cost}
                                onChange={(e) => updateAuxiliaryCost(partIndex, auxIndex, 'cost', e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn btn-danger btn-small"
                                onClick={() => removeAuxiliaryCost(partIndex, auxIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Part Summary */}
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Unit Material Cost:</div>
                          <div style={{ fontWeight: '600' }}>{formData.currency} {parseFloat(part.unit_material_cost || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Unit Operations Cost:</div>
                          <div style={{ fontWeight: '600' }}>{formData.currency} {operationsCost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Unit Auxiliary Cost:</div>
                          <div style={{ fontWeight: '600' }}>{formData.currency} {auxCost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Unit Total Cost:</div>
                          <div style={{ fontWeight: '600' }}>{formData.currency} {unitTotal.toFixed(2)}</div>
                        </div>
                        <div style={{ gridColumn: '1 / -1', paddingTop: '0.5rem', borderTop: '2px solid #2a5298' }}>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Part Subtotal (Qty: {part.quantity}):</div>
                          <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#1e3c72' }}>
                            {formData.currency} {partTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Section */}
            <div className="cost-summary">
              <h3 style={{ marginBottom: '1.5rem', color: '#1e3c72' }}>Financial Summary</h3>
              
              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Margin %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.margin_percent}
                    onChange={(e) => setFormData({ ...formData, margin_percent: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">VAT %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.vat_percent}
                    onChange={(e) => setFormData({ ...formData, vat_percent: e.target.value })}
                  />
                </div>
              </div>

              <div className="cost-row">
                <span className="cost-label">Subtotal:</span>
                <span className="cost-value">{formData.currency} {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Discount ({formData.discount_percent}%):</span>
                <span className="cost-value">- {formData.currency} {totals.discountAmount.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Margin ({formData.margin_percent}%):</span>
                <span className="cost-value">+ {formData.currency} {totals.marginAmount.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">VAT ({formData.vat_percent}%):</span>
                <span className="cost-value">+ {formData.currency} {totals.vatAmount.toFixed(2)}</span>
              </div>
              <div className="cost-row total">
                <span className="cost-label">Total Quote Value:</span>
                <span className="cost-value">{formData.currency} {totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/quotations')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                {isEdit ? 'Update Quotation' : 'Create Quotation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuotationForm;
