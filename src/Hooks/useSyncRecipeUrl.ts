import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useDrawer } from "../Context/DrawerContext";

export function computeRecipeUrl(activeTab: string, selectedId: string | null): string {
  return activeTab === "tab1" && selectedId ? `/tab/recipes/${selectedId}` : "/tab";
}

export type RecipeUrlSyncResult =
  | { kind: "setSelectedId"; id: string }
  | { kind: "clearSelectedId" }
  | { kind: "navigate"; to: string }
  | { kind: "noop" };

export function resolveRecipeUrlSync(input: {
  urlId: string | undefined;
  prevUrlId: string | undefined;
  selectedId: string | null;
  activeTab: string;
  pathname: string;
}): RecipeUrlSyncResult {
  const { urlId, prevUrlId, selectedId, activeTab, pathname } = input;
  const urlIdChanged = urlId !== prevUrlId;

  if (urlIdChanged) {
    if (urlId !== undefined && urlId !== selectedId) {
      return { kind: "setSelectedId", id: urlId };
    }
    if (urlId === undefined && selectedId !== null) {
      return { kind: "clearSelectedId" };
    }
  }

  const target = computeRecipeUrl(activeTab, selectedId);
  if (target !== pathname) {
    return { kind: "navigate", to: target };
  }

  return { kind: "noop" };
}

const useSyncRecipeUrl = () => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTab, selectedId, setSelectedId } = useDrawer();
  const prevUrlId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const result = resolveRecipeUrlSync({ urlId, prevUrlId: prevUrlId.current, selectedId, activeTab, pathname });
    prevUrlId.current = urlId;

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
