import { render, screen } from '@testing-library/react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { I18nProvider } from './I18nProvider';

describe('I18nProvider', () => {
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
});
