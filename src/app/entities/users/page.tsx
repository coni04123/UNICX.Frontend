'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { e164Users, elasticEntities, type E164User } from '@/data/chatMockData';

interface CreateUserForm {
  name: string;
  email: string;
  e164Number: string;
  entityId: string;
  entityPath: string;
  role: 'TenantAdmin' | 'User';
}

export default function UserManagementPage() {
  const t = useTranslations('administration');

  const [users, setUsers] = useState<E164User[]>(e164Users);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    e164Number: '',
    entityId: '',
    entityPath: '',
    role: 'User'
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isSendingQR, setIsSendingQR] = useState<string | null>(null);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.e164Number.includes(searchQuery) ||
      user.entityPath.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.registrationStatus === statusFilter;
    
    const matchesEntity = entityFilter === 'all' || user.entityPath.includes(entityFilter);
    
    const matchesConnection = connectionFilter === 'all' || 
      (connectionFilter === 'connected' && user.whatsappConnected) ||
      (connectionFilter === 'disconnected' && !user.whatsappConnected);
    
    return matchesSearch && matchesStatus && matchesEntity && matchesConnection;
  });

  const getStatusIcon = (status: E164User['registrationStatus']) => {
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

  const getStatusBadge = (status: E164User['registrationStatus']) => {
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

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.e164Number || !createForm.entityId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: E164User = {
      id: `user-${Date.now()}`,
      e164Number: createForm.e164Number,
      name: createForm.name,
      email: createForm.email,
      entityId: createForm.entityId,
      entityPath: createForm.entityPath,
      role: createForm.role,
      registrationStatus: 'pending',
      whatsappConnected: false,
      initials: createForm.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      isOnline: false,
      lastSeen: 'never'
    };

    setUsers([...users, newUser]);
    setCreateForm({
      name: '',
      email: '',
      e164Number: '',
      entityId: '',
      entityPath: '',
      role: 'User'
    });
    setShowCreateModal(false);
    setIsCreating(false);
  };

  const sendQRCodeEmail = async (user: E164User) => {
    setIsSendingQR(user.id);
    
    // Simulate sending QR code email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user status to invited
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, registrationStatus: 'invited', lastQRCodeSent: new Date().toISOString() }
        : u
    ));
    
    setIsSendingQR(null);
    alert(`QR code invitation sent to ${user.email}`);
  };

  const handleEntitySelect = (entityId: string) => {
    const entity = elasticEntities.find(e => e.id === entityId);
    if (entity) {
      setCreateForm({
        ...createForm,
        entityId: entityId,
        entityPath: entity.path
      });
    }
  };

  const getRegistrationStats = () => {
    const stats = {
      registered: users.filter(u => u.registrationStatus === 'registered').length,
      pending: users.filter(u => u.registrationStatus === 'pending').length,
      invited: users.filter(u => u.registrationStatus === 'invited').length,
      cancelled: users.filter(u => u.registrationStatus === 'cancelled').length,
      total: users.length
    };
    return stats;
  };

  const stats = getRegistrationStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management & Registration Status</h1>
            <p className="mt-2 text-sm text-gray-700">
              Complete E164 user management with registration monitoring, QR code invitations, and WhatsApp connection tracking.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create E164 User
          </button>
        </div>

        {/* Registration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registration Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.registered / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Registration Progress</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? Math.round((stats.registered / stats.total) * 100) : 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.registered} of {stats.total} users registered
              </div>
            </div>
          </div>

          {/* WhatsApp Connection Rate */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QrCodeIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.registered > 0 ? Math.round((users.filter(u => u.whatsappConnected).length / stats.registered) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">WhatsApp Connected</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.registered > 0 ? Math.round((users.filter(u => u.whatsappConnected).length / stats.registered) * 100) : 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {users.filter(u => u.whatsappConnected).length} users connected
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.pending + stats.invited}</div>
                <div className="text-sm text-gray-600">Pending Actions</div>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium">{stats.pending}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Invited:</span>
                <span className="font-medium">{stats.invited}</span>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
            <div className="mt-4">
              {stats.cancelled > 0 ? (
                <div className="text-xs text-red-600">
                  Users who cancelled registration
                </div>
              ) : (
                <div className="text-xs text-green-600">
                  No cancellations
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, E164, or entity..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="invited">Invited</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Entities</option>
                <option value="Company C1">Company C1</option>
                <option value="Company C2">Company C2</option>
                <option value="Company C3">Company C3</option>
                <option value="Sales Department">Sales Department</option>
                <option value="Marketing Department">Marketing Department</option>
                <option value="IT Department">IT Department</option>
                <option value="Operations Department">Operations Department</option>
                <option value="Finance Department">Finance Department</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Legal Department">Legal Department</option>
              </select>
            </div>

            {/* Connection Filter */}
            <div>
              <select
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Connections</option>
                <option value="connected">WhatsApp Connected</option>
                <option value="disconnected">Not Connected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              E164 Users ({filteredUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E164 Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity Path
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {user.initials}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.e164Number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.entityPath}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'TenantAdmin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'TenantAdmin' ? 'Tenant Administrator' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.registrationStatus)}
                        <span className={`ml-2 ${getStatusBadge(user.registrationStatus)}`}>
                          {user.registrationStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.whatsappConnected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.whatsappConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col items-end space-y-1">
                        {user.registrationStatus === 'pending' && (
                          <button
                            onClick={() => sendQRCodeEmail(user)}
                            disabled={isSendingQR === user.id}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isSendingQR === user.id ? (
                              <>
                                <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <QrCodeIcon className="w-4 h-4 mr-1" />
                                Send QR
                              </>
                            )}
                          </button>
                        )}
                        {user.registrationStatus === 'invited' && !user.whatsappConnected && (
                          <>
                            <button
                              onClick={() => sendQRCodeEmail(user)}
                              disabled={isSendingQR === user.id}
                              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                            >
                              {isSendingQR === user.id ? (
                                <>
                                  <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <QrCodeIcon className="w-4 h-4 mr-1" />
                                  Resend QR
                                </>
                              )}
                            </button>
                            {user.lastQRCodeSent && (
                              <div className="text-xs text-gray-500">
                                Last sent: {new Date(user.lastQRCodeSent).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        )}
                        {user.registrationStatus === 'registered' && (
                          <div className="text-xs text-green-600">
                            Registered: {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}
                          </div>
                        )}
                        {user.registrationStatus === 'cancelled' && user.cancellationDate && (
                          <div className="text-xs text-red-600">
                            Cancelled: {new Date(user.cancellationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New E164 User</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E164 Number *
                    </label>
                    <input
                      type="text"
                      value={createForm.e164Number}
                      onChange={(e) => setCreateForm({ ...createForm, e164Number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+14155551234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Assignment *
                    </label>
                    <select
                      value={createForm.entityId}
                      onChange={(e) => handleEntitySelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Entity</option>
                      {elasticEntities.filter(e => e.type === 'department').map(entity => (
                        <option key={entity.id} value={entity.id}>
                          {entity.path}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role *
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'TenantAdmin' | 'User' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="User">User</option>
                      <option value="TenantAdmin">Tenant Administrator</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500">
                      {createForm.role === 'TenantAdmin' 
                        ? 'Can manage sub-tenants and monitor E164 users within their scope'
                        : 'Basic user with limited access to own messages and profile'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create User'}
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
