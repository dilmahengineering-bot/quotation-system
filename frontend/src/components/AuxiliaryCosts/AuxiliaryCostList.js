import React, { useState, useEffect } from 'react';
import { auxiliaryCostAPI } from '../../services/api';

function AuxiliaryCostList() {
  const [auxiliaryCosts, setAuxiliaryCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [formData, setFormData] = useState({
    aux_type: '',
    description: '',
    default_cost: ''
  });

  useEffect(() => {
    fetchAuxiliaryCosts();
  }, []);

  const fetchAuxiliaryCosts = async () => {
    try {
      const response = await auxiliaryCostAPI.getAll();
      setAuxiliaryCosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auxiliary costs:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCost) {
        await auxiliaryCostAPI.update(editingCost.aux_type_id, formData);
      } else {
        await auxiliaryCostAPI.create(formData);
      }
      fetchAuxiliaryCosts();
      closeModal();
    } catch (error) {
      console.error('Error saving auxiliary cost:', error);
      alert('Error saving auxiliary cost. Please try again.');
    }
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    setFormData({
      aux_type: cost.aux_type,
      description: cost.description || '',
      default_cost: cost.default_cost
    });
    setShowModal(true);
  };

  const handleDisable = async (id) => {
    if (window.confirm('Are you sure you want to disable this auxiliary cost?')) {
      try {
        await auxiliaryCostAPI.disable(id);
        fetchAuxiliaryCosts();
      } catch (error) {
        console.error('Error disabling auxiliary cost:', error);
      }
    }
  };

  const openModal = () => {
    setEditingCost(null);
    setFormData({ aux_type: '', description: '', default_cost: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCost(null);
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
          <h2>Auxiliary Costs</h2>
          <button className="btn btn-primary" onClick={openModal}>
            Add New Auxiliary Cost
          </button>
        </div>
        <div className="card-body">
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
              {auxiliaryCosts.map((cost) => (
                <tr key={cost.aux_type_id}>
                  <td>{cost.aux_type_id}</td>
                  <td>{cost.aux_type}</td>
                  <td>{cost.description}</td>
                  <td>${parseFloat(cost.default_cost).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${cost.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      {cost.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => handleEdit(cost)}
                      >
                        Edit
                      </button>
                      {cost.is_active && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDisable(cost.aux_type_id)}
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
              <h3>{editingCost ? 'Edit Auxiliary Cost' : 'Add New Auxiliary Cost'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.aux_type}
                  onChange={(e) => setFormData({ ...formData, aux_type: e.target.value })}
                  required
                  placeholder="e.g., Setup Cost, Inspection, Tooling"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Describe this auxiliary cost..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Cost ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.default_cost}
                  onChange={(e) => setFormData({ ...formData, default_cost: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCost ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuxiliaryCostList;
