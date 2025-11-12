import React from 'react';
import ReactDOM from 'react-dom/client';
import { LanguageProvider } from './contexts/LanguageContext';
import { SessionProvider } from './contexts/SessionContext';
import { LoginPage } from './pages/LoginPage';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <LanguageProvider>
        <SessionProvider>
          <LoginPage />
        </SessionProvider>
      </LanguageProvider>
  </React.StrictMode>
);
