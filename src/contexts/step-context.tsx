import { createContext, useMemo, useState } from 'react';

type StepContextType = {
  step: number;
  setStep: (step: number) => void;
};

const StepContext = createContext<StepContextType>({
  step: 1,
  setStep: () => {},
});

const StepContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);

  const memoValue = useMemo(() => ({ step, setStep }), [step]);

  return <StepContext value={memoValue}>{children}</StepContext>;
};

export { StepContext, StepContextProvider };
