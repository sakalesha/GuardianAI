import type { Preview, ReactRenderer } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationCenterProvider } from '@/contexts/NotificationCenterContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationCenterProvider>
          {children}
          <Toaster position="top-right" />
        </NotificationCenterProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#09090b' },
        { name: 'citizen', value: '#f0fdfa' },
        { name: 'worker', value: '#fffbeb' },
        { name: 'authority', value: '#eff6ff' },
      ],
    },
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
  decorators: [
    (Story: ReactRenderer) => (
      <AllProviders>
        <div data-role="CITIZEN" className="min-h-screen bg-background">
          <Story />
        </div>
      </AllProviders>
    ),
  ],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    role: {
      description: 'User role for role-based theming',
      defaultValue: 'CITIZEN',
      toolbar: {
        title: 'Role',
        icon: 'user',
        items: ['CITIZEN', 'WORKER', 'AUTHORITY'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;