'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  UsersIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { whatsappMessages, e164Users, elasticEntities, type FilterOptions, type ElasticEntity } from '@/data/chatMockData';

export default function CommunicationPage() {
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  
  // WhatsApp monitoring filters
  const [whatsappFilters, setWhatsappFilters] = useState<FilterOptions>({
    entityUserNumber: '',
    entityPath: '',
    e164Number: '',
    timeRange: { type: 'last_days', value: 0 },
    messageType: 'all',
    direction: 'both',
    registrationStatus: 'all'
  });
  const [showWhatsAppFilters, setShowWhatsAppFilters] = useState(false);

  // Additional state for enhanced filtering
  const [allE164Numbers, setAllE164Numbers] = useState<Set<string>>(new Set());

  // Extract all unique E164 numbers from messages (registered and unregistered)
  React.useEffect(() => {
    const numbersSet = new Set<string>();
    whatsappMessages.forEach(message => {
      numbersSet.add(message.senderE164);
      numbersSet.add(message.receiverE164);
    });
    setAllE164Numbers(numbersSet);
  }, []);

  // Elastic structure navigation state
  const [selectedEntityPath, setSelectedEntityPath] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['entity-x']));
  const [showStructurePanel, setShowStructurePanel] = useState(true);

  // Helper functions for elastic structure
  const buildEntityTree = (entities: ElasticEntity[]): ElasticEntity[] => {
    const entityMap = new Map<string, ElasticEntity>();
    const rootEntities: ElasticEntity[] = [];

    // Create map of all entities
    entities.forEach(entity => {
      entityMap.set(entity.id, { ...entity, children: [] });
    });

    // Build tree structure
    entities.forEach(entity => {
      const entityNode = entityMap.get(entity.id)!;
      if (entity.parentId) {
        const parent = entityMap.get(entity.parentId);
        if (parent) {
          parent.children!.push(entityNode);
        }
      } else {
        rootEntities.push(entityNode);
      }
    });

    return rootEntities;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'entity': return '🏢';
      case 'company': return '🏬';
      case 'department': return '📋';
      default: return '📁';
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectEntityPath = (path: string) => {
    setSelectedEntityPath(path);
    setWhatsappFilters(prev => ({ ...prev, entityPath: path }));
  };

  const entityTree = buildEntityTree(elasticEntities);

  // Get users in selected entity path
  const usersInSelectedPath = selectedEntityPath 
    ? e164Users.filter(user => user.entityPath === selectedEntityPath || user.entityPath.startsWith(selectedEntityPath + ' >'))
    : e164Users;

  // Filter WhatsApp messages with advanced filters including selected entity path
  const filteredWhatsAppMessages = whatsappMessages.filter((message) => {
    // Entity User Number filter
    const matchesEntityUser = !whatsappFilters.entityUserNumber || 
      message.senderE164 === whatsappFilters.entityUserNumber || 
      message.receiverE164 === whatsappFilters.entityUserNumber;

    // Entity Path filter (enhanced with selected path)
    const pathToMatch = selectedEntityPath || whatsappFilters.entityPath;
    const matchesEntityPath = !pathToMatch || 
      (message.entityPath && (
        message.entityPath === pathToMatch || 
        message.entityPath.startsWith(pathToMatch + ' >')
      ));

    // Enhanced E164 Number filter (supports registered and unregistered numbers)
    const matchesE164 = !whatsappFilters.e164Number || 
      message.senderE164.includes(whatsappFilters.e164Number) || 
      message.receiverE164.includes(whatsappFilters.e164Number);

    // Enhanced Time range filter with support for date ranges
    let matchesTimeRange = true;
    if (whatsappFilters.timeRange) {
      const msgDate = new Date(message.timestamp);
      const now = new Date();

      if (whatsappFilters.timeRange.type === 'last_hours' && whatsappFilters.timeRange.value) {
        const startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 60 * 60 * 1000));
        matchesTimeRange = msgDate >= startDate;
      } else if (whatsappFilters.timeRange.type === 'last_days' && whatsappFilters.timeRange.value) {
        const startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 24 * 60 * 60 * 1000));
        matchesTimeRange = msgDate >= startDate;
      } else if (whatsappFilters.timeRange.type === 'date_range') {
        let startMatches = true;
        let endMatches = true;
        
        if (whatsappFilters.timeRange.startDate) {
          const startDate = new Date(whatsappFilters.timeRange.startDate);
          startMatches = msgDate >= startDate;
        }
        
        if (whatsappFilters.timeRange.endDate) {
          const endDate = new Date(whatsappFilters.timeRange.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          endMatches = msgDate <= endDate;
        }
        
        matchesTimeRange = startMatches && endMatches;
      }
    }

    // Message type filter
    const matchesType = !whatsappFilters.messageType || 
      whatsappFilters.messageType === 'all' || 
      message.type === whatsappFilters.messageType;

    // Direction filter
    const matchesDirection = !whatsappFilters.direction || 
      whatsappFilters.direction === 'both' || 
      message.direction === whatsappFilters.direction;

    // Registration status filter
    let matchesRegistration = true;
    if (whatsappFilters.registrationStatus && whatsappFilters.registrationStatus !== 'all') {
      const senderUser = e164Users.find(u => u.e164Number === message.senderE164);
      const receiverUser = e164Users.find(u => u.e164Number === message.receiverE164);
      
      if (whatsappFilters.registrationStatus === 'registered') {
        matchesRegistration = senderUser !== undefined || receiverUser !== undefined;
      } else {
        // Filter by specific registration status
        matchesRegistration = Boolean((senderUser && senderUser.registrationStatus === whatsappFilters.registrationStatus) ||
                                     (receiverUser && receiverUser.registrationStatus === whatsappFilters.registrationStatus));
      }
    }

    return matchesEntityUser && matchesEntityPath && 
           matchesE164 && matchesTimeRange && matchesType && matchesDirection && matchesRegistration;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Render elastic structure tree
  const renderEntityNode = (entity: ElasticEntity, level: number = 0) => {
    const isExpanded = expandedNodes.has(entity.id);
    const hasChildren = entity.children && entity.children.length > 0;
    const isSelected = selectedEntityPath === entity.path;
    const messageCount = whatsappMessages.filter(msg => 
      msg.entityPath === entity.path || 
      (msg.entityPath && msg.entityPath.startsWith(entity.path + ' >'))
    ).length;
    const userCount = e164Users.filter(user => 
      user.entityPath === entity.path || 
      user.entityPath.startsWith(entity.path + ' >')
    ).length;

    return (
      <div key={entity.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-500' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => selectEntityPath(entity.path)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(entity.id);
              }}
              className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2" />}
          
          <span className="mr-2 text-sm">{getEntityIcon(entity.type)}</span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {entity.name}
              </span>
              <div className="flex items-center space-x-2 ml-2">
                {messageCount > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSelected ? 'bg-primary-200 text-primary-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {messageCount}
                  </span>
                )}
                {userCount > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSelected ? 'bg-primary-200 text-primary-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {userCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {entity.children!.map(child => renderEntityNode(child, level + 1))}
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
            <h1 className="text-2xl font-semibold text-gray-900">WhatsApp Communication Monitoring</h1>
            <p className="mt-2 text-sm text-gray-700">
              Navigate through your elastic entity structure and monitor WhatsApp messages&nbsp;-&nbsp;
              <span className='inline-flex px-2 py-1 bg-cyan-700 text-secondary rounded-md'>{filteredWhatsAppMessages.length} messages</span>
              <br />
              {selectedEntityPath && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary-100 text-primary-800">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  {selectedEntityPath}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStructurePanel(!showStructurePanel)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showStructurePanel
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
              Entity Structure
            </button>
            <button
              onClick={() => setShowWhatsAppFilters(!showWhatsAppFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showWhatsAppFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {tCommon('export')}
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex space-x-6">
          {/* Elastic Structure Panel */}
          {showStructurePanel && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Entity Structure</h3>
                        <p className="text-sm text-gray-600">Navigate and filter by structure</p>
                      </div>
                    </div>
                    {selectedEntityPath && (
                      <button
                        onClick={() => selectEntityPath('')}
                        className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  {/* Show All Messages Option */}
                  <div
                    className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                      !selectedEntityPath 
                        ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-500' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => selectEntityPath('')}
                  >
                    <span className="mr-2 text-sm">🌐</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${!selectedEntityPath ? 'text-primary-900' : 'text-gray-900'}`}>
                          All Messages
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          !selectedEntityPath ? 'bg-primary-200 text-primary-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {whatsappMessages.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entity Tree */}
                  <div className="space-y-1">
                    {entityTree.map(entity => renderEntityNode(entity))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {showWhatsAppFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp Advanced Filters</h3>
                  <button
                    onClick={() => {
                      setWhatsappFilters({
                        entityUserNumber: '',
                        entityPath: '',
                        e164Number: '',
                        timeRange: { type: 'last_days', value: 0 },
                        messageType: 'all',
                        direction: 'both',
                        registrationStatus: 'all'
                      });
                      setSelectedEntityPath('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Entity User Number Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity User Number (E164)
                      {selectedEntityPath && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({usersInSelectedPath.length} users)
                        </span>
                      )}
                    </label>
                    <select
                      value={whatsappFilters.entityUserNumber || ''}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, entityUserNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">
                        {selectedEntityPath ? `All Users in Selected Entity` : 'All Entity Users'}
                      </option>
                      {usersInSelectedPath.map(user => (
                        <option key={user.id} value={user.e164Number}>
                          {user.name} ({user.e164Number})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Entity Path Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Structure Part
                    </label>
                    <select
                      value={selectedEntityPath || whatsappFilters.entityPath || ''}
                      onChange={(e) => {
                        setWhatsappFilters(prev => ({ ...prev, entityPath: e.target.value }));
                        setSelectedEntityPath(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Entity Parts</option>
                      {elasticEntities.map(entity => (
                        <option key={entity.id} value={entity.path}>
                          {getEntityIcon(entity.type)} {entity.name}
                        </option>
                      ))}
                    </select>
                    {/* {selectedEntityPath && (
                      <p className="mt-1 text-xs text-gray-500">
                        Currently viewing: {selectedEntityPath}
                      </p>
                    )} */}
                  </div>
                  {/* <div>
                  </div> */}

                  {/* Enhanced E164 Number Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any E164 Number
                    </label>
                    <input
                      value={whatsappFilters.e164Number || ''}
                      placeholder='Enter E164 Number'
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, e164Number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Enhanced Time Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <div className="space-y-2">
                      <select
                        value={whatsappFilters.timeRange?.type || 'last_days'}
                        onChange={(e) => setWhatsappFilters(prev => ({ 
                          ...prev, 
                          timeRange: { 
                            type: e.target.value as any,
                            value: e.target.value === 'date_range' ? undefined : prev.timeRange?.value,
                            startDate: e.target.value === 'date_range' ? prev.timeRange?.startDate : undefined,
                            endDate: e.target.value === 'date_range' ? prev.timeRange?.endDate : undefined
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="last_hours">Last Hours</option>
                        <option value="last_days">Last Days</option>
                        <option value="date_range">Custom Date Range</option>
                      </select>
                      
                      {whatsappFilters.timeRange?.type === 'date_range' ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">From Date</label>
                            <input
                              type="date"
                              value={whatsappFilters.timeRange?.startDate || ''}
                              onChange={(e) => setWhatsappFilters(prev => ({ 
                                ...prev, 
                                timeRange: { ...prev.timeRange!, startDate: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">To Date</label>
                            <input
                              type="date"
                              value={whatsappFilters.timeRange?.endDate || ''}
                              onChange={(e) => setWhatsappFilters(prev => ({ 
                                ...prev, 
                                timeRange: { ...prev.timeRange!, endDate: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={whatsappFilters.timeRange?.value || ''}
                          onChange={(e) => setWhatsappFilters(prev => ({ 
                            ...prev, 
                            timeRange: { ...prev.timeRange!, value: parseInt(e.target.value) || 0 }
                          }))}
                          placeholder={whatsappFilters.timeRange?.type === 'last_hours' ? 'Enter hours' : 'Enter days'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Message Direction Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Direction
                    </label>
                    <select
                      value={whatsappFilters.direction || 'both'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, direction: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="both">Both Directions</option>
                      <option value="inbound">Inbound Only</option>
                      <option value="outbound">Outbound Only</option>
                    </select>
                  </div>

                  {/* Message Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <select
                      value={whatsappFilters.messageType || 'all'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, messageType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Types</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="file">File</option>
                    </select>
                  </div>

                  {/* Registration Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Status
                    </label>
                    <select
                      value={whatsappFilters.registrationStatus || 'all'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, registrationStatus: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Users</option>
                      <option value="registered">Any Registered User</option>
                      <option value="pending">Pending Registration</option>
                      <option value="invited">Invited Users</option>
                      <option value="cancelled">Cancelled Registration</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500">
                      Filter by registration status of message participants
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Messages Display */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">📱</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">WhatsApp Messages</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{filteredWhatsAppMessages.length}</span> messages
                      {filteredWhatsAppMessages.length !== whatsappMessages.length && (
                        <span className="text-gray-500"> of {whatsappMessages.length}</span>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredWhatsAppMessages.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No WhatsApp messages found matching your criteria.
                  </div>
                ) : (
                  filteredWhatsAppMessages.map((message) => {
                    const senderInfo = e164Users.find(u => u.e164Number === message.senderE164);
                    const receiverInfo = e164Users.find(u => u.e164Number === message.receiverE164);
                    
                    return (
                      <div key={message.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150">
                        <div className="flex items-start space-x-4">
                          {/* Direction Indicator */}
                          <div className="flex-shrink-0 pt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.direction === 'outbound' 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'bg-green-50 border border-green-200'
                            }`}>
                              <span className={`text-sm ${
                                message.direction === 'outbound' ? 'text-blue-600' : 'text-green-600'
                              }`}>
                                {message.direction === 'outbound' ? '↗️' : '↙️'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Message Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {senderInfo ? senderInfo.name : message.senderE164}
                                  </span>
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {message.senderE164}
                                  </span>
                                </div>
                                <span className="text-gray-400 text-sm">→</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {receiverInfo ? receiverInfo.name : message.receiverE164}
                                  </span>
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {message.receiverE164}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  message.isMonitored
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                                }`}>
                                  {message.isMonitored ? '🟢 Monitored' : '🔶 External'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Message Content */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-2">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-800 flex-1">{message.content}</p>
                                <div className="flex items-center space-x-2 ml-3">
                                  {message.type !== 'text' && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      {message.type}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(message.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Entity Path */}
                            {message.entityPath && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">📍</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary-50 text-primary-700 border border-primary-200">
                                  {message.entityPath}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
