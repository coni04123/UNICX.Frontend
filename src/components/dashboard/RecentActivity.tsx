'use client';

import React from 'react';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { AuditLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  type: 'user_action' | 'campaign_update' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  auditLogs: AuditLog[];
  maxDisplay?: number;
}

export default function RecentActivity({ auditLogs, maxDisplay = 10 }: RecentActivityProps) {
  // Convert audit logs to activity items
  const activities: ActivityItem[] = [
    // Recent system activities (simulated)
    {
      id: 'act-1',
      type: 'campaign_update' as const,
      title: 'Q4 Product Launch Campaign Started',
      description: 'Campaign targeting 500 enterprise customers is now running',
      timestamp: new Date('2024-09-26T08:00:00Z'),
      user: 'Sarah Johnson',
      status: 'success' as const,
    },
    {
      id: 'act-2',
      type: 'alert' as const,
      title: 'WhatsApp Account Blocked',
      description: 'Marketing Campaigns account (+1-555-0125) has been blocked',
      timestamp: new Date('2024-09-26T06:30:00Z'),
      status: 'error' as const,
    },
    {
      id: 'act-3',
      type: 'user_action' as const,
      title: 'Spy Number Configuration Updated',
      description: 'Main Surveillance spy number alert threshold changed to 6 hours',
      timestamp: new Date('2024-09-25T14:30:00Z'),
      user: 'Sarah Johnson',
      status: 'info' as const,
    },
    {
      id: 'act-4',
      type: 'system' as const,
      title: 'Health Check Completed',
      description: 'All active WhatsApp accounts passed health verification',
      timestamp: new Date('2024-09-25T12:00:00Z'),
      status: 'success' as const,
    },
    {
      id: 'act-5',
      type: 'campaign_update' as const,
      title: 'Payment Reminder Campaign Completed',
      description: '3 messages sent with 100% delivery rate',
      timestamp: new Date('2024-09-25T11:30:00Z'),
      user: 'Mike Davis',
      status: 'success' as const,
    },
    // Add audit log activities
    ...auditLogs.slice(0, 5).map((log) => ({
      id: log.id,
      type: 'user_action' as const,
      title: `${log.action} ${log.resource.replace('_', ' ')}`,
      description: `${log.resource} modified by user`,
      timestamp: log.timestamp,
      user: log.userId,
      status: log.result === 'success' ? 'success' as const : 'error' as const,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxDisplay);

  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'user_action':
        return <UserIcon className="h-5 w-5" />;
      case 'campaign_update':
        return <MegaphoneIcon className="h-5 w-5" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'system':
        return status === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getActivityVariant = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      case 'info':
      default:
        return 'outline' as const;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest system and user activities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Recent Activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity will appear here when actions are performed.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3 px-6 py-3 hover:bg-muted/50 transition-colors duration-150">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-background bg-muted text-muted-foreground">
                          {getActivityIcon(activity.type, activity.status)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {activity.title}
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          {activity.status && (
                            <Badge variant={getActivityVariant(activity.status)} className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-2">
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>by {activity.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
