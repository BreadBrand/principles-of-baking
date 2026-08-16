import { useIosInstallPrompt } from '../../Hooks/useIosInstallPrompt';
import './iosInstallPrompt.css';

const IosInstallPrompt = () => {
  const { shouldShow, dismiss } = useIosInstallPrompt();

  if (!shouldShow) return null;

  return (
    <div className="iosInstallPrompt" role="note">
      <p>
        Install for offline access: tap <strong>•••</strong> or{' '}
        <strong>Share</strong>, then find <strong>Add to Home Screen</strong>{' '}
        (tap <strong>View More</strong> if needed).
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
