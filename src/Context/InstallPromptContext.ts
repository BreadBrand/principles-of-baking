import { createContext, useContext } from "react";

type InstallPromptContextType = {
  canInstall: boolean;
  promptInstall: () => Promise<void>;
};

export const InstallPromptContext = createContext<InstallPromptContextType | undefined>(undefined);

export const useInstallPromptContext = () => {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) throw new Error("useInstallPromptContext must be used within an InstallPromptProvider");
  return ctx;
};
