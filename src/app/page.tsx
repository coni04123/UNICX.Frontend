'use client';

import React from 'react';
import { useTranslations } from '@/lib/translations';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import WelcomeBanner from '@/components/onboarding/WelcomeBanner';
import { useOnboarding } from '@/contexts/OnboardingContext';
import MetricCard from '@/components/dashboard/MetricCard';
import AlertCard from '@/components/dashboard/AlertCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  mockDashboardMetrics,
  mockAlerts,
  mockAuditLogs,
  currentTenant,
} from '@/data/mockData';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding, resetOnboarding } = useOnboarding();
  const { roleInfo, canViewAdvancedMetrics } = usePermissions();
  const metrics = mockDashboardMetrics;

  return (
    <DashboardLayout>
      {/* Onboarding Flow */}
      {/* {shouldShowOnboarding && (
        <OnboardingFlow
          onClose={skipOnboarding}
          onComplete={completeOnboarding}
        />
      )} */}
      
      <div className="space-y-6">
        {/* Welcome Banner for users who haven't completed onboarding */}
        {/* <WelcomeBanner /> */}
        
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with {currentTenant.name} today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={roleInfo.badgeColor} className="text-xs">
              {roleInfo.label}
            </Badge>
            <Badge variant="secondary" className="bg-sage-100 text-sage-800">
              {currentTenant.subscriptionPlan}
            </Badge>
            <PermissionGate permission="viewAdvancedMetrics">
              <Button variant="outline" size="sm">
                View Reports
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Entities"
            value={metrics.entities.total}
            change={{
              value: 8.3,
              period: 'from last month',
              type: 'increase',
            }}
            icon={BuildingOfficeIcon}
            iconColor="bg-primary-500"
          />
          <MetricCard
            title="WhatsApp Messages"
            value={metrics.messages.sent24h.toLocaleString()}
            change={{
              value: 12.5,
              period: 'from yesterday',
              type: 'increase',
            }}
            icon={EnvelopeIcon}
            iconColor="bg-green-500"
          />
          <MetricCard
            title="Monitored Users"
            value="47"
            change={{
              value: 15.2,
              period: 'from last week',
              type: 'increase',
            }}
            icon={UsersIcon}
            iconColor="bg-blue-500"
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Entity Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Entity Overview</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Companies</span>
                  <span className="text-sm font-medium text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Departments</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">E164 Users</span>
                  <span className="text-sm font-medium text-green-600">47</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-gray-900">Registration Rate</span>
                  <span className="text-sm font-bold text-primary-600">89%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Communication Overview</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages (24h)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.messages.sent24h.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monitored</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round(metrics.messages.sent24h * 0.73).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">External</span>
                  <span className="text-sm font-medium text-orange-600">
                    {Math.round(metrics.messages.sent24h * 0.27).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-gray-900">Active Conversations</span>
                  <span className="text-sm font-bold text-primary-600">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <BuildingOfficeIcon className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Add Entity</span>
              </button>
              <button className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create E164 User</span>
              </button>
              <button className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <EnvelopeIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Monitor Messages</span>
              </button>
              <button 
                onClick={resetOnboarding}
                className="flex items-center p-3 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-600 mr-3">🚀</span>
                <span className="text-sm font-medium text-blue-900">Setup Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts and Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertCard alerts={mockAlerts} />
          <RecentActivity auditLogs={mockAuditLogs} />
        </div>
      </div>
    </DashboardLayout>
  );
}
