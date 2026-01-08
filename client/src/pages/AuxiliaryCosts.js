import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { auxiliaryCostApi } from '../utils/api';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const AuxiliaryCosts = () => {
  const [auxCosts, setAuxCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuxCost, setEditingAuxCost] = useState(null);
  const [formData, setFormData] = useState({
    aux_type: '',
    description: '',
    default_cost: '',
  });

  useEffect(() => {
    fetchAuxCosts();
  }, []);

  const fetchAuxCosts = async () => {
    try {
      const response = await auxiliaryCostApi.getAll();
      setAuxCosts(response.data);
    } catch (error) {
      toast.error('Failed to fetch auxiliary costs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (auxCost = null) => {
    if (auxCost) {
      setEditingAuxCost(auxCost);
      setFormData({
        aux_type: auxCost.aux_type,
        description: auxCost.description || '',
        default_cost: auxCost.default_cost,
      });
    } else {
      setEditingAuxCost(null);
      setFormData({
        aux_type: '',
        description: '',
        default_cost: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAuxCost(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuxCost) {
        await auxiliaryCostApi.update(editingAuxCost.aux_type_id, formData);
        toast.success('Auxiliary cost updated successfully');
      } else {
        await auxiliaryCostApi.create(formData);
        toast.success('Auxiliary cost created successfully');
      }
      handleCloseModal();
      fetchAuxCosts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disable this auxiliary cost?')) return;
    try {
      await auxiliaryCostApi.delete(id);
      toast.success('Auxiliary cost disabled successfully');
      fetchAuxCosts();
    } catch (error) {
      toast.error('Failed to disable auxiliary cost');
    }
  };

  if (loading) return <Loading text="Loading auxiliary costs..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Auxiliary Cost Master</h1>
          <p className="page-subtitle">Standardize non-machine costs (inspection, setup, transport, tooling, etc.)</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <IconPlus /> Add Auxiliary Cost
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {auxCosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No auxiliary costs found</div>
                <div className="empty-state-text">Add your first auxiliary cost type to get started</div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <IconPlus /> Add Auxiliary Cost
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Default Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auxCosts.map((auxCost) => (
                      <tr key={auxCost.aux_type_id}>
                        <td className="font-mono text-muted">#{auxCost.aux_type_id}</td>
                        <td><strong>{auxCost.aux_type}</strong></td>
                        <td className="text-secondary">{auxCost.description || '-'}</td>
                        <td>
                          <span className="cost">{parseFloat(auxCost.default_cost).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className={`badge ${auxCost.is_active ? 'badge-active' : 'badge-inactive'}`}>
                            {auxCost.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              onClick={() => handleOpenModal(auxCost)}
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDelete(auxCost.aux_type_id)}
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
        title={editingAuxCost ? 'Edit Auxiliary Cost' : 'Add New Auxiliary Cost'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingAuxCost ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Auxiliary Type *</label>
            <input
              type="text"
              name="aux_type"
              className="form-input"
              value={formData.aux_type}
              onChange={handleChange}
              placeholder="e.g., Setup, Inspection, Transport"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this cost type"
              rows={2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Default Cost ($) *</label>
            <input
              type="number"
              name="default_cost"
              className="form-input"
              value={formData.default_cost}
              onChange={handleChange}
              placeholder="e.g., 150.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AuxiliaryCosts;
