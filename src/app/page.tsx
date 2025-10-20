'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
import { api } from '@/lib/api';
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  currentTenant,
} from '@/data/mockData';

export default function Dashboard() {
  const t = useTranslation('dashboard');
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding, resetOnboarding } = useOnboarding();
  const { roleInfo, canViewAdvancedMetrics } = usePermissions();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Load dashboard metrics and recent activity in parallel
      const [dashboardData, activityResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentActivity(10)
      ]);
      
      // Extract data from the response wrapper for recent activity
      const activityData = activityResponse;
      
      setMetrics(dashboardData);
      setRecentActivity(activityData);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : metrics && metrics.entities && metrics.messages && metrics.users ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Entities"
                value={metrics.entities.total}
                change={metrics.entities.change}
                icon={BuildingOfficeIcon}
                iconColor="bg-primary-500"
              />
              <MetricCard
                title="WhatsApp Messages"
                value={metrics.messages.sent24h.toLocaleString()}
                change={metrics.messages.change}
                icon={EnvelopeIcon}
                iconColor="bg-green-500"
              />
              <MetricCard
                title="Monitored Users"
                value={metrics.users.monitored.toString()}
                change={metrics.users.change}
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
                      <span className="text-sm font-medium text-gray-900">{metrics.entities.companies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Departments</span>
                      <span className="text-sm font-medium text-gray-900">{metrics.entities.departments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">E164 Users</span>
                      <span className="text-sm font-medium text-green-600">{metrics.entities.e164Users}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium text-gray-900">Registration Rate</span>
                      <span className="text-sm font-bold text-primary-600">{metrics.entities.registrationRate}%</span>
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
                        {metrics.messages.monitored.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">External</span>
                      <span className="text-sm font-medium text-orange-600">
                        {metrics.messages.external.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium text-gray-900">Active Conversations</span>
                      <span className="text-sm font-bold text-primary-600">{metrics.messages.activeConversations}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : metrics ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            Dashboard data is incomplete. Please refresh the page.
          </div>
        ) : null}

        {/* Alerts and Activity */}
        <RecentActivity auditLogs={recentActivity} />
      </div>
    </DashboardLayout>
  );
}
