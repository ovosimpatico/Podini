import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';
import translationPT from '../locales/pt-BR/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  'pt-BR': {
    translation: translationPT
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;