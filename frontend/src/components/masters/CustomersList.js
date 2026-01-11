import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  LoadingState,
  EmptyState,
  Modal,
  ConfirmDialog,
} from '../common/FormElements';
import { Plus, Search, Eye, Edit, Trash2, Building2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomersList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    contactPersonName: '',
    email: '',
    phone: '',
    vatNumber: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.getAll({ search });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customersAPI.disable(deleteDialog.id);
      toast.success('Customer disabled');
      setCustomers(customers.filter(c => c.customer_id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        companyName: customer.company_name,
        address: customer.address || '',
        contactPersonName: customer.contact_person_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        vatNumber: customer.vat_number || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        companyName: '',
        address: '',
        contactPersonName: '',
        email: '',
        phone: '',
        vatNumber: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.customer_id, formData);
        toast.success('Customer updated');
      } else {
        await customersAPI.create(formData);
        toast.success('Customer created');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && customers.length === 0) {
    return <LoadingState message="Loading customers..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Customers</h1>
          <p className="text-industrial-500">Manage your customer database</p>
        </div>
        {hasPermission('customers:create') && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-industrial-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        {customers.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No customers found"
            description="Add your first customer to get started"
            action={hasPermission('customers:create') && (
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            )}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>VAT Number</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customer_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium">{customer.company_name}</span>
                    </div>
                  </td>
                  <td>{customer.contact_person_name || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.vat_number || '-'}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('customers:update') && (
                        <button
                          onClick={() => openModal(customer)}
                          className="p-2 text-industrial-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('customers:delete') && (
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: customer.customer_id })}
                          className="p-2 text-industrial-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            label="Contact Person"
            value={formData.contactPersonName}
            onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="VAT Number"
            value={formData.vatNumber}
            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        loading={deleting}
      />
    </div>
  );
};

export default CustomersList;
