import { createContext, useEffect, useMemo, useState } from 'react';

type Currency = 'USD' | 'TWD' | 'JPY';
type Category = 'food' | 'fun' | 'travel';

type GlobalContextType = {
  currency: chrome.custom.Currency;
  category: chrome.custom.Category;
  available: boolean;
};

const GlobalContext = createContext<GlobalContextType>({
  currency: 'USD',
  category: 'food',
  available: false,
});

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [available, setAvailable] = useState<boolean>(false);
  const [currency, setCurrency] = useState<chrome.custom.Currency>('USD');
  const [category, setCategory] = useState<chrome.custom.Category>('food');

  const memoValue = useMemo(
    () => ({ currency, category, available }),
    [currency, category, available]
  );

  useEffect(() => {
    if (!chrome?.storage?.sync) return;
    const syncData = async () => {
      await chrome.storage.sync.get(['available', 'currency', 'category']).then((result) => {
        if (result.available) setAvailable(result.available === 'true' || false);
        if (result.currency) setCurrency(result.currency as Currency);
        if (result.category) setCategory(result.category as Category);
      });
    };

    void syncData();
  }, []);

  return <GlobalContext value={memoValue}>{children}</GlobalContext>;
};

export { GlobalContext };
