import { useCallback, useState } from "react";

interface ToastItem {
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

const MAX_TOASTS = 3;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    setToasts((prev) => {
      const newToasts = [...prev, { message, type }];
      if (newToasts.length > MAX_TOASTS) {
        newToasts.shift();
      }
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    toasts,
    addToast,
    removeToast
  };
};
