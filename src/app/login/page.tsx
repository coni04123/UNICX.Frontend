'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Demo credentials for different user roles
const demoCredentials = [
  {
    email: 'admin@2n5.com',
    password: 'admin123',
    role: 'SystemAdmin',
    tenant: '2N5 Global',
    description: 'Full system access across all tenants'
  },
  {
    email: 'manager@acme.com',
    password: 'manager123',
    role: 'TenantAdmin',
    tenant: 'ACME Corp',
    description: 'Manage sub-tenants and E164 users'
  },
  {
    email: 'user@techstart.com',
    password: 'user123',
    role: 'User',
    tenant: 'TechStart Inc',
    description: 'E164 user with basic access'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check demo credentials
    const validCredential = demoCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (validCredential) {
      console.log('Valid credential found:', validCredential);
      
      // Use AuthContext login function
      const userData = {
        email: validCredential.email,
        role: validCredential.role,
        tenant: validCredential.tenant
      };
      
      console.log('Logging in with:', userData);
      setSuccess('Login successful! Redirecting to dashboard...');
      
      login(userData);
      
      console.log('Redirecting to dashboard...');
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      console.log('Invalid credentials:', { email, password });
      setError('Invalid email or password. Please use one of the demo credentials below.');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (credential: typeof demoCredentials[0]) => {
    setEmail(credential.email);
    setPassword(credential.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-background to-pistachio-50 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">2N5</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your WhatsApp Business Management Platform
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-error-600 bg-error-50 border border-error-200 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-success-600 bg-success-50 border border-success-200 rounded-md">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <div className="text-center">
                  <a href="#" className="text-sm text-primary hover:text-primary/80">
                    Forgot your password?
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="border border-sage-200 bg-sage-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-sage-600" />
                <span>Demo Credentials</span>
              </CardTitle>
              <CardDescription>
                Click on any credential below to auto-fill the login form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoCredentials.map((credential, index) => (
                <div
                  key={index}
                  onClick={() => handleDemoLogin(credential)}
                  className="p-3 bg-white rounded-lg border border-sage-200 hover:border-sage-300 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">
                          {credential.email}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {credential.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {credential.tenant} • {credential.description}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Password: {credential.password}
                      </div>
                    </div>
                    <div className="text-sage-400 group-hover:text-sage-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Image/Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-sage-100 to-bottle-100 items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-8">
          {/* Hero Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto bg-gradient-to-br from-primary to-sage-500 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center">
                <div className="space-y-4">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-primary mx-auto" />
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-warning-500 rounded-full animate-pulse delay-100" />
                    <div className="w-3 h-3 bg-info-500 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-sage-400 rounded-full animate-bounce" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pistachio-400 rounded-full animate-bounce delay-300" />
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-bottle-400 rounded-full animate-bounce delay-150" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Manage WhatsApp Business at Scale
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Streamline your WhatsApp Business communications with our comprehensive 
              management platform. Monitor spy numbers, manage messages, and handle 
              multiple accounts with ease.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">Multi-account Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sage-400/20 rounded-lg flex items-center justify-center">
                  <EyeIcon className="h-4 w-4 text-sage-600" />
                </div>
                <span className="text-foreground">Spy Number Monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-bottle-400/20 rounded-lg flex items-center justify-center">
                  <GlobeAltIcon className="h-4 w-4 text-bottle-600" />
                </div>
                <span className="text-foreground">Global Multi-tenant Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
