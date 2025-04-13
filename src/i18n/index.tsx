"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import zh from './locales/zh';
import en from './locales/en';

type Language = 'zh' | 'en';

interface I18nContextType {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const locales = {
  zh,
  en,
};

const I18nContext = createContext<I18nContextType>({
  t: () => '',
  language: 'zh',
  setLanguage: () => {},
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = locales[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage: handleSetLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}; 