import { GlobalContext } from '@/contexts/global-context';
import { use } from 'react';

export const useGlobalContext = () => {
  const context = use(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  return context;
};
