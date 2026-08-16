import { useIosInstallPrompt } from '../../Hooks/useIosInstallPrompt';
import './iosInstallPrompt.css';

const IosInstallPrompt = () => {
  const { shouldShow, dismiss } = useIosInstallPrompt();

  if (!shouldShow) return null;

  return (
    <div className="iosInstallPrompt" role="note">
      <p>
        Install Bread Machine for offline access: tap <strong>Share</strong>,
        then <strong>Add to Home Screen</strong>.
      </p>
      <button
        className="iosInstallPromptDismiss"
        onClick={dismiss}
        aria-label="Dismiss install instructions"
      >
        &times;
      </button>
    </div>
  );
};

export default IosInstallPrompt;
