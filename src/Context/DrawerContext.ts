import { createContext, useContext } from "react";

type DrawerContextType = {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isRecipeDrawerOpen: boolean;
  openRecipeDrawer: () => void;
  closeRecipeDrawer: () => void;
  toggleRecipeDrawer: () => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within a DrawerProvider");
  return ctx
}
