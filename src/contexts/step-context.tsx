import { createContext, useMemo, useState } from 'react';

export type StepContextType = {
  step: number;
  setStep: (step: number) => void;
};

const StepContext = createContext<StepContextType>({
  step: 1,
  setStep: () => {},
});

export const StepContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState<number>(1);

  const memoValue = useMemo(() => ({ step, setStep }), [step, setStep]);

  return <StepContext value={memoValue}>{children}</StepContext>;
};

export { StepContext };
