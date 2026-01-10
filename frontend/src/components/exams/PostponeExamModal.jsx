import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Save, CheckCircle2, ArrowRight } from "lucide-react";
import api from "../../lib/api/apiClient";

export default function PostponeExamModal({
    apiPrefix = "/admin",
    exam,
    onClose,
    onSuccess,
}) {
  const [startTime, setStartTime] = useState(exam.start_time.slice(0, 16));
  const [duration, setDuration] = useState(exam.duration_minutes);
  const [endTime, setEndTime] = useState(exam.end_time.slice(0, 16));

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + Number(duration) * 60000);

    const pad = n => String(n).padStart(2, "0");
    setEndTime(
      `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`
    );
  }, [startTime, duration]);

  const save = async () => {
    await api.put(`${apiPrefix}/exams/${exam.id}/postpone`, {
      start_time: startTime,
      duration_minutes: duration,
      end_time: endTime,
    });

    showToast("Exam postponed");
    
    setTimeout(() => {
        onClose();
        onSuccess();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        />

        <motion.div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 border border-slate-100"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Postpone Exam</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Reschedule timing</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-500" /> New Start Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Clock size={14} className="text-indigo-500" /> Duration (Minutes)
                    </label>
                    <input
                        type="number"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <ArrowRight size={14} /> New End Time (Auto)
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-medium"
                        value={endTime}
                        readOnly
                    />
                </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white hover:border-slate-300 transition-colors" 
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button 
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95" 
                    onClick={save}
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </motion.div>

        {toast && (
            <motion.div 
                initial={{ opacity: 0, y: 20, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 right-8 z-[60] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50"
            >
                <div className="bg-emerald-500 rounded-full p-1">
                    <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold tracking-wide">{toast}</span>
            </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}