import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ open, onClose, onConfirm, title, message }) {
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

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-500 shrink-0 border border-rose-500/20 mt-1">
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
                        className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors -mt-1 -mr-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
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
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}