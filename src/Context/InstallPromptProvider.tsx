import { ReactNode } from "react";
import { InstallPromptContext } from "./InstallPromptContext";
import { useInstallPrompt } from "../Hooks/useInstallPrompt";

export const InstallPromptProvider = ({ children }: { children: ReactNode }) => {
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <InstallPromptContext.Provider value={{ canInstall, promptInstall }}>
      {children}
    </InstallPromptContext.Provider>
  );
};
