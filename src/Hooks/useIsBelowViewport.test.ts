import { act, renderHook } from "@testing-library/react";
import { useIsBelowViewport } from "./useIsBelowViewport";

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let triggerObservation: ObserverCallback;
const disconnect = vi.fn();

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    triggerObservation = callback;
  }
  observe = vi.fn();
  disconnect = disconnect;
}

const targetRef = () => ({ current: document.createElement("div") });

const observe = (entry: { isIntersecting: boolean; top: number }) =>
  act(() => {
    triggerObservation([{ isIntersecting: entry.isIntersecting, boundingClientRect: { top: entry.top } as DOMRectReadOnly }]);
  });

describe("useIsBelowViewport", () => {
  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts false before any observation", () => {
    const { result } = renderHook(() => useIsBelowViewport(targetRef()));
    expect(result.current).toBe(false);
  });

  it("is true when the target is off screen below the viewport", () => {
    const { result } = renderHook(() => useIsBelowViewport(targetRef()));
    observe({ isIntersecting: false, top: 1400 });
    expect(result.current).toBe(true);
  });

  it("is false when the target is visible", () => {
    const { result } = renderHook(() => useIsBelowViewport(targetRef()));
    observe({ isIntersecting: false, top: 1400 });
    observe({ isIntersecting: true, top: 600 });
    expect(result.current).toBe(false);
  });

  it("is false when the target has been scrolled past above the viewport", () => {
    const { result } = renderHook(() => useIsBelowViewport(targetRef()));
    observe({ isIntersecting: false, top: -200 });
    expect(result.current).toBe(false);
  });

  it("stays false when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() => useIsBelowViewport(targetRef()));
    expect(result.current).toBe(false);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderHook(() => useIsBelowViewport(targetRef()));
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
