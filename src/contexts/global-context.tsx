import { createContext, useMemo, useState } from 'react';

type GlobalContextType = {
  available: boolean;
  setAvailable: (available: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  available: false,
  setAvailable: () => {},
});

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [available, setAvailable] = useState<boolean>(false);

  const memoValue = useMemo(() => ({ available, setAvailable }), [available, setAvailable]);

  return <GlobalContext value={memoValue}>{children}</GlobalContext>;
};

export { GlobalContext };
