import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quotationsAPI, customersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Table,
  StatusBadge,
  LoadingState,
  EmptyState,
  ConfirmDialog,
} from '../common/FormElements';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuotationsList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customerId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotationsRes, customersRes] = await Promise.all([
        quotationsAPI.getAll(),
        customersAPI.getAll({ status: 'active' }),
      ]);
      setQuotations(quotationsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.customerId) params.customerId = filters.customerId;
      
      const response = await quotationsAPI.getAll(params);
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to filter quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await quotationsAPI.delete(deleteDialog.id);
      toast.success('Quotation deleted successfully');
      setQuotations(quotations.filter(q => q.quotation_id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete quotation');
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Engineer Approved', label: 'Engineer Approved' },
    { value: 'Management Approved', label: 'Management Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Issued', label: 'Issued' },
  ];

  const customerOptions = customers.map(c => ({
    value: c.customer_id,
    label: c.company_name,
  }));

  if (loading && quotations.length === 0) {
    return <LoadingState message="Loading quotations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Quotations</h1>
          <p className="text-industrial-500">Manage your quotations and pricing</p>
        </div>
        {hasPermission('quotations:create') && (
          <Link to="/quotations/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Quotation
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-industrial-400" />
              <input
                type="text"
                placeholder="Search by quote number..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
            <Select
              placeholder="All Statuses"
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            />
            <Select
              placeholder="All Customers"
              options={customerOptions}
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            />
            <Button onClick={handleFilter} variant="secondary">
              <Filter className="w-4 h-4" />
              Apply Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Quotations Table */}
      <Card>
        {quotations.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotations found"
            description="Create your first quotation to get started"
            action={
              hasPermission('quotations:create') && (
                <Link to="/quotations/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Create Quotation
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Total Value</th>
                <th>Created By</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quotation) => (
                <tr key={quotation.quotation_id}>
                  <td>
                    <Link
                      to={`/quotations/${quotation.quotation_id}`}
                      className="font-mono text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {quotation.quote_number}
                    </Link>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-industrial-900">{quotation.customer_name}</p>
                      {quotation.contact_person_name && (
                        <p className="text-sm text-industrial-500">{quotation.contact_person_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-industrial-600">
                    {new Date(quotation.quote_date).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={quotation.status} />
                  </td>
                  <td className="text-right font-medium">
                    {quotation.currency} {parseFloat(quotation.total_quote_value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-industrial-600">{quotation.created_by_name}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/quotations/${quotation.quotation_id}`)}
                        className="p-2 text-industrial-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {quotation.status === 'Draft' && hasPermission('quotations:delete') && (
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: quotation.quotation_id })}
                          className="p-2 text-industrial-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default QuotationsList;
