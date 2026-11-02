import { readStoredLocale, storeLocale, LOCALE_STORAGE_KEY } from './localePreference';

describe('locale preference', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('returns null when nothing is stored', () => {
    expect(readStoredLocale()).toBeNull();
  });

  it('round-trips a supported locale', () => {
    storeLocale('de');
    expect(readStoredLocale()).toBe('de');
  });

  it('ignores a stored value that is not a supported locale', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'ko');
    expect(readStoredLocale()).toBeNull();
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readStoredLocale()).toBeNull();
    expect(() => storeLocale('fr')).not.toThrow();
  });
});
