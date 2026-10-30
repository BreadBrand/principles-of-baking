import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nProvider';

export function renderWithIntl(ui: ReactElement) {
  return render(ui, { wrapper: I18nProvider });
}
