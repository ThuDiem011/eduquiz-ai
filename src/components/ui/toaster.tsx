"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
}

interface ToasterProps {}

// Simple toast context
const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

let globalToast: ((props: ToastProps) => void) | null = null;

export function toast(props: ToastProps) {
  if (globalToast) globalToast(props);
}

export function Toaster({}: ToasterProps) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  globalToast = (props) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const variantStyles = {
    default: "bg-gray-900 text-white",
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex flex-col gap-1 rounded-xl p-4 shadow-lg max-w-sm w-full opacity-0 animate-in slide-in-from-bottom-4 fade-in duration-300",
            variantStyles[t.variant || "default"]
          )}
          style={{ animation: "slideIn 0.3s ease forwards" }}
        >
          {t.title && <p className="font-semibold text-sm">{t.title}</p>}
          {t.description && <p className="text-xs opacity-90">{t.description}</p>}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export const useToast = () => {
  return { toast };
};
