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
      <div className='bg-white min-h-screen flex flex-col items-center mx-auto justify-center w-full max-w-xl'>
        <Header />

        <main className='p-4 w-full flex-1'>{pageContent[page]}</main>

        <Footer />
      </div>
    </GlobalContextProvider>
  );
}

export default App;
