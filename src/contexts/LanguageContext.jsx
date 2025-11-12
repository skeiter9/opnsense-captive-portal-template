import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const RTL_LANGUAGES = ['ar', 'he', 'fa'];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('en');
  const [translations, setTranslations] = useState({});
  const [availableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pl', name: 'Polski' },
    { code: 'sk', name: 'Slovenčina' },
  ]);

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || browserLang || 'en';
    
    loadLanguage(initialLang);
  }, []);

  const loadLanguage = async (langCode) => {
    try {
      const response = await fetch(`/locales/${langCode}.json`);
      const data = await response.json();
      setTranslations(data);
      setCurrentLang(langCode);
      localStorage.setItem('selectedLanguage', langCode);
      
      document.documentElement.lang = langCode;
      document.documentElement.dir = RTL_LANGUAGES.includes(langCode) ? 'rtl' : 'ltr';
    } catch (error) {
      console.error(`Failed to load language: ${langCode}`, error);
      if (langCode !== 'en') {
        loadLanguage('en');
      }
    }
  };

  const t = (key, fallback = '') => {
    return translations[key] || fallback || key;
  };

  const isRTL = () => RTL_LANGUAGES.includes(currentLang);

  return (
    <LanguageContext.Provider value={{
      currentLang,
      setLanguage: loadLanguage,
      t,
      isRTL,
      availableLanguages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
