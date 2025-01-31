import React, { createContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import zh from './locales/zh.json';

export const LanguageContext = createContext();

const languageFiles = { en, zh };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(languageFiles[language]);

  useEffect(() => {
    setTranslations(languageFiles[language]);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang); 
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};