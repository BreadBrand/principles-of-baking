import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useDrawer } from "../Context/DrawerContext";

export function computeRecipeUrl(activeTab: string, selectedId: string | null): string {
  return activeTab === "tab1" && selectedId ? `/tab/recipes/${selectedId}` : "/tab";
}

export type RecipeUrlSnapshot = {
  urlId: string | undefined;
  selectedId: string | null;
  activeTab: string;
};

export type RecipeUrlSyncResult =
  | { kind: "setSelectedId"; id: string }
  | { kind: "clearSelectedId" }
  | { kind: "navigate"; to: string }
  | { kind: "noop" };

/**
 * Reconciles the router URL id, the DrawerContext selection, and the active tab.
 *
 * `prev` is the snapshot committed on the last effect pass (or `null` on the very
 * first pass). We derive *what changed* from it rather than trusting the current
 * URL/selection to already agree, because the direction of the sync depends on
 * which side moved:
 *   - the URL moved  -> the URL is the source of truth (a shared link, Back/forward,
 *     or a plain /tab link)  -> push the change into the selection.
 *   - the selection / tab moved -> the selection is the source of truth
 *     (an in-app pick, or a tab switch) -> push the change into the URL.
 *
 * Two properties matter for correctness and are easy to get wrong:
 *   1. URL-convergence only runs when something actually changed this pass. If it
 *      ran unconditionally, React StrictMode's dev-only double invocation of the
 *      effect on mount would, on the second pass, see `prev === current` yet act on
 *      a `selectedId` that hasn't flushed yet and wrongly navigate back to /tab.
 *   2. The "URL lost its id -> forget the selection" branch is gated on the user
 *      still being on the recipe tab. When the hook itself strips the id from the
 *      URL during a tab switch, `activeTab` is already something other than "tab1",
 *      so we keep the selection for when the user returns; only a user-driven change
 *      while still on the recipe tab should clear it.
 */
export function resolveRecipeUrlSync(input: {
  prev: RecipeUrlSnapshot | null;
  urlId: string | undefined;
  selectedId: string | null;
  activeTab: string;
  pathname: string;
}): RecipeUrlSyncResult {
  const { prev, urlId, selectedId, activeTab, pathname } = input;

  // On the first pass there is no previous snapshot; treat the URL id as having
  // "appeared" so a cold shared-link load syncs into the selection, while the
  // selection/tab are treated as unchanged so we never spuriously act on them.
  const urlIdChanged = prev === null ? true : prev.urlId !== urlId;
  const selectedIdChanged = prev === null ? false : prev.selectedId !== selectedId;
  const activeTabChanged = prev === null ? false : prev.activeTab !== activeTab;

  if (urlIdChanged) {
    if (urlId !== undefined && urlId !== selectedId) {
      return { kind: "setSelectedId", id: urlId };
    }
    if (urlId === undefined && selectedId !== null && activeTab === "tab1") {
      return { kind: "clearSelectedId" };
    }
  }

  if (urlIdChanged || selectedIdChanged || activeTabChanged) {
    const target = computeRecipeUrl(activeTab, selectedId);
    if (target !== pathname) {
      return { kind: "navigate", to: target };
    }
  }

  return { kind: "noop" };
}

const useSyncRecipeUrl = () => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTab, selectedId, setSelectedId } = useDrawer();
  const prev = useRef<RecipeUrlSnapshot | null>(null);

  useEffect(() => {
    const result = resolveRecipeUrlSync({ prev: prev.current, urlId, selectedId, activeTab, pathname });
    prev.current = { urlId, selectedId, activeTab };

    if (result.kind === "setSelectedId") {
      setSelectedId(result.id);
    } else if (result.kind === "clearSelectedId") {
      setSelectedId(null);
    } else if (result.kind === "navigate") {
      navigate(result.to, { replace: true });
    }
  }, [urlId, selectedId, activeTab, pathname, navigate, setSelectedId]);

  return { pendingUrlId: urlId };
};

export default useSyncRecipeUrl;
