'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  const testLogin = () => {
    login({
      email: 'admin@2n5.com',
      role: 'Admin',
      tenant: '2N5 Global'
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong>
            <pre className="bg-muted p-2 rounded text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <strong>LocalStorage User:</strong>
            <pre className="bg-muted p-2 rounded text-xs">
              {typeof window !== 'undefined' ? localStorage.getItem('user') : 'N/A'}
            </pre>
          </div>
          <div className="flex space-x-2">
            <Button onClick={testLogin} variant="outline">
              Test Login
            </Button>
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
