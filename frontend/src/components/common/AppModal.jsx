import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

/**
 * Unified application modal.
 *
 * - Centered on both mobile and desktop for consistent layout behavior
 * - Long content scrolls INSIDE the body; the modal never leaves the viewport
 * - ESC key and backdrop click close it; body scroll is locked while open
 * - Consistent header/footer chrome for every module
 */
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${SIZES[size]} max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-2xl animate-fade-in overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-4 px-6 py-4 border-b border-[rgb(var(--zx-border))] shrink-0 ${
            isDanger ? "bg-rose-500/5" : ""
          }`}
        >
          <h2
            className={`text-base font-bold flex items-center gap-2.5 ${
              isDanger ? "text-rose-500" : "text-[rgb(var(--zx-text))]"
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

        {/* Body — scrolls internally */}
        <div className="flex-1 min-h-0 overflow-y-auto zx-scroll px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}