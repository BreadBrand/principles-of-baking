import { createContext, useContext } from "react";
import type { useToast } from "../Hooks/useToast";

type ToastContextType = Pick<ReturnType<typeof useToast>, "addToast">;

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within a ToastContext provider");
  return ctx;
};
