'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  role: string;
  tenant: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Migrate old role names to new ones
        if (userData.role === 'Admin') {
          userData.role = 'SystemAdmin';
        } else if (userData.role === 'Manager') {
          userData.role = 'TenantAdmin';
        }
        // 'User' role stays the same
        
        setUser(userData);
        
        // Update localStorage with migrated data
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
    // Redirect to dashboard if authenticated and on login page
    else if (!isLoading && user && pathname === '/login') {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    console.log('AuthContext: login called with:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('AuthContext: user set and localStorage updated');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
