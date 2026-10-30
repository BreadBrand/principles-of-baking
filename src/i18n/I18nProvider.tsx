import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import en from './locales/en.json';

export const SOURCE_LOCALE = 'en';

export function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale={SOURCE_LOCALE} defaultLocale={SOURCE_LOCALE} messages={en}>
      {children}
    </IntlProvider>
  );
}
