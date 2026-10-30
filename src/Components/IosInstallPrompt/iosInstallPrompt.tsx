import { FormattedMessage, useIntl } from 'react-intl';
import { useIosInstallPrompt } from '../../Hooks/useIosInstallPrompt';
import './iosInstallPrompt.css';
import { SYMBOLS } from '../../Constants/untranslated';

const IosInstallPrompt = () => {
  const { shouldShow, dismiss } = useIosInstallPrompt();
  const intl = useIntl();

  if (!shouldShow) return null;

  return (
    <div className="iosInstallPrompt" role="note">
      <p>
        <FormattedMessage
          id="iosInstallPrompt.instructions"
          defaultMessage="Install for offline access: tap <strong>Share</strong> (look under <strong>•••</strong> if you don't see it), then find <strong>Add to Home Screen</strong> (tap <strong>View More</strong> if it's hidden)."
          values={{ strong: (chunks) => <strong>{chunks}</strong> }}
        />
      </p>
      <button
        className="iosInstallPromptDismiss"
        onClick={dismiss}
        aria-label={intl.formatMessage({ id: "iosInstallPrompt.dismiss", defaultMessage: "Dismiss install instructions" })}
      >
        {SYMBOLS.multiplySign}
      </button>
    </div>
  );
};

export default IosInstallPrompt;
