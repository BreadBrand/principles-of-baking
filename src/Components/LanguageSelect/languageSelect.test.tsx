import { fireEvent, screen } from '@testing-library/react';
import { renderWithIntl } from '../../test/renderWithIntl';
import { LOCALE_STORAGE_KEY } from '../../i18n/localePreference';
import LanguageSelect from './languageSelect';

describe('LanguageSelect', () => {
  beforeEach(() => localStorage.clear());

  it('lists every supported language by its own name', () => {
    renderWithIntl(<LanguageSelect />);
    const names = screen.getAllByRole('option').map((option) => option.textContent);
    expect(names).toEqual(['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語', '简体中文']);
  });

  it('is labelled for screen readers', () => {
    renderWithIntl(<LanguageSelect />);
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeInTheDocument();
  });

  it('saves the chosen language and translates the label', async () => {
    renderWithIntl(<LanguageSelect />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fr' } });
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    expect(await screen.findByRole('combobox', { name: 'Langue' })).toBeInTheDocument();
  });
});
