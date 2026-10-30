import { createIntl } from 'react-intl';
import en from '../i18n/locales/en.json';

export const intl = createIntl({ locale: 'en', defaultLocale: 'en', messages: en });
