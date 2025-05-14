import i18n from 'i18next';

import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import resources from './resources';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  debug: true, // Enable logging for development
  fallbackLng: 'zh_TW', // Default language
});

export default i18n;
