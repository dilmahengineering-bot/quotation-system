import React, { useState, useEffect } from 'react';
import { machinesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Table,
  Badge,
  LoadingState,
  EmptyState,
  Modal,
  ConfirmDialog,
} from '../common/FormElements';
import { Plus, Search, Edit, Trash2, Cog } from 'lucide-react';
import toast from 'react-hot-toast';

const MachinesList = () => {
  const { hasPermission } = useAuth();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    machineName: '',
    machineType: '',
    hourlyRate: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const machineTypes = [
    { value: 'Milling', label: 'Milling' },
    { value: 'Turning', label: 'Turning' },
    { value: 'EDM', label: 'EDM' },
    { value: 'WEDM', label: 'WEDM' },
    { value: 'Grinding', label: 'Grinding' },
    { value: 'Drilling', label: 'Drilling' },
    { value: 'Laser', label: 'Laser' },
    { value: 'Welding', label: 'Welding' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await machinesAPI.getAll();
      setMachines(response.data);
    } catch (error) {
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await machinesAPI.getAll({ search });
      setMachines(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await machinesAPI.disable(deleteDialog.id);
      toast.success('Machine disabled');
      setMachines(machines.filter(m => m.machine_id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (machine = null) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        machineName: machine.machine_name,
        machineType: machine.machine_type,
        hourlyRate: machine.hourly_rate,
        description: machine.description || '',
      });
    } else {
      setEditingMachine(null);
      setFormData({
        machineName: '',
        machineType: '',
        hourlyRate: '',
        description: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        machine_name: formData.machineName,
        machine_type: formData.machineType,
        hourly_rate: formData.hourlyRate,
        description: formData.description
      };
      if (editingMachine) {
        await machinesAPI.update(editingMachine.machine_id, payload);
        toast.success('Machine updated');
      } else {
        await machinesAPI.create(payload);
        toast.success('Machine created');
      }
      setModalOpen(false);
      fetchMachines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Milling: 'primary',
      Turning: 'info',
      EDM: 'warning',
      WEDM: 'warning',
      Grinding: 'success',
      Drilling: 'default',
      Laser: 'danger',
      Welding: 'purple',
      Other: 'default',
    };
    return colors[type] || 'default';
  };

  if (loading && machines.length === 0) {
    return <LoadingState message="Loading machines..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Machines</h1>
          <p className="text-industrial-500">Manage machine rates and settings</p>
        </div>
        {hasPermission('machines:create') && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add Machine
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
                placeholder="Search machines..."
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
        {machines.length === 0 ? (
          <EmptyState
            icon={Cog}
            title="No machines found"
            description="Add your first machine to get started"
            action={hasPermission('machines:create') && (
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4" />
                Add Machine
              </Button>
            )}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Machine Name</th>
                <th>Type</th>
                <th className="text-right">Hourly Rate</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.machine_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-industrial-100 flex items-center justify-center">
                        <Cog className="w-5 h-5 text-industrial-600" />
                      </div>
                      <span className="font-medium">{machine.machine_name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={getTypeColor(machine.machine_type)}>
                      {machine.machine_type}
                    </Badge>
                  </td>
                  <td className="text-right font-mono font-medium">
                    ${parseFloat(machine.hourly_rate).toFixed(2)}/hr
                  </td>
                  <td className="text-industrial-500 max-w-xs truncate">
                    {machine.description || '-'}
                  </td>
                  <td>
                    <Badge variant={machine.is_active ? 'success' : 'danger'}>
                      {machine.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('machines:update') && (
                        <button
                          onClick={() => openModal(machine)}
                          className="p-2 text-industrial-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('machines:delete') && (
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: machine.machine_id })}
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
        title={editingMachine ? 'Edit Machine' : 'Add Machine'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Machine Name *"
            value={formData.machineName}
            onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
            required
          />
          <Select
            label="Machine Type *"
            options={machineTypes}
            value={formData.machineType}
            onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
            required
          />
          <Input
            label="Hourly Rate ($) *"
            type="number"
            step="0.01"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingMachine ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Machine"
        message="Are you sure you want to delete this machine?"
        loading={deleting}
      />
    </div>
  );
};

export default MachinesList;
