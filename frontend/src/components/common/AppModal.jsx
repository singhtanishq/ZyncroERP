import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export default function AppModal({
  open,
  onClose,
  title,
  size = "md",
  tone = "default",
  footer = null,
  children,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = tone === "danger";

  return createPortal(
    /* z-[9999] guarantees it sits above sidebars, headers, and floating elements */
    <div
      className="fixed inset-0 z-[9999] isolate flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      {/* Backdrop covering entire screen */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative z-10 w-full ${SIZES[size]} max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))] rounded-t-3xl sm:rounded-2xl shadow-2xl animate-fade-in overflow-hidden my-auto`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-4 px-6 py-4 border-b border-[rgb(var(--zx-border))] shrink-0 bg-[rgb(var(--zx-surface-hover))]/50 ${
            isDanger ? "bg-rose-500/5" : ""
          }`}
        >
          <h2
            className={`text-base font-bold flex items-center gap-2.5 ${
              isDanger ? "text-rose-600 dark:text-rose-300" : "text-[rgb(var(--zx-text))]"
            }`}
          >
            {isDanger ? <AlertTriangle size={18} /> : null}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto zx-scroll px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]/50 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}