import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US/translation.json';
import enCA from './locales/en-CA/translation.json';
import frFR from './locales/fr-FR/translation.json';
import frCA from './locales/fr-CA/translation.json';
import ptBR from './locales/pt-BR/translation.json';
import ptPT from './locales/pt-PT/translation.json';
import esES from './locales/es-ES/translation.json';
import zhCH from './locales/zh-CH/translation.json';

export const supportedLanguages = [
  'en-US',
  'en-CA',
  'fr-FR',
  'fr-CA',
  'pt-BR',
  'pt-PT',
  'es-ES',
  'zh-CH',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const resources = {
  'en-US': { translation: enUS },
  'en-CA': { translation: enCA },
  'fr-FR': { translation: frFR },
  'fr-CA': { translation: frCA },
  'pt-BR': { translation: ptBR },
  'pt-PT': { translation: ptPT },
  'es-ES': { translation: esES },
  'zh-CH': { translation: zhCH },
};

const normalizeLanguage = (value?: string | null): SupportedLanguage => {
  if (!value) {
    return 'en-US';
  }

  const exactMatch = supportedLanguages.find((language) => language === value);
  if (exactMatch) {
    return exactMatch;
  }

  const lowerValue = value.toLowerCase();
  const partialMatch = supportedLanguages.find((language) => language.toLowerCase() === lowerValue);
  if (partialMatch) {
    return partialMatch;
  }

  const baseMatch = supportedLanguages.find((language) =>
    language.toLowerCase().startsWith(`${lowerValue.split('-')[0]}-`)
  );

  return baseMatch || 'en-US';
};

const savedLanguage =
  typeof window !== 'undefined' ? window.localStorage.getItem('fintrack-language') : null;
const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

void i18n.use(initReactI18next).init({
  resources,
  lng: normalizeLanguage(savedLanguage || browserLanguage),
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fintrack-language', language);
  }
});

export default i18n;
