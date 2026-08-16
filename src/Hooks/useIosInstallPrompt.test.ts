import { renderHook, act } from '@testing-library/react';
import { useIosInstallPrompt } from './useIosInstallPrompt';

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

describe('useIosInstallPrompt', () => {
  const setUserAgent = (ua: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: ua,
    });
  };

  const setStandalone = (value: boolean | undefined) => {
    (window.navigator as NavigatorWithStandalone).standalone = value;
  };

  const IOS_SAFARI_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const ANDROID_CHROME_UA =
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

  beforeEach(() => {
    localStorage.clear();
    setStandalone(undefined);
  });

  it('shows the prompt on iOS Safari when not installed and not dismissed', () => {
    setUserAgent(IOS_SAFARI_UA);
    setStandalone(false);
    const { result } = renderHook(() => useIosInstallPrompt());
    expect(result.current.shouldShow).toBe(true);
  });

  it('does not show on non-iOS devices', () => {
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useIosInstallPrompt());
    expect(result.current.shouldShow).toBe(false);
  });

  it('does not show when already running in standalone mode', () => {
    setUserAgent(IOS_SAFARI_UA);
    setStandalone(true);
    const { result } = renderHook(() => useIosInstallPrompt());
    expect(result.current.shouldShow).toBe(false);
  });

  it('hides after dismiss() is called and stays hidden across remounts', () => {
    setUserAgent(IOS_SAFARI_UA);
    setStandalone(false);
    const { result, unmount } = renderHook(() => useIosInstallPrompt());
    expect(result.current.shouldShow).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.shouldShow).toBe(false);

    unmount();

    const { result: secondMount } = renderHook(() => useIosInstallPrompt());
    expect(secondMount.current.shouldShow).toBe(false);
  });
});
