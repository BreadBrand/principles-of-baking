import en from './locales/en.json';
import type { LocaleCode } from './locales';

export type Messages = Record<string, string>;

const lazyLoaders: Record<Exclude<LocaleCode, 'en'>, () => Promise<{ default: Messages }>> = {
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  it: () => import('./locales/it.json'),
  'pt-BR': () => import('./locales/pt-BR.json'),
  ja: () => import('./locales/ja.json'),
  'zh-Hans': () => import('./locales/zh-Hans.json'),
};

export const sourceMessages: Messages = en;

export async function loadMessages(locale: LocaleCode): Promise<Messages> {
  if (locale === 'en') return sourceMessages;
  return (await lazyLoaders[locale]()).default;
}
