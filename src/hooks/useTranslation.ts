'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations, TranslationNamespace } from '@/lib/translations';

export function useTranslation(namespace: TranslationNamespace) {
  const { language } = useLanguage();

  return (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language][namespace];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
}

