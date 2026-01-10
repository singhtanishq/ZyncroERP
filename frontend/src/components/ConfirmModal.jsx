import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
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
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            {/* Content Container */}
            <div className="flex items-start gap-4">
                
              {/* Icon */}
              <div className="bg-red-50 p-3 rounded-full text-red-600 shrink-0 border border-red-100 mt-1">
                <AlertTriangle size={24} />
              </div>

              {/* Text Content */}
              <div className="space-y-2 w-full">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {title}
                    </h3>
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-500 transition-colors -mt-1 -mr-2 p-1 rounded-full hover:bg-slate-50"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                <div className="text-sm text-slate-500 font-medium leading-relaxed">
                  {message}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}