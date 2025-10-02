'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PlusIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Entity {
  _id: string;
  name: string;
  type: 'entity' | 'company' | 'department';
  parentId?: string;
  level: number;
  path: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Entity[];
}

interface CreateEntityForm {
  name: string;
  type: 'entity' | 'company' | 'department';
  parentId: string;
  isRootEntity: boolean;
}

export default function EntityStructurePage() {
  const { user } = useAuth();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEntityForm>({
    name: '',
    type: 'entity',
    parentId: '',
    isRootEntity: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load entities on mount
  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getEntities();
      setEntities(data);
      
      // Auto-expand root entities
      const rootEntities = data.filter((e: Entity) => !e.parentId);
      setExpandedNodes(new Set(rootEntities.map((e: Entity) => e._id)));
    } catch (err: any) {
      console.error('Error loading entities:', err);
      setError(err.message || 'Failed to load entities');
    } finally {
      setIsLoading(false);
    }
  };

  // Build hierarchical structure
  const buildHierarchy = (entities: Entity[]): Entity[] => {
    const entityMap = new Map<string, Entity>();
    const rootEntities: Entity[] = [];

    // Create a map of all entities
    entities.forEach(entity => {
      entityMap.set(entity._id, { ...entity, children: [] });
    });

    // Build the hierarchy
    entities.forEach(entity => {
      const entityWithChildren = entityMap.get(entity._id)!;
      if (entity.parentId) {
        const parent = entityMap.get(entity.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(entityWithChildren);
        }
      } else {
        rootEntities.push(entityWithChildren);
      }
    });

    return rootEntities;
  };

  const hierarchicalEntities = buildHierarchy(entities);

  const toggleExpanded = (entityId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId);
    } else {
      newExpanded.add(entityId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCreateEntity = async () => {
    if (!createForm.name) {
      setError('Please enter an entity name');
      return;
    }

    if (!createForm.isRootEntity && !createForm.parentId) {
      setError('Please select a parent entity');
      return;
    }

    if (!user?.tenantId) {
      setError('User tenant ID not found');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const newEntity = await api.createEntity({
        name: createForm.name,
        type: createForm.type,
        parentId: createForm.isRootEntity ? undefined : createForm.parentId,
        tenantId: user.tenantId,
      });

      setSuccess(`Entity "${createForm.name}" created successfully!`);
      
      // Reload entities
      await loadEntities();
      
      // Auto-expand the parent node
      if (!createForm.isRootEntity && createForm.parentId) {
        setExpandedNodes(prev => new Set([...prev, createForm.parentId]));
      }
      
      // Reset form and close modal
      setCreateForm({
        name: '',
        type: 'entity',
        parentId: '',
        isRootEntity: true,
      });
      setShowCreateModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating entity:', err);
      setError(err.message || 'Failed to create entity');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteEntity = async (entityId: string, entityName: string) => {
    if (!confirm(`Are you sure you want to delete "${entityName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await api.deleteEntity(entityId);
      setSuccess(`Entity "${entityName}" deleted successfully!`);
      
      // Reload entities
      await loadEntities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting entity:', err);
      setError(err.message || 'Failed to delete entity. It may have children or assigned users.');
    }
  };

  const renderEntity = (entity: Entity, depth: number = 0) => {
    const isExpanded = expandedNodes.has(entity._id);
    const hasChildren = entity.children && entity.children.length > 0;

    return (
      <div key={entity._id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
            depth === 0 ? 'bg-primary-50' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(entity._id)}
            className="mr-2 p-1 hover:bg-gray-200 rounded"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Entity Icon */}
          <div className="mr-3">
            {entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-5 h-5 text-green-600" />
            )}
          </div>

          {/* Entity Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{entity.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                entity.type === 'entity' 
                  ? 'bg-primary-100 text-primary-700'
                  : entity.type === 'company'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {entity.type}
              </span>
              {!entity.parentId && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Root
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Level: {entity.level} • Created: {new Date(entity.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => deleteEntity(entity._id, entity.name)}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete entity"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div>
            {entity.children?.map(child => renderEntity(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entity Structure</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your elastic entity hierarchy with unlimited nesting levels. Create root entities, companies, and departments.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEntities}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Entity
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{entities.length}</div>
            <div className="text-sm text-gray-600">Total Entities</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {entities.filter(e => !e.parentId).length}
            </div>
            <div className="text-sm text-gray-600">Root Entities</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {entities.filter(e => e.type === 'company').length}
            </div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {entities.filter(e => e.type === 'department').length}
            </div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
        </div>

        {/* Entity Tree */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hierarchical Structure</h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading entities...
              </div>
            ) : hierarchicalEntities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-medium">No entities yet</p>
                <p className="text-sm mt-1">Create your first root entity to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Root Entity
                </button>
              </div>
            ) : (
              hierarchicalEntities.map(entity => renderEntity(entity))
            )}
          </div>
        </div>

        {/* Create Entity Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {createForm.isRootEntity ? 'Create Root Entity' : 'Add New Entity'}
                </h3>
                
                <div className="space-y-4">
                  {/* Root Entity Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRootEntity"
                      checked={createForm.isRootEntity}
                      onChange={(e) => setCreateForm({ 
                        ...createForm, 
                        isRootEntity: e.target.checked,
                        parentId: e.target.checked ? '' : createForm.parentId 
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRootEntity" className="ml-2 block text-sm text-gray-900">
                      Create as Root Entity (no parent)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Entity X, Acme Corp, Sales Dept"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Type *
                    </label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="entity">Entity</option>
                      <option value="company">Company</option>
                      <option value="department">Department</option>
                    </select>
                  </div>

                  {!createForm.isRootEntity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Entity *
                      </label>
                      <select
                        value={createForm.parentId}
                        onChange={(e) => setCreateForm({ ...createForm, parentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select parent...</option>
                        {entities.map(entity => (
                          <option key={entity._id} value={entity._id}>
                            {entity.path} ({entity.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                    onClick={handleCreateEntity}
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Entity'
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
