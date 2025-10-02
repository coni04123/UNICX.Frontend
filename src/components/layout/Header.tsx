'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import { Fragment } from 'react';
import { Menu, Transition, Popover } from '@headlessui/react';
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { currentUser, currentTenant, mockTenants, mockAlerts } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslations('common');
  const { user, logout } = useAuth();
  const { roleInfo } = usePermissions();
  const [selectedTenant, setSelectedTenant] = useState(currentTenant);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadAlerts = mockAlerts.filter(alert => alert.status === 'open');
  const criticalAlerts = unreadAlerts.filter(alert => alert.severity === 'critical');

  const handleTenantSwitch = (tenant: typeof currentTenant) => {
    setSelectedTenant(tenant);
    // In a real app, this would trigger tenant context change
    console.log('Switching to tenant:', tenant.name);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Tenant Selector */}
            <Menu as="div" className="relative ml-4">
              <Menu.Button className="flex items-center text-sm rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                <span className="font-medium text-gray-900">{selectedTenant.name}</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {mockTenants.map((tenant) => (
                    <Menu.Item key={tenant.id}>
                      {({ active }) => (
                        <button
                          onClick={() => handleTenantSwitch(tenant)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            selectedTenant.id === tenant.id ? 'bg-primary-50 text-primary-600' : 'text-gray-900'
                          } block px-4 py-2 text-sm w-full text-left`}
                        >
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-xs text-gray-500">{tenant.domain}</p>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-block h-2 w-2 rounded-full mr-2 ${
                                  tenant.status === 'active'
                                    ? 'bg-green-400'
                                    : tenant.status === 'trial'
                                    ? 'bg-yellow-400'
                                    : 'bg-red-400'
                                }`}
                              />
                              <span className="text-xs text-gray-500 capitalize">
                                {tenant.status} • {tenant.subscriptionPlan}
                              </span>
                            </div>
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Search */}
            <div className="flex-1 max-w-lg ml-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts, messages, entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Popover className="relative">
              <Popover.Button className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full">
                <BellIcon className="h-6 w-6" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                )}
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      {criticalAlerts.length > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {criticalAlerts.length} Critical
                        </span>
                      )}
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {unreadAlerts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        unreadAlerts.slice(0, 5).map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-md border-l-4 ${
                              alert.severity === 'critical'
                                ? 'border-red-400 bg-red-50'
                                : alert.severity === 'high'
                                ? 'border-orange-400 bg-orange-50'
                                : alert.severity === 'medium'
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-blue-400 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <ExclamationTriangleIcon
                                className={`h-5 w-5 mt-0.5 ${
                                  alert.severity === 'critical'
                                    ? 'text-red-400'
                                    : alert.severity === 'high'
                                    ? 'text-orange-400'
                                    : alert.severity === 'medium'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}
                              />
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {alert.title}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  {alert.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {unreadAlerts.length > 5 && (
                      <div className="mt-4 text-center">
                        <a
                          href="/messages"
                          className="text-sm text-primary-600 hover:text-primary-500"
                        >
                          View all notifications
                        </a>
                      </div>
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                {currentUser.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentUser.avatar}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <div className="ml-3 text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={roleInfo.badgeColor} className="text-xs">
                      {user?.role || 'User'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user?.tenant || '2N5'}
                    </Badge>
                  </div>
                </div>
                <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-400" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/settings"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        {t('settings')}
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}
