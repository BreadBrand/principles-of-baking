import { useIntl } from 'react-intl';
import { useLocale } from '../../i18n/I18nContext';
import { SUPPORTED_LOCALES, isSupportedLocale } from '../../i18n/locales';
import { SYMBOLS } from '../../Constants/untranslated';
import './languageSelect.css';

type LanguageSelectProps = {
  className?: string;
};

const LanguageSelect = ({ className = '' }: LanguageSelectProps) => {
  const intl = useIntl();
  const { locale, setLocale } = useLocale();

  return (
    <label className={`languageSelect ${className}`}>
      <span className="languageSelectFace">
        <span className="languageSelectGlobe" aria-hidden="true">{SYMBOLS.globe}</span>
        <select
          value={locale}
          aria-label={intl.formatMessage({ id: 'language.label', defaultMessage: 'Language' })}
          onChange={(event) => {
            if (isSupportedLocale(event.target.value)) setLocale(event.target.value);
          }}
        >
          {SUPPORTED_LOCALES.map(({ code, name }) => (
            <option key={code} value={code} lang={code}>{name}</option>
          ))}
        </select>
      </span>
    </label>
  );
};

export default LanguageSelect;
