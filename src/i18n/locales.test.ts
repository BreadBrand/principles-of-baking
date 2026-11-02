import { resolveLocale, SUPPORTED_LOCALES } from './locales';

describe('resolveLocale', () => {
  it('returns an exact match', () => {
    expect(resolveLocale(['fr'])).toBe('fr');
  });

  it('maps regional variants to the base language', () => {
    expect(resolveLocale(['es-MX'])).toBe('es');
    expect(resolveLocale(['fr-CA'])).toBe('fr');
    expect(resolveLocale(['de-AT'])).toBe('de');
    expect(resolveLocale(['en-GB'])).toBe('en');
  });

  it('maps every Portuguese variant to pt-BR', () => {
    expect(resolveLocale(['pt-PT'])).toBe('pt-BR');
    expect(resolveLocale(['pt'])).toBe('pt-BR');
    expect(resolveLocale(['pt-BR'])).toBe('pt-BR');
  });

  it('maps simplified Chinese to zh-Hans', () => {
    expect(resolveLocale(['zh'])).toBe('zh-Hans');
    expect(resolveLocale(['zh-CN'])).toBe('zh-Hans');
    expect(resolveLocale(['zh-SG'])).toBe('zh-Hans');
    expect(resolveLocale(['zh-Hans-CN'])).toBe('zh-Hans');
  });

  it('skips traditional Chinese rather than showing simplified characters', () => {
    expect(resolveLocale(['zh-TW'])).toBeNull();
    expect(resolveLocale(['zh-HK'])).toBeNull();
    expect(resolveLocale(['zh-Hant'])).toBeNull();
    expect(resolveLocale(['zh-Hant-TW', 'ja'])).toBe('ja');
  });

  it('takes the first supported language in preference order', () => {
    expect(resolveLocale(['ko', 'it-IT', 'fr'])).toBe('it');
  });

  it('is case-insensitive and accepts underscores', () => {
    expect(resolveLocale(['PT_br'])).toBe('pt-BR');
    expect(resolveLocale(['JA'])).toBe('ja');
  });

  it('returns null when nothing matches', () => {
    expect(resolveLocale(['ko', 'ar'])).toBeNull();
    expect(resolveLocale([])).toBeNull();
  });
});

describe('SUPPORTED_LOCALES', () => {
  it('lists each language by its own name', () => {
    const names = Object.fromEntries(SUPPORTED_LOCALES.map(({ code, name }) => [code, name]));
    expect(names).toMatchObject({ en: 'English', fr: 'Français', ja: '日本語', 'zh-Hans': '简体中文' });
  });
});
