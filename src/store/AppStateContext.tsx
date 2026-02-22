import { createContext, useContext } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

export type AppStateValue = ReturnType<typeof useAppLogic>;

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const value = useAppLogic();
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider.');
  }
  return context;
}
