'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import all language files
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import pt from '@/messages/pt.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';

const translations = {
  en,
  es,
  pt,
  fr,
  de,
};

export type TranslationNamespace = keyof typeof en;

export function useTranslation(namespace: TranslationNamespace) {
  const { language } = useLanguage();

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language][namespace];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }, [language, namespace]);

  return t;
}