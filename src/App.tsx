import type { Page } from './contexts/page-context';

import { Footer } from './components/footer';
import { Header } from './components/header';
import { HomePage } from './components/pages/home-page';
import { SettingsPage } from './components/pages/settings-page';

import { GlobalContextProvider } from './contexts/global-context';

import { usePageContext } from './hooks/usePageContext';

const pageContent: Record<Page, React.ReactNode> = {
  home: <HomePage />,
  settings: <SettingsPage />,
};

function App() {
  const { page } = usePageContext();

  return (
    <GlobalContextProvider>
      <div className='w-[500px] h-[800px] bg-white flex flex-col'>
        <Header />

        <main className='flex-1 p-4'>{pageContent[page]}</main>

        <Footer />
      </div>
    </GlobalContextProvider>
  );
}

export default App;
