import React, { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    contact_person_name: '',
    email: '',
    phone: '',
    vat_number: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer.customer_id, formData);
      } else {
        await customerAPI.create(formData);
      }
      fetchCustomers();
      closeModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please check if the email is already in use.');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.company_name,
      address: customer.address || '',
      contact_person_name: customer.contact_person_name || '',
      email: customer.email,
      phone: customer.phone || '',
      vat_number: customer.vat_number || ''
    });
    setShowModal(true);
  };

  const handleDisable = async (id) => {
    if (window.confirm('Are you sure you want to disable this customer?')) {
      try {
        await customerAPI.disable(id);
        fetchCustomers();
      } catch (error) {
        console.error('Error disabling customer:', error);
      }
    }
  };

  const openModal = () => {
    setEditingCustomer(null);
    setFormData({
      company_name: '',
      address: '',
      contact_person_name: '',
      email: '',
      phone: '',
      vat_number: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

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
          <h2>Customers</h2>
          <button className="btn btn-primary" onClick={openModal}>
            Add New Customer
          </button>
        </div>
        <div className="card-body">
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
                  <td>{customer.customer_id}</td>
                  <td>{customer.company_name}</td>
                  <td>{customer.contact_person_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className={`badge ${customer.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      {customer.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      {customer.is_active && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDisable(customer.customer_id)}
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_person_name}
                  onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">VAT Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;
