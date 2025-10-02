'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PlusIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { elasticEntities, e164Users, type ElasticEntity } from '@/data/chatMockData';

interface CreateEntityForm {
  name: string;
  type: 'company' | 'department';
  parentId: string;
}

export default function EntityStructurePage() {
  const t = useTranslations('entities');

  const [entities, setEntities] = useState<ElasticEntity[]>(elasticEntities);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['entity-x']));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEntityForm>({
    name: '',
    type: 'company',
    parentId: 'entity-x'
  });
  const [isCreating, setIsCreating] = useState(false);

  // Build hierarchical structure
  const buildHierarchy = (entities: ElasticEntity[]): ElasticEntity[] => {
    const entityMap = new Map<string, ElasticEntity>();
    const rootEntities: ElasticEntity[] = [];

    // Create a map of all entities
    entities.forEach(entity => {
      entityMap.set(entity.id, { ...entity, children: [] });
    });

    // Build the hierarchy
    entities.forEach(entity => {
      const entityWithChildren = entityMap.get(entity.id)!;
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

  const getUserCount = (entityPath: string): number => {
    return e164Users.filter(user => user.entityPath.includes(entityPath)).length;
  };

  const handleCreateEntity = async () => {
    if (!createForm.name || !createForm.parentId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    // Find parent entity to build path
    const parent = entities.find(e => e.id === createForm.parentId);
    if (!parent) {
      alert('Parent entity not found');
      setIsCreating(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEntity: ElasticEntity = {
      id: `entity-${Date.now()}`,
      name: createForm.name,
      type: createForm.type,
      parentId: createForm.parentId,
      level: parent.level + 1,
      path: `${parent.path} > ${createForm.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: []
    };

    setEntities([...entities, newEntity]);
    setCreateForm({
      name: '',
      type: 'company',
      parentId: 'entity-x'
    });
    setShowCreateModal(false);
    setIsCreating(false);

    // Auto-expand the parent node
    setExpandedNodes(prev => new Set([...prev, createForm.parentId]));
  };

  const deleteEntity = async (entityId: string) => {
    if (confirm('Are you sure you want to delete this entity? This action cannot be undone.')) {
      // Check if entity has children
      const hasChildren = entities.some(e => e.parentId === entityId);
      if (hasChildren) {
        alert('Cannot delete entity with sub-entities. Please delete all sub-entities first.');
        return;
      }

      // Check if entity has users
      const entity = entities.find(e => e.id === entityId);
      if (entity && getUserCount(entity.name) > 0) {
        alert('Cannot delete entity with assigned users. Please reassign users first.');
        return;
      }

      setEntities(entities.filter(e => e.id !== entityId));
    }
  };

  const renderEntity = (entity: ElasticEntity, depth: number = 0) => {
    const isExpanded = expandedNodes.has(entity.id);
    const hasChildren = entity.children && entity.children.length > 0;
    const userCount = getUserCount(entity.name);

    return (
      <div key={entity.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 ${
            depth === 0 ? 'bg-primary-50' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(entity.id)}
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
              {userCount > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {userCount} users
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Created: {new Date(entity.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          {entity.type !== 'entity' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => deleteEntity(entity.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete entity"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
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
              Manage your elastic entity hierarchy with unlimited nesting levels. Create companies and departments as needed.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Entity
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{entities.length}</div>
            <div className="text-sm text-gray-600">Total Entities</div>
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{e164Users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>

        {/* Entity Tree */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hierarchical Structure</h3>
          </div>
          <div className="p-6">
            {hierarchicalEntities.map(entity => renderEntity(entity))}
          </div>
        </div>

        {/* Create Entity Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Entity</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Company/Department Name"
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
                      <option value="company">Company</option>
                      <option value="department">Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Entity *
                    </label>
                    <select
                      value={createForm.parentId}
                      onChange={(e) => setCreateForm({ ...createForm, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="entity-x">Entity X (Root)</option>
                      {entities.filter(e => e.type === 'company').map(entity => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name} (Company)
                        </option>
                      ))}
                    </select>
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
                    onClick={handleCreateEntity}
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Entity'}
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
