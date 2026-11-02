import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { I18nContext } from './I18nContext';
import { loadMessages, sourceMessages, type Messages } from './loadMessages';
import { readStoredLocale, storeLocale } from './localePreference';
import { resolveLocale, SOURCE_LOCALE, type LocaleCode } from './locales';

function initialLocale(): LocaleCode {
  return readStoredLocale() ?? resolveLocale(navigator.languages ?? []) ?? SOURCE_LOCALE;
}

type Catalog = { locale: LocaleCode; messages: Messages };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [requested, setRequested] = useState<LocaleCode>(initialLocale);
  const [catalog, setCatalog] = useState<Catalog>({ locale: SOURCE_LOCALE, messages: sourceMessages });

  useEffect(() => {
    let cancelled = false;
    loadMessages(requested)
      .then((messages) => {
        if (!cancelled) setCatalog({ locale: requested, messages });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [requested]);

  useEffect(() => {
    document.documentElement.lang = catalog.locale;
  }, [catalog.locale]);

  const setLocale = useCallback((locale: LocaleCode) => {
    storeLocale(locale);
    setRequested(locale);
  }, []);

  const value = useMemo(() => ({ locale: requested, setLocale }), [requested, setLocale]);

  return (
    <I18nContext.Provider value={value}>
      <IntlProvider locale={catalog.locale} defaultLocale={SOURCE_LOCALE} messages={catalog.messages}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}
