import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  StatusBadge,
  LoadingState,
  Modal,
  Textarea,
  Table,
} from '../common/FormElements';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  FileCheck,
  RotateCcw,
  Printer,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  History,
  FileDown,
  Sheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ open: false, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await quotationsAPI.getById(id);
      setQuotation(response.data);
    } catch (error) {
      toast.error('Failed to load quotation');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      const { action } = actionModal;
      const payload = { comments };

      switch (action) {
        case 'submit':
          await quotationsAPI.submit(id, payload);
          toast.success('Quotation submitted for approval');
          break;
        case 'engineer_approve':
          await quotationsAPI.engineerApprove(id, payload);
          toast.success('Quotation approved by engineer');
          break;
        case 'management_approve':
          await quotationsAPI.managementApprove(id, payload);
          toast.success('Quotation approved by management');
          break;
        case 'reject':
          if (!comments.trim()) {
            toast.error('Please provide a rejection reason');
            setActionLoading(false);
            return;
          }
          await quotationsAPI.reject(id, payload);
          toast.success('Quotation rejected');
          break;
        case 'issue':
          await quotationsAPI.issue(id, payload);
          toast.success('Quotation issued');
          break;
        case 'revert':
          await quotationsAPI.revertToDraft(id, payload);
          toast.success('Quotation reverted to draft');
          break;
        default:
          break;
      }

      setActionModal({ open: false, action: null });
      setComments('');
      fetchQuotation();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (action) => {
    setActionModal({ open: true, action });
  };

  const handleExportPDF = async () => {
    try {
      const response = await quotationsAPI.exportPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation_${quotation.quote_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await quotationsAPI.exportExcel(id);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation_${quotation.quote_number}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const getActionConfig = (action) => {
    const configs = {
      submit: { title: 'Submit for Approval', button: 'Submit', variant: 'primary' },
      engineer_approve: { title: 'Engineer Approval', button: 'Approve', variant: 'success' },
      management_approve: { title: 'Management Approval', button: 'Approve', variant: 'success' },
      reject: { title: 'Reject Quotation', button: 'Reject', variant: 'danger' },
      issue: { title: 'Issue Quotation', button: 'Issue', variant: 'primary' },
      revert: { title: 'Revert to Draft', button: 'Revert', variant: 'secondary' },
    };
    return configs[action] || {};
  };

  if (loading) {
    return <LoadingState message="Loading quotation..." />;
  }

  if (!quotation) {
    return null;
  }

  // Normalize status to lowercase for comparison
  const status = (quotation.status || '').toLowerCase();
  
  const canEdit = ['draft', 'rejected'].includes(status) && hasPermission('quotations:update');
  const canSubmit = status === 'draft' && hasPermission('quotations:submit');
  const canEngineerApprove = status === 'submitted' && hasPermission('quotations:engineer_approve');
  const canManagementApprove = status === 'engineer approved' && hasPermission('quotations:management_approve');
  const canReject = ['submitted', 'engineer approved', 'management approved'].includes(status) && hasPermission('quotations:reject');
  const canIssue = status === 'management approved' && hasPermission('quotations:issue');
  const canRevert = status === 'rejected' && hasPermission('quotations:update');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quotations')} className="p-2 rounded-lg hover:bg-industrial-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-industrial-900 font-mono">
                {quotation.quote_number}
              </h1>
              <StatusBadge status={quotation.status} />
            </div>
            <p className="text-industrial-500">{quotation.company_name}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link to={`/quotations/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          )}
          {canSubmit && (
            <Button onClick={() => openActionModal('submit')}>
              <Send className="w-4 h-4" />
              Submit
            </Button>
          )}
          {canEngineerApprove && (
            <Button variant="success" onClick={() => openActionModal('engineer_approve')}>
              <CheckCircle className="w-4 h-4" />
              Engineer Approve
            </Button>
          )}
          {canManagementApprove && (
            <Button variant="success" onClick={() => openActionModal('management_approve')}>
              <CheckCircle className="w-4 h-4" />
              Management Approve
            </Button>
          )}
          {canReject && (
            <Button variant="danger" onClick={() => openActionModal('reject')}>
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          )}
          {canIssue && (
            <Button onClick={() => openActionModal('issue')}>
              <FileCheck className="w-4 h-4" />
              Issue
            </Button>
          )}
          {canRevert && (
            <Button variant="secondary" onClick={() => openActionModal('revert')}>
              <RotateCcw className="w-4 h-4" />
              Revert to Draft
            </Button>
          )}
          <Button variant="ghost" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="ghost" onClick={handleExportExcel}>
            <Sheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-industrial-500">Customer</p>
              <p className="font-medium text-industrial-900">{quotation.company_name}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-industrial-500">Quote Date</p>
              <p className="font-medium text-industrial-900">
                {new Date(quotation.quote_date).toLocaleDateString()}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-industrial-500">Lead Time</p>
              <p className="font-medium text-industrial-900">{quotation.lead_time || 'Not specified'}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-industrial-500">Total Value</p>
              <p className="font-medium text-industrial-900">
                {quotation.currency} {parseFloat(quotation.total_quote_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Customer & Quote Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-industrial-900">Customer Details</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-industrial-500">Company</p>
                <p className="font-medium">{quotation.company_name}</p>
              </div>
              <div>
                <p className="text-industrial-500">Contact Person</p>
                <p className="font-medium">{quotation.contact_person_name || '-'}</p>
              </div>
              <div>
                <p className="text-industrial-500">Email</p>
                <p className="font-medium">{quotation.customer_email || '-'}</p>
              </div>
              <div>
                <p className="text-industrial-500">Phone</p>
                <p className="font-medium">{quotation.customer_phone || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-industrial-500">Address</p>
                <p className="font-medium">{quotation.customer_address || '-'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-industrial-900">Quote Details</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-industrial-500">Payment Terms</p>
                <p className="font-medium">{quotation.payment_terms || '-'}</p>
              </div>
              <div>
                <p className="text-industrial-500">Shipment Type</p>
                <p className="font-medium">{quotation.shipment_type || '-'}</p>
              </div>
              <div>
                <p className="text-industrial-500">Valid Until</p>
                <p className="font-medium">
                  {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-industrial-500">Created By</p>
                <p className="font-medium">{quotation.created_by_name}</p>
              </div>
            </div>
            {quotation.notes && (
              <div>
                <p className="text-industrial-500">Notes</p>
                <p className="font-medium">{quotation.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-industrial-900">Parts & Operations</h2>
        </CardHeader>
        {(quotation.parts || []).length === 0 ? (
          <CardBody>
            <p className="text-center text-industrial-500 py-8">No parts added to this quotation</p>
          </CardBody>
        ) : (
          <div className="divide-y divide-industrial-200">
            {quotation.parts.map((part) => (
              <div key={part.part_id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-industrial-900">
                      {part.part_number} 
                      <span className="ml-2 text-sm font-normal text-industrial-500">
                        × {part.quantity}
                      </span>
                    </h3>
                    {part.part_description && (
                      <p className="text-sm text-industrial-500">{part.part_description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-industrial-500">Part Subtotal</p>
                    <p className="font-semibold text-industrial-900">
                      {quotation.currency} {parseFloat(part.part_subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="bg-industrial-50 p-3 rounded-lg">
                    <p className="text-industrial-500">Material Cost</p>
                    <p className="font-medium">{quotation.currency} {parseFloat(part.unit_material_cost).toFixed(2)}</p>
                  </div>
                  <div className="bg-industrial-50 p-3 rounded-lg">
                    <p className="text-industrial-500">Operations Cost</p>
                    <p className="font-medium">{quotation.currency} {parseFloat(part.unit_operations_cost).toFixed(2)}</p>
                  </div>
                  <div className="bg-industrial-50 p-3 rounded-lg">
                    <p className="text-industrial-500">Auxiliary Cost</p>
                    <p className="font-medium">{quotation.currency} {parseFloat(part.unit_auxiliary_cost).toFixed(2)}</p>
                  </div>
                </div>

                {/* Operations */}
                {part.operations && part.operations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-industrial-700 mb-2">Operations</h4>
                    <Table>
                      <thead>
                        <tr>
                          <th>Machine</th>
                          <th>Operation</th>
                          <th className="text-right">Time (hrs)</th>
                          <th className="text-right">Rate/hr</th>
                          <th className="text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.operations.map((op) => (
                          <tr key={op.operation_id}>
                            <td>{op.machine_name}</td>
                            <td>{op.operation_name || '-'}</td>
                            <td className="text-right">{parseFloat(op.estimated_time_hours).toFixed(2)}</td>
                            <td className="text-right">{quotation.currency} {parseFloat(op.hourly_rate).toFixed(2)}</td>
                            <td className="text-right font-medium">{quotation.currency} {parseFloat(op.operation_cost).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* Auxiliary Costs */}
                {part.auxiliaryCosts && part.auxiliaryCosts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-industrial-700 mb-2">Auxiliary Costs</h4>
                    <Table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Notes</th>
                          <th className="text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.auxiliaryCosts.map((aux) => (
                          <tr key={aux.part_aux_id}>
                            <td>{aux.aux_type}</td>
                            <td>{aux.notes || '-'}</td>
                            <td className="text-right font-medium">{quotation.currency} {parseFloat(aux.cost).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-industrial-900">Pricing Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-industrial-600">
              <span>Subtotal</span>
              <span>{quotation.currency} {parseFloat(quotation.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>Discount ({quotation.discount_percent}%)</span>
              <span className="text-red-600">- {quotation.currency} {parseFloat(quotation.discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>Margin ({quotation.margin_percent}%)</span>
              <span className="text-emerald-600">+ {quotation.currency} {parseFloat(quotation.margin_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-industrial-600">
              <span>VAT ({quotation.vat_percent}%)</span>
              <span>+ {quotation.currency} {parseFloat(quotation.vat_amount).toFixed(2)}</span>
            </div>
            <div className="border-t border-industrial-200 pt-3 flex justify-between text-xl font-bold text-industrial-900">
              <span>Total</span>
              <span>{quotation.currency} {parseFloat(quotation.total_quote_value).toFixed(2)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Audit Log */}
      {quotation.auditLog && quotation.auditLog.length > 0 && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <History className="w-5 h-5 text-industrial-500" />
            <h2 className="font-semibold text-industrial-900">Activity History</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {quotation.auditLog.map((log) => (
                <div key={log.log_id} className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-industrial-900">{log.action}</span>
                      {log.old_status && log.new_status && (
                        <span className="text-sm text-industrial-500">
                          ({log.old_status} → {log.new_status})
                        </span>
                      )}
                    </div>
                    {log.comments && (
                      <p className="text-sm text-industrial-600 mt-1">{log.comments}</p>
                    )}
                    <p className="text-xs text-industrial-400 mt-1">
                      {log.performed_by_name} • {new Date(log.performed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, action: null })}
        title={getActionConfig(actionModal.action).title}
        size="sm"
      >
        <div className="space-y-4">
          <Textarea
            label={actionModal.action === 'reject' ? 'Rejection Reason *' : 'Comments (Optional)'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={actionModal.action === 'reject' ? 'Please provide a reason for rejection...' : 'Add any comments...'}
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setActionModal({ open: false, action: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={getActionConfig(actionModal.action).variant}
              onClick={handleAction}
              loading={actionLoading}
            >
              {getActionConfig(actionModal.action).button}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuotationDetail;
