import { useEffect } from "react";
import { SYMBOLS } from "../../Constants/untranslated";
import "./Toast.css";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: ToastType;
}

const ICON_PATHS: Record<Exclude<ToastType, "info">, string> = {
  success: "M5 12.5l4.5 4.5L19 7.5",
  error: "M6 6l12 12M18 6L6 18",
  warning: "M12 5v9M12 18.5v.5",
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  if (type === "info") {
    return <span className="toastWave" aria-hidden="true">{SYMBOLS.wavingHand}</span>;
  }
  return (
    <svg className="toastIcon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[type]} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Toast = ({ message, duration = 3000, onClose, type = "info" }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      <ToastIcon type={type} />
      <span>{message}</span>
    </div>
  );
};
