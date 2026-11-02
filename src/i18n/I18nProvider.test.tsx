import { act, render, screen } from '@testing-library/react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { I18nProvider } from './I18nProvider';
import { useLocale } from './I18nContext';
import { LOCALE_STORAGE_KEY } from './localePreference';

const Probe = () => {
  const { locale, setLocale } = useLocale();
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <button data-testid="to-fr" onClick={() => setLocale('fr')} />
      <FormattedMessage id="header.learn" defaultMessage="Learn how to bake" />
    </>
  );
};

function setBrowserLanguages(languages: string[]) {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders the default message when the catalog has no entry for the id', () => {
    render(
      <I18nProvider>
        <FormattedMessage id="test.missing" defaultMessage="Fallback text" />
      </I18nProvider>,
    );
    expect(screen.getByText('Fallback text')).toBeInTheDocument();
  });

  it('formats ICU plurals', () => {
    render(
      <IntlProvider locale="en" messages={{ loaves: '{count, plural, one {# loaf} other {# loaves}}' }}>
        <FormattedMessage id="loaves" values={{ count: 2 }} />
      </IntlProvider>,
    );
    expect(screen.getByText('2 loaves')).toBeInTheDocument();
  });

  it('falls back to English when the browser language is unsupported', () => {
    setBrowserLanguages(['ko']);
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByText('Learn how to bake')).toBeInTheDocument();
  });

  it('starts in the browser language and loads its messages', async () => {
    setBrowserLanguages(['de-DE']);
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(screen.getByTestId('locale')).toHaveTextContent('de');
    expect(await screen.findByText(/^Lerne/)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('de');
  });

  it('prefers the saved choice over the browser language', async () => {
    setBrowserLanguages(['de']);
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es');
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(screen.getByTestId('locale')).toHaveTextContent('es');
    await vi.waitFor(() => expect(document.documentElement.lang).toBe('es'));
  });

  it('switches language, saves the choice and updates the page language', async () => {
    setBrowserLanguages(['en-US']);
    render(<I18nProvider><Probe /></I18nProvider>);
    await act(async () => screen.getByTestId('to-fr').click());
    expect(await screen.findByText(/^Apprendre/)).toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });
});
