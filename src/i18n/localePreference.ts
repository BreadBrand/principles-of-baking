import { isSupportedLocale, type LocaleCode } from './locales';

export const LOCALE_STORAGE_KEY = 'bread-machine.locale';

export function readStoredLocale(): LocaleCode | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: LocaleCode) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    return;
  }
}
