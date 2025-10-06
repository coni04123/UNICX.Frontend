'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  QrCodeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  registrationStatus: string;
  whatsappConnectionStatus: string;
  entityId: {
    _id: string;
  name: string;
    path: string;
    type: string;
  };
  entityPath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  entityId: string;
  role: string;
}

interface EditUserForm {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entityId: string;
  role: string;
}

interface InviteUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entityId: string;
  role: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [whatsappFilter, setWhatsappFilter] = useState<string>('');

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    entityId: '',
    role: 'User',
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    entityId: '',
    role: 'User',
  });

  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    entityId: '',
    role: 'User',
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadEntities();
    loadStats();
  }, []);

  // Reload users when filters or pagination change
  useEffect(() => {
    loadUsers();
  }, [statusFilter, roleFilter, entityFilter, whatsappFilter, searchQuery, currentPage, pageSize]);

  const loadUsers = async () => {
    try {
      setError('');
      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter) filters.registrationStatus = statusFilter;
      if (roleFilter) filters.role = roleFilter;
      if (entityFilter) filters.entityId = entityFilter;
      if (whatsappFilter) filters.whatsappConnectionStatus = whatsappFilter;
      if (searchQuery) filters.search = searchQuery;

      const data = await api.getUsers(filters);
      setUsers(data.users);
      setTotalUsers(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const data = await api.getEntities();
      setEntities(data);
    } catch (err: any) {
      console.error('Error loading entities:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getUserStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phoneNumber || !createForm.password || !createForm.entityId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number (E.164 format)
    if (!createForm.phoneNumber.startsWith('+')) {
      setError('Phone number must be in E.164 format (e.g., +1234567890)');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      await api.createUser({
        ...createForm,
        tenantId: currentUser?.tenantId || '',
      });

      setSuccess(`User "${createForm.firstName} ${createForm.lastName}" created successfully!`);
      
      // Reload users and stats
      await loadUsers();
      await loadStats();
      
      // Reset form and close modal
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        entityId: '',
        role: 'User',
      });
      setShowCreateModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.phoneNumber || !inviteForm.entityId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number (E.164 format)
    if (!inviteForm.phoneNumber.startsWith('+')) {
      setError('Phone number must be in E.164 format (e.g., +1234567890)');
      return;
    }

    setIsInviting(true);
    setError('');
    setSuccess('');

    try {
      await api.inviteUser({
        ...inviteForm,
        tenantId: currentUser?.tenantId || '',
      });

      setSuccess(`User "${inviteForm.firstName} ${inviteForm.lastName}" invited successfully!`);
      
      // Reload users and stats
      await loadUsers();
      await loadStats();
      
      // Reset form and close modal
      setInviteForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        entityId: '',
        role: 'User',
      });
      setShowInviteModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditForm({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      entityId: typeof user.entityId === 'string' ? user.entityId : (user.entityId?._id || ''),
      role: user.role,
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditUser = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.phoneNumber || !editForm.entityId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsEditing(true);
    setError('');
    setSuccess('');

    try {
      await api.updateUser(editForm._id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        entityId: editForm.entityId,
        role: editForm.role,
      });

      setSuccess(`User "${editForm.firstName} ${editForm.lastName}" updated successfully!`);
      
      // Reload users
      await loadUsers();
      
      // Reset form and close modal
      setEditForm({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        entityId: '',
        role: 'User',
      });
      setShowEditModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await api.deleteUser(userId);
      setSuccess(`User "${userName}" deleted successfully!`);
      
      // Reload users and stats
      await loadUsers();
      await loadStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'invited':
        return <EnvelopeIcon className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'registered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'invited':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (role) {
      case 'SystemAdmin':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'TenantAdmin':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'User':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Complete user management with registration monitoring, invitations, and WhatsApp connection tracking.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Invite User
            </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
              Create User
          </button>
            </div>
          </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {success}
              </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
                </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
              </div>
                <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

            {stats.byRegistrationStatus?.map((stat: any) => {
              const colors: any = {
                registered: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-400' },
                pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-400' },
                invited: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-400' },
                cancelled: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-400' },
              };
              const color = colors[stat._id] || colors.pending;
              
              return (
                <div key={stat._id} className={`${color.bg} rounded-lg border border-gray-200 p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${color.text}`}>{stat.count}</div>
                      <div className="text-sm text-gray-600 capitalize">{stat._id}</div>
              </div>
                    {getStatusIcon(stat._id)}
              </div>
            </div>
              );
            })}
                </div>
              )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                  placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="registered">Registered</option>
                <option value="invited">Invited</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="SystemAdmin">System Admin</option>
                <option value="TenantAdmin">Tenant Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            {/* WhatsApp Filter */}
            <div>
              <select
                value={whatsappFilter}
                onChange={(e) => setWhatsappFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">WhatsApp Status</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="connecting">Connecting</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!users || users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {typeof user.entityId === 'object' && user.entityId ? user.entityId.name : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeof user.entityId === 'object' && user.entityId ? user.entityId.path : user.entityPath || 'N/A'}
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role)}>
                          {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(user.registrationStatus)}>
                          {user.registrationStatus}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(user.whatsappConnectionStatus)}>
                          {user.whatsappConnectionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit user"
                        >
                          <PencilIcon className="w-5 h-5" />
                          </button>
                            <button
                          onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <TrashIcon className="w-5 h-5" />
                            </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
                    <span className="font-medium">{totalUsers}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm text-gray-700">
                      Per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New User
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                    </label>
                    <input
                      type="text"
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (E.164 format) *
                    </label>
                    <input
                      type="tel"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1234567890"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must start with + and country code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity *
                    </label>
                    <select
                      value={createForm.entityId}
                      onChange={(e) => setCreateForm({ ...createForm, entityId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select entity...</option>
                      {entities.map(entity => (
                        <option key={entity._id} value={entity._id}>
                          {entity.path} ({entity.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="User">User</option>
                      <option value="TenantAdmin">Tenant Admin</option>
                      {currentUser?.role === 'SystemAdmin' && (
                        <option value="SystemAdmin">System Admin</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Invite New User
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (E.164 format) *
                    </label>
                    <input
                      type="tel"
                      value={inviteForm.phoneNumber}
                      onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1234567890"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must start with + and country code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity *
                    </label>
                    <select
                      value={inviteForm.entityId}
                      onChange={(e) => setInviteForm({ ...inviteForm, entityId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select entity...</option>
                      {entities.map(entity => (
                        <option key={entity._id} value={entity._id}>
                          {entity.path} ({entity.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="User">User</option>
                      <option value="TenantAdmin">Tenant Admin</option>
                      {currentUser?.role === 'SystemAdmin' && (
                        <option value="SystemAdmin">System Admin</option>
                      )}
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      A temporary password will be automatically generated and sent to the user via email.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteUser}
                    disabled={isInviting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isInviting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit User
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (E.164 format) *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity *
                    </label>
                    <select
                      value={editForm.entityId}
                      onChange={(e) => setEditForm({ ...editForm, entityId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select entity...</option>
                      {entities.map(entity => (
                        <option key={entity._id} value={entity._id}>
                          {entity.path} ({entity.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="User">User</option>
                      <option value="TenantAdmin">Tenant Admin</option>
                      {currentUser?.role === 'SystemAdmin' && (
                        <option value="SystemAdmin">System Admin</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditUser}
                    disabled={isEditing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isEditing ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
