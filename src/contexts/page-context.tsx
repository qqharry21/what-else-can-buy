import { createContext, useMemo, useState } from 'react';

export type Page = 'home' | 'settings';

const PageContext = createContext<{
  page: Page;
  setPage: (page: Page) => void;
}>({
  page: 'home',
  setPage: () => {},
});

export const PageContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [page, setPage] = useState<Page>('home');

  const memoValue = useMemo(() => ({ page, setPage }), [page, setPage]);

  return <PageContext value={memoValue}>{children}</PageContext>;
};

export { PageContext };
