import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import ukTranslations from './locales/uk.json';
import faTranslations from './locales/fa.json';
import soTranslations from './locales/so.json';
import frTranslations from './locales/fr.json';
import trTranslations from './locales/tr.json';
import kuTranslations from './locales/ku.json';
import tiTranslations from './locales/ti.json';
import deTranslations from './locales/de.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            ar: { translation: arTranslations },
            uk: { translation: ukTranslations },
            fa: { translation: faTranslations },
            so: { translation: soTranslations },
            fr: { translation: frTranslations },
            tr: { translation: trTranslations },
            ku: { translation: kuTranslations },
            ti: { translation: tiTranslations },
            de: { translation: deTranslations }
        },
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
