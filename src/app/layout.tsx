import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export const metadata: Metadata = {
  title: '2N5 - WhatsApp Business Management Platform',
  description: 'Comprehensive WhatsApp Business and spy number management system with multi-tenant support',
  keywords: 'WhatsApp, Business, Messaging, Spy Numbers, Multi-tenant',
  authors: [{ name: '2N5 Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#22c55e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
