import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

const TONES = {
  danger: {
    iconWrap: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
    confirm: "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20",
  },
  primary: {
    iconWrap: "bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20",
    confirm: "bg-brand-teal-500 hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20",
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  busy = false,
  tone = "danger",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (busy) return;
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  const toneClasses = TONES[tone] || TONES.danger;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!busy) onClose?.();
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
          >
            {/* Content Container */}
            <div className="flex items-start gap-4">

              {/* Icon */}
              <div className={`p-3 rounded-2xl shrink-0 mt-1 ${toneClasses.iconWrap}`}>
                <AlertTriangle size={24} />
              </div>

              {/* Text Content */}
              <div className="space-y-2 w-full">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {title}
                    </h3>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        disabled={busy}
                        className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors -mt-1 -mr-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="text-[14px] text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
                  {message}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                disabled={busy}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${toneClasses.confirm}`}
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                {busy ? `${confirmText}...` : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
