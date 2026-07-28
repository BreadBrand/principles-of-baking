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
      prev: null,
      urlId: "abc",
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab/recipes/abc",
    });
    expect(result).toEqual({ kind: "setSelectedId", id: "abc" });
  });

  it("syncs selectedId from a not-found URL id on cold load (RecipeExplorer decides not-found)", () => {
    const result = resolveRecipeUrlSync({
      prev: null,
      urlId: "does-not-exist",
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab/recipes/does-not-exist",
    });
    expect(result).toEqual({ kind: "setSelectedId", id: "does-not-exist" });
  });

  it("does nothing once selectedId and the URL have converged", () => {
    const result = resolveRecipeUrlSync({
      prev: { urlId: "abc", selectedId: "abc", activeTab: "tab1" },
      urlId: "abc",
      selectedId: "abc",
      activeTab: "tab1",
      pathname: "/tab/recipes/abc",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  it("does nothing on a plain /tab load with no selection", () => {
    const result = resolveRecipeUrlSync({
      prev: null,
      urlId: undefined,
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  it("navigates to the recipe URL when a recipe is selected in-app", () => {
    const result = resolveRecipeUrlSync({
      // selection just moved from null -> "xyz"; the URL hasn't caught up yet.
      prev: { urlId: undefined, selectedId: null, activeTab: "tab1" },
      urlId: undefined,
      selectedId: "xyz",
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "navigate", to: "/tab/recipes/xyz" });
  });

  it("settles to a no-op once the URL has caught up to an in-app selection", () => {
    const result = resolveRecipeUrlSync({
      prev: { urlId: undefined, selectedId: "xyz", activeTab: "tab1" },
      urlId: "xyz",
      selectedId: "xyz",
      activeTab: "tab1",
      pathname: "/tab/recipes/xyz",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  it("navigates back to /tab when switching away from the recipe tab", () => {
    const result = resolveRecipeUrlSync({
      // active tab just moved from tab1 -> tab2; the URL still holds the id.
      prev: { urlId: "xyz", selectedId: "xyz", activeTab: "tab1" },
      urlId: "xyz",
      selectedId: "xyz",
      activeTab: "tab2",
      pathname: "/tab/recipes/xyz",
    });
    expect(result).toEqual({ kind: "navigate", to: "/tab" });
  });

  it("syncs selectedId when the URL id changes to a different recipe (e.g. browser back/forward)", () => {
    const result = resolveRecipeUrlSync({
      prev: { urlId: "old", selectedId: "old", activeTab: "tab1" },
      urlId: "new",
      selectedId: "old",
      activeTab: "tab1",
      pathname: "/tab/recipes/new",
    });
    expect(result).toEqual({ kind: "setSelectedId", id: "new" });
  });

  it("clears selectedId when the URL loses its id while still on the recipe tab (e.g. clicking a plain /tab link)", () => {
    const result = resolveRecipeUrlSync({
      prev: { urlId: "abc", selectedId: "abc", activeTab: "tab1" },
      urlId: undefined,
      selectedId: "abc",
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "clearSelectedId" });
  });

  // Bug 2: the hook's own tab-switch navigation strips the id from the URL. That
  // self-caused URL change must NOT be treated like a user clearing the URL — the
  // selection has to survive so it can be restored when the user returns.
  it("keeps the selection when the hook's own tab switch strips the id from the URL", () => {
    const result = resolveRecipeUrlSync({
      // url id just moved "abc" -> undefined, but we are already off the recipe tab.
      prev: { urlId: "abc", selectedId: "abc", activeTab: "tab2" },
      urlId: undefined,
      selectedId: "abc",
      activeTab: "tab2",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "noop" });
  });

  // Bug 2 (restore half): returning to the recipe tab with a preserved selection
  // must re-navigate the URL back to the recipe.
  it("restores the recipe URL when returning to the recipe tab with a preserved selection", () => {
    const result = resolveRecipeUrlSync({
      // active tab just moved tab2 -> tab1; selection was preserved off-tab.
      prev: { urlId: undefined, selectedId: "abc", activeTab: "tab2" },
      urlId: undefined,
      selectedId: "abc",
      activeTab: "tab1",
      pathname: "/tab",
    });
    expect(result).toEqual({ kind: "navigate", to: "/tab/recipes/abc" });
  });

  // Bug 1 (StrictMode idempotency): on the second, synthetic effect invocation the
  // snapshot is identical to the previous pass and the just-decided setSelectedId
  // has NOT flushed yet (selectedId is still null). With no change detected, the
  // result must be a no-op — not a navigate back to /tab that clobbers the pending
  // selection.
  it("is a no-op on a repeated pass with an unchanged snapshot even before the selection has flushed", () => {
    const result = resolveRecipeUrlSync({
      prev: { urlId: "abc", selectedId: null, activeTab: "tab1" },
      urlId: "abc",
      selectedId: null,
      activeTab: "tab1",
      pathname: "/tab/recipes/abc",
    });
    expect(result).toEqual({ kind: "noop" });
  });
});
