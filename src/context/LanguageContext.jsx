import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { getCurrentAccount, updateAccount } from '../services/authService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const acc = getCurrentAccount();
    if (acc && acc.language && translations[acc.language]) {
      return acc.language;
    }
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      localStorage.setItem('language', newLang);
      const acc = getCurrentAccount();
      if (acc && acc.language !== newLang) {
        updateAccount({ language: newLang });
      }
    }
  };

  // Dot notation lookup helper: t('auth.signupTitle', { name: 'Patel' })
  const t = (keyPath, params = {}) => {
    if (!keyPath || typeof keyPath !== 'string') return keyPath || '';
    const keys = keyPath.split('.');
    let dict = translations[language] || translations.en;
    
    for (const k of keys) {
      if (dict && dict[k] !== undefined) {
        dict = dict[k];
      } else {
        // Fallback to English dictionary if key missing in target language
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return keyPath;
          }
        }
        dict = fallback;
        break;
      }
    }

    if (typeof dict === 'string') {
      let text = dict;
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
      });
      return text;
    }

    return dict;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
