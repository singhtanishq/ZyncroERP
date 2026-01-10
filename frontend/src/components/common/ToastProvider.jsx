import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    iconClasses: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    classes: "border-red-500/30 text-red-700 dark:text-red-300",
    iconClasses: "text-red-500",
  },
  info: {
    icon: Info,
    classes: "border-brand-blue-500/30 text-brand-blue-700 dark:text-brand-blue-300",
    iconClasses: "text-brand-blue-500",
  },
};

/**
 * Application-wide toast notifications.
 *
 *   const { toast } = useToast();
 *   toast("Student updated successfully.", "success");
 *   toast("Unable to update student. Please try again.", "error");
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-4), { id, message, type }]);

      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
          {toasts.map((t) => {
            const tone = TONES[t.type] || TONES.info;
            const Icon = tone.icon;

            return (
              <div
                key={t.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-[rgb(var(--zx-surface))] shadow-xl animate-fade-in ${tone.classes}`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconClasses}`} />
                <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
