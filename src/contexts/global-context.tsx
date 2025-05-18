import i18n from '@/i18n';
import { createContext, useEffect, useMemo, useState } from 'react';

type GlobalContextType = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  enabled: false,
  setEnabled: () => {},
});

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [enabled, setEnabled] = useState<boolean>(true);

  const memoValue = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);

  useEffect(() => {
    void chrome.storage.local.get('language').then((result) => {
      void i18n.changeLanguage(result?.language ?? 'zh_TW');
    });
  }, []);

  return <GlobalContext value={memoValue}>{children}</GlobalContext>;
};

export { GlobalContext };
