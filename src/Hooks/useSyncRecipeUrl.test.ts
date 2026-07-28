import { describe, it, expect } from "vitest";
import { computeRecipeUrl, resolveRecipeUrlSync } from "./useSyncRecipeUrl";

describe("computeRecipeUrl", () => {
  it("builds a recipe URL when on the recipe tab with a selection", () => {
    expect(computeRecipeUrl("tab1", "xyz")).toBe("/tab/recipes/xyz");
  });

  it("returns the plain tab URL when on the recipe tab with no selection", () => {
    expect(computeRecipeUrl("tab1", null)).toBe("/tab");
  });

  it("returns the plain tab URL when on a different tab, even with a selection", () => {
    expect(computeRecipeUrl("tab2", "xyz")).toBe("/tab");
  });
});

describe("resolveRecipeUrlSync", () => {
  it("syncs selectedId from a fresh URL id on cold load", () => {
    const result = resolveRecipeUrlSync({
      urlId: "abc",
      prevUrlId: undefined,
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab/recipes/abc",
    });
    expect(result).toEqual({ kind: "setSelectedId", id: "abc" });
  });

  it("does nothing once selectedId and the URL have converged", () => {
    const result = resolveRecipeUrlSync({
      urlId: "abc",
      prevUrlId: "abc",
      selectedId: "abc",
      activeTab: "tab1",
      pathname: "/tab/recipes/abc",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  it("does nothing on a plain /tab load with no selection", () => {
    const result = resolveRecipeUrlSync({
      urlId: undefined,
      prevUrlId: undefined,
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  it("navigates to the recipe URL when a recipe is selected in-app", () => {
    const result = resolveRecipeUrlSync({
      urlId: undefined,
      prevUrlId: undefined,
      selectedId: "xyz",
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "navigate", to: "/tab/recipes/xyz" });
  });

  it("navigates back to /tab when switching away from the recipe tab", () => {
    const result = resolveRecipeUrlSync({
      urlId: "xyz",
      prevUrlId: "xyz",
      selectedId: "xyz",
      activeTab: "tab2",
      pathname: "/tab/recipes/xyz",
    });
    expect(result).toEqual({ kind: "navigate", to: "/tab" });
  });

  it("syncs selectedId when the URL id changes to a different recipe (e.g. browser back/forward)", () => {
    const result = resolveRecipeUrlSync({
      urlId: "new",
      prevUrlId: "old",
      selectedId: "old",
      activeTab: "tab1",
      pathname: "/tab/recipes/new",
    });
    expect(result).toEqual({ kind: "setSelectedId", id: "new" });
  });
});
