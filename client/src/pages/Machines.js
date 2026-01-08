import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { machineApi } from '../utils/api';
import { formatCurrency, MACHINE_TYPES } from '../utils/helpers';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    machine_name: '',
    machine_type: 'Milling',
    hourly_rate: '',
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await machineApi.getAll();
      setMachines(response.data);
    } catch (error) {
      toast.error('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (machine = null) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        machine_name: machine.machine_name,
        machine_type: machine.machine_type,
        hourly_rate: machine.hourly_rate,
      });
    } else {
      setEditingMachine(null);
      setFormData({
        machine_name: '',
        machine_type: 'Milling',
        hourly_rate: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMachine(null);
    setFormData({
      machine_name: '',
      machine_type: 'Milling',
      hourly_rate: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMachine) {
        await machineApi.update(editingMachine.machine_id, formData);
        toast.success('Machine updated successfully');
      } else {
        await machineApi.create(formData);
        toast.success('Machine created successfully');
      }
      handleCloseModal();
      fetchMachines();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await machineApi.toggle(id);
      toast.success('Machine status updated');
      fetchMachines();
    } catch (error) {
      toast.error('Failed to update machine status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disable this machine?')) return;
    
    try {
      await machineApi.delete(id);
      toast.success('Machine disabled successfully');
      fetchMachines();
    } catch (error) {
      toast.error('Failed to disable machine');
    }
  };

  if (loading) return <Loading text="Loading machines..." />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Machine Master</h1>
          <p className="page-subtitle">Manage machine costing data for quotation calculations</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <IconPlus /> Add Machine
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {machines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No machines found</div>
                <div className="empty-state-text">Add your first machine to get started</div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <IconPlus /> Add Machine
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Machine Name</th>
                      <th>Type</th>
                      <th>Hourly Rate</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((machine) => (
                      <tr key={machine.machine_id}>
                        <td className="font-mono text-muted">#{machine.machine_id}</td>
                        <td>{machine.machine_name}</td>
                        <td>
                          <span className="machine-type">{machine.machine_type}</span>
                        </td>
                        <td>
                          <span className="cost">{parseFloat(machine.hourly_rate).toFixed(2)}</span>
                          <span className="text-muted"> /hr</span>
                        </td>
                        <td>
                          <span className={`badge ${machine.is_active ? 'badge-active' : 'badge-inactive'}`}>
                            {machine.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              onClick={() => handleOpenModal(machine)}
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => machine.is_active ? handleDelete(machine.machine_id) : handleToggle(machine.machine_id)}
                              title={machine.is_active ? 'Disable' : 'Enable'}
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
        title={editingMachine ? 'Edit Machine' : 'Add New Machine'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingMachine ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Machine Name *</label>
            <input
              type="text"
              name="machine_name"
              className="form-input"
              value={formData.machine_name}
              onChange={handleChange}
              placeholder="e.g., CNC Mill Pro 5000"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Machine Type *</label>
            <select
              name="machine_type"
              className="form-select"
              value={formData.machine_type}
              onChange={handleChange}
              required
            >
              {MACHINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hourly Rate ($) *</label>
            <input
              type="number"
              name="hourly_rate"
              className="form-input"
              value={formData.hourly_rate}
              onChange={handleChange}
              placeholder="e.g., 85.00"
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

export default Machines;
