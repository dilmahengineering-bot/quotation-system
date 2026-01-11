import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotationsAPI, customersAPI, machinesAPI, auxiliaryAPI } from '../../services/api';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Textarea,
  LoadingState,
} from '../common/FormElements';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [auxCosts, setAuxCosts] = useState([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    quoteDate: new Date().toISOString().split('T')[0],
    leadTime: '',
    paymentTerms: 'Net 30',
    currency: 'LKR',
    shipmentType: '',
    marginPercent: 15,
    discountPercent: 0,
    vatPercent: 12,
    notes: '',
    validUntil: '',
  });
  
  const [parts, setParts] = useState([]);
  const [expandedParts, setExpandedParts] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, machinesRes, auxRes] = await Promise.all([
        customersAPI.getAll({ status: 'active' }),
        machinesAPI.getAll({ status: 'active' }),
        auxiliaryAPI.getAll({ status: 'active' }),
      ]);
      
      setCustomers(customersRes.data);
      setMachines(machinesRes.data);
      setAuxCosts(auxRes.data);

      if (isEdit) {
        const quotationRes = await quotationsAPI.getById(id);
        const quotation = quotationRes.data;
        
        setFormData({
          customerId: quotation.customer_id,
          quoteDate: quotation.quotation_date?.split('T')[0] || quotation.quote_date?.split('T')[0],
          leadTime: quotation.lead_time || '',
          paymentTerms: quotation.payment_terms || '',
          currency: quotation.currency,
          shipmentType: quotation.shipment_type || '',
          marginPercent: quotation.margin_percent,
          discountPercent: quotation.discount_percent,
          vatPercent: quotation.vat_percent,
          notes: quotation.notes || '',
          validUntil: quotation.valid_until?.split('T')[0] || '',
        });
        
        // Transform parts from snake_case to camelCase
        const transformedParts = (quotation.parts || []).map((part, index) => ({
          id: part.part_id || `part-${index}`,
          partNumber: part.part_number || '',
          partDescription: part.part_description || '',
          unitMaterialCost: part.unit_material_cost || 0,
          quantity: part.quantity || 1,
          operations: (part.operations || []).map((op, opIndex) => ({
            id: op.operation_id || `op-${opIndex}`,
            machineId: op.machine_id,
            machineName: op.machine_name || '',
            hourlyRate: op.hourly_rate || 0,
            estimatedTimeHours: op.operation_time_hours || 0,
          })),
          auxiliaryCosts: (part.auxiliary_costs || []).map((aux, auxIndex) => ({
            id: aux.aux_cost_id || `aux-${auxIndex}`,
            auxTypeId: aux.aux_type_id,
            auxTypeName: aux.cost_type || '',
            cost: aux.cost || 0,
            notes: aux.notes || '',
          })),
        }));
        
        setParts(transformedParts);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPart = () => {
    const newPart = {
      id: `new-${Date.now()}`,
      partNumber: '',
      partDescription: '',
      unitMaterialCost: 0,
      quantity: 1,
      operations: [],
      auxiliaryCosts: [],
    };
    setParts([...parts, newPart]);
    setExpandedParts(prev => ({ ...prev, [newPart.id]: true }));
  };

  const updatePart = (index, field, value) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const addOperation = (partIndex) => {
    const updated = [...parts];
    updated[partIndex].operations = [
      ...updated[partIndex].operations,
      {
        id: `new-op-${Date.now()}`,
        machineId: '',
        operationName: '',
        estimatedTimeHours: 0,
        hourlyRate: 0,
      },
    ];
    setParts(updated);
  };

  const updateOperation = (partIndex, opIndex, field, value) => {
    const updated = [...parts];
    updated[partIndex].operations[opIndex] = {
      ...updated[partIndex].operations[opIndex],
      [field]: value,
    };
    
    // Auto-fill hourly rate and machine name when machine is selected
    if (field === 'machineId') {
      const machine = machines.find(m => m.machine_id === parseInt(value));
      if (machine) {
        updated[partIndex].operations[opIndex].hourlyRate = machine.hourly_rate;
        updated[partIndex].operations[opIndex].machineName = machine.machine_name;
      }
    }
    
    setParts(updated);
  };

  const removeOperation = (partIndex, opIndex) => {
    const updated = [...parts];
    updated[partIndex].operations = updated[partIndex].operations.filter((_, i) => i !== opIndex);
    setParts(updated);
  };

  const addAuxCost = (partIndex) => {
    const updated = [...parts];
    updated[partIndex].auxiliaryCosts = [
      ...updated[partIndex].auxiliaryCosts,
      {
        id: `new-aux-${Date.now()}`,
        auxTypeId: '',
        cost: 0,
        notes: '',
      },
    ];
    setParts(updated);
  };

  const updateAuxCost = (partIndex, auxIndex, field, value) => {
    const updated = [...parts];
    updated[partIndex].auxiliaryCosts[auxIndex] = {
      ...updated[partIndex].auxiliaryCosts[auxIndex],
      [field]: value,
    };
    
    // Auto-fill cost when aux type is selected
    if (field === 'auxTypeId') {
      const auxType = auxCosts.find(a => a.aux_type_id === value);
      if (auxType) {
        updated[partIndex].auxiliaryCosts[auxIndex].cost = auxType.default_cost;
      }
    }
    
    setParts(updated);
  };

  const removeAuxCost = (partIndex, auxIndex) => {
    const updated = [...parts];
    updated[partIndex].auxiliaryCosts = updated[partIndex].auxiliaryCosts.filter((_, i) => i !== auxIndex);
    setParts(updated);
  };

  // Calculate totals
  const calculatePartTotal = (part) => {
    const operations = part.operations || [];
    const auxiliaryCosts = part.auxiliaryCosts || [];
    
    const operationsCost = operations.reduce((sum, op) => {
      return sum + (parseFloat(op.hourlyRate) || 0) * (parseFloat(op.estimatedTimeHours) || 0);
    }, 0);
    
    const quantity = parseInt(part.quantity) || 1;
    
    // Auxiliary Cost = Default_Cost × Quantity
    const auxCost = auxiliaryCosts.reduce((sum, aux) => {
      return sum + (parseFloat(aux.cost) || 0) * quantity;
    }, 0);
    
    const materialCost = parseFloat(part.unitMaterialCost) || 0;
    
    return (materialCost * quantity) + (operationsCost * quantity) + auxCost;
  };

  const calculateTotals = () => {
    const subtotal = parts.reduce((sum, part) => sum + calculatePartTotal(part), 0);
    const discountAmount = subtotal * (parseFloat(formData.discountPercent) || 0) / 100;
    const marginAmount = subtotal * (parseFloat(formData.marginPercent) || 0) / 100;
    const afterDiscountMargin = subtotal - discountAmount + marginAmount;
    const vatAmount = afterDiscountMargin * (parseFloat(formData.vatPercent) || 0) / 100;
    const total = afterDiscountMargin + vatAmount;
    
    return { subtotal, discountAmount, marginAmount, vatAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }
    
    setSaving(true);
    
    try {
      const payload = {
        customer_id: formData.customerId,
        quotation_date: formData.quoteDate,
        lead_time: formData.leadTime,
        payment_terms: formData.paymentTerms,
        currency: formData.currency,
        shipment_type: formData.shipmentType,
        margin_percent: parseFloat(formData.marginPercent) || 0,
        discount_percent: parseFloat(formData.discountPercent) || 0,
        vat_percent: parseFloat(formData.vatPercent) || 0,
        notes: formData.notes,
        valid_until: formData.validUntil,
        parts: parts.map(part => ({
          part_number: part.partNumber,
          part_description: part.partDescription,
          unit_material_cost: parseFloat(part.unitMaterialCost) || 0,
          quantity: parseInt(part.quantity) || 1,
          operations: part.operations.map(op => ({
            machine_id: op.machineId || op.machine_id,
            operation_time_hours: parseFloat(op.estimatedTimeHours || op.estimated_time_hours) || 0,
          })),
          auxiliary_costs: part.auxiliaryCosts.map(aux => ({
            aux_type_id: aux.auxTypeId || aux.aux_type_id,
            cost: parseFloat(aux.cost) || 0,
            notes: aux.notes || '',
          })),
        })),
      };

      if (isEdit) {
        await quotationsAPI.update(id, payload);
        toast.success('Quotation updated successfully');
      } else {
        const response = await quotationsAPI.create(payload);
        toast.success('Quotation created successfully');
        navigate(`/quotations/${response.data.quotation_id}`);
        return;
      }
      
      navigate(`/quotations/${id}`);
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save quotation';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const togglePart = (partId) => {
    setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  if (loading) {
    return <LoadingState message="Loading..." />;
  }

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-industrial-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-industrial-900">
              {isEdit ? 'Edit Quotation' : 'New Quotation'}
            </h1>
            <p className="text-industrial-500">
              {isEdit ? 'Update quotation details' : 'Create a new quotation'}
            </p>
          </div>
        </div>
        <Button type="submit" loading={saving}>
          <Save className="w-4 h-4" />
          {isEdit ? 'Update' : 'Create'} Quotation
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-industrial-900">Quotation Information</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Customer *"
              options={customers.map(c => ({ value: c.customer_id, label: c.company_name }))}
              value={formData.customerId}
              onChange={(e) => handleFormChange('customerId', e.target.value)}
              required
            />
            <Input
              label="Quote Date"
              type="date"
              value={formData.quoteDate}
              onChange={(e) => handleFormChange('quoteDate', e.target.value)}
            />
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleFormChange('validUntil', e.target.value)}
            />
            <Input
              label="Lead Time"
              placeholder="e.g., 2-3 weeks"
              value={formData.leadTime}
              onChange={(e) => handleFormChange('leadTime', e.target.value)}
            />
            <Input
              label="Payment Terms"
              placeholder="e.g., Net 30"
              value={formData.paymentTerms}
              onChange={(e) => handleFormChange('paymentTerms', e.target.value)}
            />
            <Select
              label="Currency"
              options={[
                { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
                { value: 'USD', label: 'USD - US Dollar' },
              ]}
              value={formData.currency}
              onChange={(e) => handleFormChange('currency', e.target.value)}
            />
            <Input
              label="Shipment Type"
              placeholder="e.g., FOB, CIF"
              value={formData.shipmentType}
              onChange={(e) => handleFormChange('shipmentType', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardBody>
      </Card>

      {/* Parts */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-industrial-900">Parts & Operations</h2>
          <Button type="button" size="sm" onClick={addPart}>
            <Plus className="w-4 h-4" />
            Add Part
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {parts.length === 0 ? (
            <div className="text-center py-8 text-industrial-500">
              No parts added yet. Click "Add Part" to get started.
            </div>
          ) : (
            parts.map((part, partIndex) => {
              const partId = part.part_id || part.id;
              const isExpanded = expandedParts[partId] !== false;
              const partTotal = calculatePartTotal(part);
              
              return (
                <div key={partId} className="border border-industrial-200 rounded-lg overflow-hidden">
                  {/* Part Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-industrial-50 cursor-pointer"
                    onClick={() => togglePart(partId)}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-industrial-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-industrial-400" />
                      )}
                      <div>
                        <span className="font-medium text-industrial-900">
                          {part.partNumber || part.part_number || `Part ${partIndex + 1}`}
                        </span>
                        <span className="ml-2 text-sm text-industrial-500">
                          Qty: {part.quantity} | Total: {formData.currency} {partTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePart(partIndex);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Part Details */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          label="Part Number *"
                          value={part.partNumber || part.part_number || ''}
                          onChange={(e) => updatePart(partIndex, 'partNumber', e.target.value)}
                          required
                        />
                        <Input
                          label="Description"
                          value={part.partDescription || part.part_description || ''}
                          onChange={(e) => updatePart(partIndex, 'partDescription', e.target.value)}
                        />
                        <Input
                          label="Material Cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={part.unitMaterialCost || part.unit_material_cost || 0}
                          onChange={(e) => updatePart(partIndex, 'unitMaterialCost', e.target.value)}
                        />
                        <Input
                          label="Quantity *"
                          type="number"
                          min="1"
                          value={part.quantity || 1}
                          onChange={(e) => updatePart(partIndex, 'quantity', e.target.value)}
                          required
                        />
                      </div>

                      {/* Operations */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-industrial-700">Operations</h4>
                          <Button type="button" size="sm" variant="secondary" onClick={() => addOperation(partIndex)}>
                            <Plus className="w-4 h-4" />
                            Add Operation
                          </Button>
                        </div>
                        {(part.operations || []).length === 0 ? (
                          <p className="text-sm text-industrial-500">No operations added</p>
                        ) : (
                          <div className="space-y-2">
                            {part.operations.map((op, opIndex) => (
                              <div key={op.operation_id || op.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end bg-industrial-50 p-3 rounded-lg">
                                <Select
                                  label="Machine"
                                  options={machines.map(m => ({ value: m.machine_id, label: `${m.machine_name} (${m.machine_type})` }))}
                                  value={op.machineId || op.machine_id || ''}
                                  onChange={(e) => updateOperation(partIndex, opIndex, 'machineId', e.target.value)}
                                />
                                <Input
                                  label="Operation"
                                  placeholder="e.g., Rough milling"
                                  value={op.operationName || op.operation_name || ''}
                                  onChange={(e) => updateOperation(partIndex, opIndex, 'operationName', e.target.value)}
                                />
                                <Input
                                  label="Time (hrs)"
                                  type="number"
                                  step="0.25"
                                  min="0"
                                  value={op.estimatedTimeHours || op.estimated_time_hours || 0}
                                  onChange={(e) => updateOperation(partIndex, opIndex, 'estimatedTimeHours', e.target.value)}
                                />
                                <Input
                                  label="Rate/hr"
                                  type="number"
                                  step="0.01"
                                  value={op.hourlyRate || op.hourly_rate || 0}
                                  readOnly
                                  disabled
                                  className="bg-gray-100"
                                  title="Auto-populated from Machine Master"
                                />
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 text-sm font-medium text-industrial-700">
                                    = {formData.currency} {((parseFloat(op.hourlyRate || op.hourly_rate) || 0) * (parseFloat(op.estimatedTimeHours || op.estimated_time_hours) || 0)).toFixed(2)}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeOperation(partIndex, opIndex)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Auxiliary Costs */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-industrial-700">Auxiliary Costs</h4>
                          <Button type="button" size="sm" variant="secondary" onClick={() => addAuxCost(partIndex)}>
                            <Plus className="w-4 h-4" />
                            Add Cost
                          </Button>
                        </div>
                        <p className="text-xs text-industrial-500 mb-3">Total Auxiliary Cost = Unit Cost × Quantity ({part.quantity || 1})</p>
                        {(part.auxiliaryCosts || []).length === 0 ? (
                          <p className="text-sm text-industrial-500">No auxiliary costs added</p>
                        ) : (
                          <div className="space-y-2">
                            {part.auxiliaryCosts.map((aux, auxIndex) => (
                              <div key={aux.part_aux_id || aux.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-industrial-50 p-3 rounded-lg">
                                <Select
                                  label="Cost Type"
                                  options={auxCosts.map(a => ({ value: a.aux_type_id, label: a.aux_type }))}
                                  value={aux.auxTypeId || aux.aux_type_id || ''}
                                  onChange={(e) => updateAuxCost(partIndex, auxIndex, 'auxTypeId', e.target.value)}
                                />
                                <Input
                                  label="Unit Cost"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={aux.cost || 0}
                                  onChange={(e) => updateAuxCost(partIndex, auxIndex, 'cost', e.target.value)}
                                />
                                <Input
                                  label="Notes"
                                  placeholder="Optional notes"
                                  value={aux.notes || ''}
                                  onChange={(e) => updateAuxCost(partIndex, auxIndex, 'notes', e.target.value)}
                                />
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-industrial-500">Total: {((aux.cost || 0) * (part.quantity || 1)).toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAuxCost(partIndex, auxIndex)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-industrial-500" />
          <h2 className="font-semibold text-industrial-900">Pricing Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              label="Margin %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.marginPercent}
              onChange={(e) => handleFormChange('marginPercent', e.target.value)}
            />
            <Input
              label="Discount %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => handleFormChange('discountPercent', e.target.value)}
            />
            <Input
              label="VAT %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.vatPercent}
              onChange={(e) => handleFormChange('vatPercent', e.target.value)}
            />
          </div>

          <div className="bg-industrial-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-industrial-600">
              <span>Subtotal</span>
              <span>{formData.currency} {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>Discount ({formData.discountPercent}%)</span>
              <span className="text-red-600">- {formData.currency} {totals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>Margin ({formData.marginPercent}%)</span>
              <span className="text-emerald-600">+ {formData.currency} {totals.marginAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>VAT ({formData.vatPercent}%)</span>
              <span>+ {formData.currency} {totals.vatAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-industrial-200 pt-3 flex justify-between text-lg font-bold text-industrial-900">
              <span>Total Quote Value</span>
              <span>{formData.currency} {totals.total.toFixed(2)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          <Save className="w-4 h-4" />
          {isEdit ? 'Update' : 'Create'} Quotation
        </Button>
      </div>
    </form>
  );
};

export default QuotationForm;
