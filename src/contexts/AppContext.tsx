import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';
import type { AppView } from '../types';

const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const appState = useAppState();
  
  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export type { AppView };
