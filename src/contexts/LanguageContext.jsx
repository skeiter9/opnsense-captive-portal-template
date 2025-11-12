import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const RTL_LANGUAGES = ['ar', 'he', 'fa'];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('en');
  const [translations, setTranslations] = useState({});
  const [availableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ]);

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || browserLang || 'en';
    
    loadLanguage(initialLang);
  }, []);

  const loadLanguage = async (langCode) => {
    try {
      // Only load if we have the translation file
      const validLangs = ['en', 'es'];
      const targetLang = validLangs.includes(langCode) ? langCode : 'en';
      
      const response = await fetch(`/locales/${targetLang}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setTranslations(data);
      setCurrentLang(targetLang);
      localStorage.setItem('selectedLanguage', targetLang);
      
      document.documentElement.lang = targetLang;
      document.documentElement.dir = RTL_LANGUAGES.includes(targetLang) ? 'rtl' : 'ltr';
      
      console.log(`Language switched to: ${targetLang}`);
    } catch (error) {
      console.error(`Failed to load language: ${langCode}`, error);
      if (langCode !== 'en') {
        loadLanguage('en');
      }
    }
  };

  const t = (key, fallback = '') => {
    // Support nested keys like 'isp_info.isp_name'
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = translations;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
      return value || fallback || key;
    }
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
