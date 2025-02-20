import React, { createContext, useContext, useState } from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import Animated, { withTiming, useSharedValue, withSpring } from 'react-native-reanimated';

// Define available languages
export const LANGUAGES = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    direction: 'ltr'
  },
  ar: {
    name: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl'
  }
};

// Create translations object
const translations = {
  en: {
    welcome: 'Welcome',
    recentCases: 'Recent Cases',
    report: 'Report',
    search: 'Search',
    resources: 'Resources'
  },
  es: {
    welcome: 'Bienvenido',
    recentCases: 'Casos Recientes',
    report: 'Reportar',
    search: 'Buscar',
    resources: 'Recursos'
  },
  ar: {
    welcome: 'مرحباً',
    recentCases: 'الحالات الأخيرة',
    report: 'تقرير',
    search: 'بحث',
    resources: 'موارد'
  }
};

const i18n = new I18n(translations);
i18n.locale = Localization.locale;
i18n.enableFallback = true;

const LanguageContext = createContext({
  language: 'en',
  setLanguage: (lang: string) => {},
  t: (key: string) => '',
  direction: 'ltr',
  isRTL: false,
  animatedValue: useSharedValue(0)
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(Localization.locale.split('-')[0]);
  const animatedValue = useSharedValue(0);

  const switchLanguage = (lang: string) => {
    animatedValue.value = withSpring(1, {}, (finished) => {
      if (finished) {
        setLanguage(lang);
        i18n.locale = lang;
        animatedValue.value = withTiming(0);
      }
    });
  };

  const value = {
    language,
    setLanguage: switchLanguage,
    t: (key: string) => i18n.t(key),
    direction: LANGUAGES[language]?.direction || 'ltr',
    isRTL: LANGUAGES[language]?.direction === 'rtl',
    animatedValue
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 