'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export default function AuthInitializer() {
  useEffect(() => {
    // Initialize auth system on app start
    useAuthStore.getState().initialize();
  }, []);

  // This component doesn't render anything
  return null;
}
