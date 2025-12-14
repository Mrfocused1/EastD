"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PromoPopup from '@/components/PromoPopup';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import SeasonalPopup from '@/components/SeasonalPopup';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          {children}
          <PromoPopup />
          <ExitIntentPopup />
          <SeasonalPopup />
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}
