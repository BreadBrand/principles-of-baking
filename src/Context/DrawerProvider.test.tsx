import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { DrawerProvider } from "./DrawerProvider";
import { useDrawer } from "./DrawerContext";
import { MOBILE_MAX_WIDTH, NAV_COLLAPSE_MAX_WIDTH } from "../Constants/breakpoints";

type ChangeListener = (e: { matches: boolean }) => void;

const listenersByQuery = new Map<string, ChangeListener[]>();

const widenPast = (maxWidth: number) =>
  act(() => {
    listenersByQuery.get(`(min-width: ${maxWidth + 1}px)`)?.forEach(listener => listener({ matches: true }));
  });

const wrapper = ({ children }: { children: ReactNode }) => <DrawerProvider>{children}</DrawerProvider>;

describe("DrawerProvider", () => {
  beforeEach(() => {
    listenersByQuery.clear();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      addEventListener: (_: string, listener: ChangeListener) => {
        listenersByQuery.set(query, [...(listenersByQuery.get(query) ?? []), listener]);
      },
      removeEventListener: () => {},
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("closes the side menu once the screen is wider than the nav collapse width", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    act(() => result.current.openDrawer());
    expect(result.current.isDrawerOpen).toBe(true);

    widenPast(NAV_COLLAPSE_MAX_WIDTH);

    expect(result.current.isDrawerOpen).toBe(false);
  });

  it("keeps the side menu open when the screen widens past the mobile width but not the nav collapse width", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    act(() => result.current.openDrawer());

    widenPast(MOBILE_MAX_WIDTH);

    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("closes the recipe drawer once the screen is wider than the mobile width", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    act(() => result.current.openRecipeDrawer());
    expect(result.current.isRecipeDrawerOpen).toBe(true);

    widenPast(MOBILE_MAX_WIDTH);

    expect(result.current.isRecipeDrawerOpen).toBe(false);
  });
});
