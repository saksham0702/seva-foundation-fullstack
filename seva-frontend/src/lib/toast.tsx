"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const toast = {
    success: (msg: string, dur?: number) => addToast("success", msg, dur),
    error: (msg: string, dur?: number) => addToast("error", msg, dur),
    warning: (msg: string, dur?: number) => addToast("warning", msg, dur),
    info: (msg: string, dur?: number) => addToast("info", msg, dur),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx.toast;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="shrink-0 text-emerald-500" />,
  error: <XCircle size={16} className="shrink-0 text-red-500" />,
  warning: <AlertCircle size={16} className="shrink-0 text-amber-500" />,
  info: <Info size={16} className="shrink-0 text-blue-500" />,
};

const BORDERS: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2 pointer-events-none"
      style={{ width: "min(420px, 90vw)" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`
            w-full flex items-start gap-3 px-4 py-3.5
            bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.14)]
            border border-slate-100 border-l-4 ${BORDERS[t.type]}
            pointer-events-auto
            animate-in slide-in-from-bottom-4 fade-in duration-300
          `}
        >
          <span className="mt-0.5">{ICONS[t.type]}</span>
          <p className="flex-1 text-[13px] font-medium text-slate-800 leading-snug">
            {t.message}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-1 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
