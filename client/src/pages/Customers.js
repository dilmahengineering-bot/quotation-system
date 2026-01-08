import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customerApi } from '../utils/api';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '../components/Icons';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    contact_person_name: '',
    email: '',
    phone: '',
    vat_number: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await customerApi.getAll({ search: searchTerm });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        company_name: customer.company_name,
        address: customer.address || '',
        contact_person_name: customer.contact_person_name || '',
        email: customer.email,
        phone: customer.phone || '',
        vat_number: customer.vat_number || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        company_name: '',
        address: '',
        contact_person_name: '',
        email: '',
        phone: '',
        vat_number: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.customer_id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerApi.create(formData);
        toast.success('Customer created successfully');
      }
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disable this customer?')) return;
    try {
      await customerApi.delete(id);
      toast.success('Customer disabled successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to disable customer');
    }
  };

  if (loading) return <Loading text="Loading customers..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Master</h1>
          <p className="page-subtitle">Manage customer information for quotations</p>
        </div>
        <div className="flex gap-md items-center">
          <div className="search-bar">
            <IconSearch />
            <input
              type="text"
              className="form-input"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-accent" onClick={() => handleOpenModal()}>
            <IconPlus /> Add Customer
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No customers found</div>
                <div className="empty-state-text">
                  {searchTerm ? 'Try a different search term' : 'Add your first customer to get started'}
                </div>
                {!searchTerm && (
                  <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <IconPlus /> Add Customer
                  </button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Company Name</th>
                      <th>Contact Person</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.customer_id}>
                        <td className="font-mono text-muted">#{customer.customer_id}</td>
                        <td>
                          <strong>{customer.company_name}</strong>
                          {customer.vat_number && (
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              VAT: {customer.vat_number}
                            </div>
                          )}
                        </td>
                        <td>{customer.contact_person_name || '-'}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone || '-'}</td>
                        <td>
                          <span className={`badge ${customer.is_active ? 'badge-active' : 'badge-inactive'}`}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              onClick={() => handleOpenModal(customer)}
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDelete(customer.customer_id)}
                              title="Disable"
                            >
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

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="large"
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingCustomer ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" name="company_name" className="form-input" value={formData.company_name} onChange={handleChange} placeholder="e.g., Acme Industries" required />
            </div>
            <div className="form-group">
              <label className="form-label">VAT Number</label>
              <input type="text" name="vat_number" className="form-input" value={formData.vat_number} onChange={handleChange} placeholder="e.g., US12-3456789" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea name="address" className="form-textarea" value={formData.address} onChange={handleChange} placeholder="Full business address" rows={2} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input type="text" name="contact_person_name" className="form-input" value={formData.contact_person_name} onChange={handleChange} placeholder="e.g., John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="e.g., contact@company.com" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="e.g., +1-555-0100" />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Customers;
