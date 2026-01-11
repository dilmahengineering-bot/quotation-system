import React, { useState, useEffect } from 'react';
import { machinesAPI } from '../../services/api';

function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    machine_name: '',
    machine_type: '',
    hourly_rate: ''
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await machinesAPI.getAll();
      setMachines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await machinesAPI.update(editingMachine.machine_id, formData);
      } else {
        await machinesAPI.create(formData);
      }
      fetchMachines();
      closeModal();
    } catch (error) {
      console.error('Error saving machine:', error);
      alert('Error saving machine. Please try again.');
    }
  };

  const handleEdit = (machine) => {
    setEditingMachine(machine);
    setFormData({
      machine_name: machine.machine_name,
      machine_type: machine.machine_type,
      hourly_rate: machine.hourly_rate
    });
    setShowModal(true);
  };

  const handleDisable = async (id) => {
    if (window.confirm('Are you sure you want to disable this machine?')) {
      try {
        await machinesAPI.disable(id);
        fetchMachines();
      } catch (error) {
        console.error('Error disabling machine:', error);
      }
    }
  };

  const openModal = () => {
    setEditingMachine(null);
    setFormData({ machine_name: '', machine_type: '', hourly_rate: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMachine(null);
    setFormData({ machine_name: '', machine_type: '', hourly_rate: '' });
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
          <h2>Machines</h2>
          <button className="btn btn-primary" onClick={openModal}>
            Add New Machine
          </button>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Machine Name</th>
                <th>Machine Type</th>
                <th>Hourly Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.machine_id}>
                  <td>{machine.machine_id}</td>
                  <td>{machine.machine_name}</td>
                  <td>{machine.machine_type}</td>
                  <td>${parseFloat(machine.hourly_rate).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${machine.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      {machine.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => handleEdit(machine)}
                      >
                        Edit
                      </button>
                      {machine.is_active && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDisable(machine.machine_id)}
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
              <h3>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Machine Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.machine_name}
                  onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Machine Type</label>
                <select
                  className="form-control"
                  value={formData.machine_type}
                  onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Milling">Milling</option>
                  <option value="Turning">Turning</option>
                  <option value="EDM">EDM</option>
                  <option value="WEDM">WEDM</option>
                  <option value="Grinding">Grinding</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMachine ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MachineList;
