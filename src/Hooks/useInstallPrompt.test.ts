import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from './useInstallPrompt';

type TestInstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function createBeforeInstallPromptEvent(
  outcome: 'accepted' | 'dismissed' = 'accepted'
): TestInstallEvent {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as TestInstallEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: 'web' });
  return event;
}

describe('useInstallPrompt', () => {
  it('canInstall is false before any beforeinstallprompt event fires', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it('canInstall becomes true after beforeinstallprompt fires, and the browser default is prevented', () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = createBeforeInstallPromptEvent();
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("promptInstall calls the captured event's prompt(), awaits userChoice, and resets canInstall", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = createBeforeInstallPromptEvent('accepted');

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalled();
    expect(result.current.canInstall).toBe(false);
  });

  it('canInstall resets to false when the appinstalled event fires', () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = createBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('promptInstall is a no-op when no event has been captured', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.canInstall).toBe(false);
  });
});
