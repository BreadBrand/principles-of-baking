export const SOURCE_LOCALE = 'en';

export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'zh-Hans', name: '简体中文' },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code'];

const SUPPORTED_CODES: readonly string[] = SUPPORTED_LOCALES.map(({ code }) => code);

export function isSupportedLocale(value: string | null): value is LocaleCode {
  return value !== null && SUPPORTED_CODES.includes(value);
}

const TRADITIONAL_CHINESE_REGIONS = ['tw', 'hk', 'mo'];

function matchTag(tag: string): LocaleCode | null {
  const [language, ...subtags] = tag.toLowerCase().split(/[-_]/);
  if (language === 'pt') return 'pt-BR';
  if (language === 'zh') {
    const isTraditional =
      subtags.includes('hant') || subtags.some((subtag) => TRADITIONAL_CHINESE_REGIONS.includes(subtag));
    return isTraditional ? null : 'zh-Hans';
  }
  const match = SUPPORTED_CODES.find((code) => code.toLowerCase() === language);
  return match && isSupportedLocale(match) ? match : null;
}

export function resolveLocale(requested: readonly string[]): LocaleCode | null {
  for (const tag of requested) {
    const match = matchTag(tag);
    if (match) return match;
  }
  return null;
}
