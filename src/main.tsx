import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';

import App from './App';
import { PageContextProvider } from './contexts/page-context';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageContextProvider>
      <App />
    </PageContextProvider>
  </StrictMode>
);
