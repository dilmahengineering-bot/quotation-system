import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
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
import { Plus, Search, Edit, Trash2, Users, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const UsersList = () => {
  const { hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: '',
    email: '',
    phone: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const roles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Technician', label: 'Technician' },
    { value: 'Engineer', label: 'Engineer' },
    { value: 'Management', label: 'Management' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ search });
      setUsers(response.data);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersAPI.disable(deleteDialog.id);
      toast.success('User disabled successfully');
      fetchUsers();
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to disable user');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.full_name,
        username: user.username,
        password: '',
        role: user.role,
        email: user.email,
        phone: user.phone || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        username: '',
        password: '',
        role: '',
        email: '',
        phone: '',
      });
    }
    setModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setEditingUser(user);
    setNewPassword('');
    setPasswordModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const { password, username, phone, ...updateData } = formData;
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role
        };
        await usersAPI.update(editingUser.user_id, payload);
        toast.success('User updated successfully');
      } else {
        const payload = {
          username: formData.username,
          password: formData.password,
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role
        };
        await usersAPI.create(payload);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await usersAPI.resetPassword(editingUser.user_id, { newPassword });
      toast.success('Password reset successfully');
      setPasswordModalOpen(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      Admin: 'danger',
      Sales: 'info',
      Technician: 'default',
      Engineer: 'warning',
      Management: 'purple',
    };
    return variants[role] || 'default';
  };

  if (loading && users.length === 0) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Users</h1>
          <p className="text-industrial-500">Manage user accounts and permissions</p>
        </div>
        {hasPermission('users:create') && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add User
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
                placeholder="Search users..."
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
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Add your first user to get started"
            action={hasPermission('users:create') && (
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            )}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('users:update') && (
                        <>
                          <button
                            onClick={() => openModal(user)}
                            className="p-2 text-industrial-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-industrial-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {hasPermission('users:delete') && user.user_id !== currentUser?.userId && (
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: user.user_id })}
                          className="p-2 text-industrial-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Disable"
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
        title={editingUser ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          {!editingUser && (
            <>
              <Input
                label="Username *"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Select
            label="Role *"
            options={roles}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Reset Password"
        size="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-industrial-600">
            Reset password for <span className="font-medium">{editingUser?.full_name}</span>
          </p>
          <Input
            label="New Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimum 8 characters"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Disable User"
        message="Are you sure you want to disable this user? They will no longer be able to login."
        confirmText="Disable"
        loading={deleting}
      />
    </div>
  );
};

export default UsersList;
