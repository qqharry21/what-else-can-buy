import { StepContext } from '@/contexts/step-context';
import { use } from 'react';

export const useStepContext = () => {
  const context = use(StepContext);
  if (!context) {
    throw new Error('useStepContext must be used within a StepContextProvider');
  }
  return context;
};
