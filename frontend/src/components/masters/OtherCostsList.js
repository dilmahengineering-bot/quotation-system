import React, { useState, useEffect } from 'react';
import { otherCostsAPI } from '../../services/api';
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

const OtherCostsList = () => {
  const { hasPermission } = useAuth();
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [formData, setFormData] = useState({
    costType: '',
    description: '',
    defaultRate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const response = await otherCostsAPI.getTypes();
      setCosts(response.data);
    } catch (error) {
      toast.error('Failed to load other costs');
    } finally {
      setLoading(false);
    }
  };

  const filteredCosts = costs.filter(cost => 
    cost.cost_type?.toLowerCase().includes(search.toLowerCase()) ||
    cost.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await otherCostsAPI.deleteType(deleteDialog.id);
      toast.success('Other cost type deleted');
      setCosts(costs.filter(c => c.other_cost_id !== deleteDialog.id));
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
        costType: cost.cost_type,
        description: cost.description || '',
        defaultRate: cost.default_rate,
      });
    } else {
      setEditingCost(null);
      setFormData({
        costType: '',
        description: '',
        defaultRate: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        cost_type: formData.costType,
        description: formData.description,
        default_rate: parseFloat(formData.defaultRate),
      };
      
      console.log('Submitting payload:', payload);
      console.log('Editing cost ID:', editingCost?.other_cost_id);
      
      if (editingCost) {
        const response = await otherCostsAPI.updateType(editingCost.other_cost_id, payload);
        console.log('Update response:', response);
        toast.success('Other cost type updated');
      } else {
        const response = await otherCostsAPI.createType(payload);
        console.log('Create response:', response);
        toast.success('Other cost type created');
      }
      setModalOpen(false);
      fetchCosts();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && costs.length === 0) {
    return <LoadingState message="Loading other costs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Other Costs</h1>
          <p className="text-industrial-500">Manage salary, rent, insurance, and other fixed costs</p>
        </div>
        {hasPermission('admin') && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add Cost Type
          </Button>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-industrial-400" />
              <input
                type="text"
                placeholder="Search cost types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
              />
            </div>
          </div>

          {filteredCosts.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No cost types found"
              description={search ? "Try a different search term" : "Add your first cost type to get started"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-industrial-200">
                    <th className="text-left py-3 px-4 font-semibold text-industrial-700">Cost Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-industrial-700">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-industrial-700">Default Rate</th>
                    <th className="text-center py-3 px-4 font-semibold text-industrial-700">Status</th>
                    {hasPermission('admin') && (
                      <th className="text-center py-3 px-4 font-semibold text-industrial-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCosts.map((cost) => (
                    <tr key={cost.other_cost_id} className="border-b border-industrial-100 hover:bg-industrial-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-industrial-900">{cost.cost_type}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-industrial-600">{cost.description || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-industrial-900">
                          LKR {parseFloat(cost.default_rate).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={cost.is_active ? 'success' : 'secondary'}>
                          {cost.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      {hasPermission('admin') && (
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(cost)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ open: true, id: cost.other_cost_id })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCost ? 'Edit Other Cost Type' : 'Add Other Cost Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cost Type *"
            placeholder="e.g., Salary Cost - Technician"
            value={formData.costType}
            onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Default Rate (per unit) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 308.99"
            value={formData.defaultRate}
            onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
            required
          />
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editingCost ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Other Cost Type"
        message="Are you sure you want to delete this cost type? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default OtherCostsList;
