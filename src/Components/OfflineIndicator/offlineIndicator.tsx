import { FormattedMessage } from 'react-intl';
import { useOnlineStatus } from '../../Hooks/useOnlineStatus';
import './offlineIndicator.css';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <span className="offlineIndicatorPill" role="status">
      <span className="offlineIndicatorDot" aria-hidden="true" />
      <FormattedMessage id="offlineIndicator.offline" defaultMessage="Offline" />
    </span>
  );
};

export default OfflineIndicator;
