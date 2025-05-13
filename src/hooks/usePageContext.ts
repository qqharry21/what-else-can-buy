import { use } from 'react';

import { PageContext } from '@/contexts/page-context';

export const usePageContext = () => {
  const context = use(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return context;
};
