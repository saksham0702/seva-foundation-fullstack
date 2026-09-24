"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const value: ToastContextType = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                isSuccess
                  ? "bg-white border-emerald-200 text-emerald-950 shadow-emerald-900/10"
                  : isError
                  ? "bg-white border-red-200 text-red-950 shadow-red-900/10"
                  : isWarning
                  ? "bg-white border-amber-200 text-amber-950 shadow-amber-900/10"
                  : "bg-white border-slate-200 text-slate-900 shadow-slate-900/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isSuccess
                      ? "bg-emerald-100 text-emerald-600"
                      : isError
                      ? "bg-red-100 text-red-600"
                      : isWarning
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isSuccess && <CheckCircle2 size={16} />}
                  {isError && <AlertCircle size={16} />}
                  {isWarning && <AlertTriangle size={16} />}
                  {t.type === "info" && <Info size={16} />}
                </div>
                <div>
                  <p className="text-xs font-bold capitalize text-black">
                    {t.type}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-black p-1 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      toast: (msg: string) => console.log(msg),
      success: (msg: string) => console.log(msg),
      error: (msg: string) => console.error(msg),
      warning: (msg: string) => console.warn(msg),
      info: (msg: string) => console.info(msg),
    };
  }
  return ctx;
}
