'use client';

import React from 'react';
import { useTranslations } from '@/lib/translations';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { elasticEntities, e164Users, getRegistrationStats } from '@/data/chatMockData';

export default function EntitiesPage() {
  const t = useTranslations('entities');

  const entityOptions = [
    {
      title: 'Entity Structure',
      description: 'Manage your elastic entity hierarchy with unlimited nesting levels',
      href: '/entities/structure',
      icon: BuildingOfficeIcon,
      features: [
        'Create companies and departments',
        'Unlimited nesting levels',
        'Visual tree organization',
        'Path-based navigation'
      ],
      stats: {
        label: 'Total Entities',
        value: elasticEntities.length
      }
    },
    {
      title: 'User Management',
      description: 'Complete E164 user management with registration monitoring and QR invitations',
      href: '/entities/users',
      icon: UsersIcon,
      features: [
        'Create & manage E164 users',
        'Send QR code invitations',
        'Registration status tracking',
        'WhatsApp connection monitoring'
      ],
      stats: {
        label: 'Total Users',
        value: e164Users.length
      }
    }
  ];

  const quickStats = getRegistrationStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entity Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your elastic entity structure and E164 users. Create unlimited levels of organization.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{elasticEntities.length}</div>
            <div className="text-sm text-gray-600">Total Entities</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{quickStats.registered}</div>
            <div className="text-sm text-gray-600">Registered Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{quickStats.invited}</div>
            <div className="text-sm text-gray-600">Invited Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{quickStats.pending}</div>
            <div className="text-sm text-gray-600">Pending Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {e164Users.filter(u => u.whatsappConnected).length}
            </div>
            <div className="text-sm text-gray-600">WhatsApp Connected</div>
          </div>
        </div>

        {/* Entity Management Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {entityOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <div key={option.title} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.title}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {option.stats.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.stats.label}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={option.href}
                    className="inline-flex items-center w-full justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Open {option.title}
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Entity Structure Preview */}
        {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Entity Structure Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="font-medium text-gray-900">Entity X</span>
              <span className="ml-2 text-gray-500">(Root Entity)</span>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-center text-sm">
                <BuildingOfficeIcon className="w-4 h-4 text-blue-400 mr-2" />
                <span className="font-medium text-gray-900">Company C1</span>
                <span className="ml-2 text-gray-500">
                  ({e164Users.filter(u => u.entityPath.includes('Company C1')).length} users)
                </span>
              </div>
              <div className="ml-6 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Sales Department ({e164Users.filter(u => u.entityPath.includes('Sales Department')).length} users)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Marketing Department ({e164Users.filter(u => u.entityPath.includes('Marketing Department')).length} users)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  IT Department ({e164Users.filter(u => u.entityPath.includes('IT Department')).length} users)
                </div>
              </div>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-center text-sm">
                <BuildingOfficeIcon className="w-4 h-4 text-blue-400 mr-2" />
                <span className="font-medium text-gray-900">Company C2</span>
                <span className="ml-2 text-gray-500">
                  ({e164Users.filter(u => u.entityPath.includes('Company C2')).length} users)
                </span>
              </div>
              <div className="ml-6 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Operations Department ({e164Users.filter(u => u.entityPath.includes('Operations Department')).length} users)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Finance Department ({e164Users.filter(u => u.entityPath.includes('Finance Department')).length} users)
                </div>
              </div>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-center text-sm">
                <BuildingOfficeIcon className="w-4 h-4 text-blue-400 mr-2" />
                <span className="font-medium text-gray-900">Company C3</span>
                <span className="ml-2 text-gray-500">
                  ({e164Users.filter(u => u.entityPath.includes('Company C3')).length} users)
                </span>
              </div>
              <div className="ml-6 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Human Resources ({e164Users.filter(u => u.entityPath.includes('Human Resources')).length} users)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-3 h-3 text-gray-400 mr-2" />
                  Legal Department ({e164Users.filter(u => u.entityPath.includes('Legal Department')).length} users)
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">How to Get Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Create Entity Structure</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Set up your companies and departments using the elastic structure system.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Create E164 Users</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Add users with their E164 phone numbers and assign them to departments.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Send QR Invitations</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Send email invitations with QR codes for users to connect their WhatsApp accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}