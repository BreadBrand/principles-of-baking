import { createContext, useContext } from 'react';
import type { LocaleCode } from './locales';

type I18nContextType = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useLocale = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within an I18nProvider');
  return ctx;
};
