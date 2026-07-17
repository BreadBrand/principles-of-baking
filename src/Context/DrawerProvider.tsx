import { useState, useEffect, ReactNode } from "react";
import { DrawerContext } from "./DrawerContext";

export const DrawerProvider = ({ children }: {children: ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tab1");

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 481px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsDrawerOpen(false);
        setIsRecipeDrawerOpen(false);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const openDrawer = () => {
    setIsRecipeDrawerOpen(false);
    setIsDrawerOpen(true);
  }
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const openRecipeDrawer = () => {
    setIsDrawerOpen(false);
    setIsRecipeDrawerOpen(true);
  }
  const closeRecipeDrawer = () => setIsRecipeDrawerOpen(false);
  const toggleRecipeDrawer = () => setIsRecipeDrawerOpen(prev => !prev);

  return (
    <DrawerContext.Provider value={{
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isRecipeDrawerOpen,
      openRecipeDrawer,
      closeRecipeDrawer,
      toggleRecipeDrawer,
      selectedId,
      setSelectedId,
      activeTab,
      setActiveTab
    }}>
      {children}
    </DrawerContext.Provider>
  );
};
