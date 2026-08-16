import { useState } from 'react';

const DISMISSED_KEY = 'bread-machine:ios-install-dismissed';

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  const isIphoneOrIpod = /iPhone|iPod/.test(ua);
  // iPadOS Safari reports as "Macintosh" with touch support, unlike a real Mac.
  const isIpad =
    /iPad/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIphoneOrIpod || isIpad;
}

function isStandalone(): boolean {
  return (window.navigator as NavigatorWithStandalone).standalone === true;
}

export function useIosInstallPrompt(): { shouldShow: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  );

  const shouldShow = isIosDevice() && !isStandalone() && !dismissed;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return { shouldShow, dismiss };
}
