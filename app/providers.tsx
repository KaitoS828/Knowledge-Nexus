'use client';

import { AppProvider } from '@/store/app-store';
import { ThemeManager } from '@/components/ThemeManager';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ThemeManager />
      {children}
    </AppProvider>
  );
}
