import React, { useState, useEffect } from 'react';
import { auxiliaryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  Badge,
  LoadingState,
  EmptyState,
  Modal,
  ConfirmDialog,
} from '../common/FormElements';
import { Plus, Search, Edit, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AuxiliaryCostsList = () => {
  const { hasPermission } = useAuth();
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [formData, setFormData] = useState({
    auxType: '',
    description: '',
    defaultCost: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const response = await auxiliaryAPI.getAll();
      setCosts(response.data);
    } catch (error) {
      toast.error('Failed to load auxiliary costs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await auxiliaryAPI.getAll({ search });
      setCosts(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await auxiliaryAPI.disable(deleteDialog.id);
      toast.success('Auxiliary cost disabled');
      setCosts(costs.filter(c => c.aux_type_id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (cost = null) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        auxType: cost.aux_type,
        description: cost.description || '',
        defaultCost: cost.default_cost,
      });
    } else {
      setEditingCost(null);
      setFormData({
        auxType: '',
        description: '',
        defaultCost: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCost) {
        await auxiliaryAPI.update(editingCost.aux_type_id, formData);
        toast.success('Auxiliary cost updated');
      } else {
        await auxiliaryAPI.create(formData);
        toast.success('Auxiliary cost created');
      }
      setModalOpen(false);
      fetchCosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && costs.length === 0) {
    return <LoadingState message="Loading auxiliary costs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Auxiliary Costs</h1>
          <p className="text-industrial-500">Manage setup, tooling, and other costs</p>
        </div>
        {hasPermission('auxiliary:create') && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add Cost Type
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
                placeholder="Search costs..."
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
        {costs.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No auxiliary costs found"
            description="Add your first cost type to get started"
            action={hasPermission('auxiliary:create') && (
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4" />
                Add Cost Type
              </Button>
            )}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Cost Type</th>
                <th>Description</th>
                <th className="text-right">Default Cost</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.aux_type_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-medium">{cost.aux_type}</span>
                    </div>
                  </td>
                  <td className="text-industrial-500 max-w-xs truncate">
                    {cost.description || '-'}
                  </td>
                  <td className="text-right font-mono font-medium">
                    LKR {parseFloat(cost.default_cost).toFixed(2)}
                  </td>
                  <td>
                    <Badge variant={cost.is_active ? 'success' : 'danger'}>
                      {cost.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('auxiliary:update') && (
                        <button
                          onClick={() => openModal(cost)}
                          className="p-2 text-industrial-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('auxiliary:delete') && (
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: cost.aux_type_id })}
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
        title={editingCost ? 'Edit Auxiliary Cost' : 'Add Auxiliary Cost'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cost Type *"
            placeholder="e.g., Setup, Inspection, Tooling"
            value={formData.auxType}
            onChange={(e) => setFormData({ ...formData, auxType: e.target.value })}
            required
          />
          <Input
            label="Default Cost (LKR) *"
            type="number"
            step="0.01"
            min="0"
            value={formData.defaultCost}
            onChange={(e) => setFormData({ ...formData, defaultCost: e.target.value })}
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
              {editingCost ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Auxiliary Cost"
        message="Are you sure you want to delete this auxiliary cost type?"
        loading={deleting}
      />
    </div>
  );
};

export default AuxiliaryCostsList;
