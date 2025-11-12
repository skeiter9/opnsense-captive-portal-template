import React from 'react';
import ReactDOM from 'react-dom/client';
import { LanguageProvider } from './contexts/LanguageContext';
import { SessionProvider } from './contexts/SessionContext';
import { SuccessPage } from './pages/SuccessPage';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <LanguageProvider>
        <SessionProvider>
          <SuccessPage />
        </SessionProvider>
      </LanguageProvider>
  </React.StrictMode>
);
