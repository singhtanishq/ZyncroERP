import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MailOpen, 
  X, 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock, 
  Inbox,
  Loader2,
  ChevronRight,
  Mailbox,
  Hash,
  ShieldCheck
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingLogId, setLoadingLogId] = useState(null);

  // ================= FETCH LOGS =================
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/communication/logs", {
        withCredentials: true,
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ================= FETCH SINGLE LOG =================
  const openLog = async (id) => {
    setLoadingLogId(id);
    try {
      const res = await api.get(`/admin/communication/logs/${id}`, {
        withCredentials: true,
      });
      setSelectedLog(res.data);
    } catch (error) {
      console.error("Failed to fetch log details", error);
    } finally {
      setLoadingLogId(null);
    }
  };

  // ================= UI HELPERS =================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      {/* Custom Scrollbar */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Mailbox className="text-indigo-600" size={32} />
              Communication Logs
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Review the history of all outbound emails. Monitor delivery statuses, view exact timestamps, and inspect message contents.
            </p>
          </div>
        </div>

        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" />
              Outbound Mail Ledger
            </h3>
            {logs.length > 0 && !isLoading && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {logs.length} Records
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Log ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Sent</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <span className="font-bold tracking-widest text-sm uppercase">Fetching Logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No email logs found</p>
                        <p className="text-sm mt-1">Outbound communication records will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => openLog(log.id)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-slate-600 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          #{log.id}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 text-base">{log.name}</span>
                          <span className="text-sm font-medium text-slate-500">{log.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-800 truncate max-w-[250px] lg:max-w-md block">
                          {log.subject}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {log.status ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200">
                             Delivered
                           </span>
                        ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-200">
                             Failed
                           </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Clock size={14} className="text-slate-400" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        {loadingLogId === log.id ? (
                          <Loader2 size={18} className="animate-spin text-indigo-600 inline-block" />
                        ) : (
                          <div className="p-2 rounded-full inline-block transition-all duration-200 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 active:scale-95">
                            <ChevronRight size={18} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= GMAIL-STYLE PREVIEW MODAL ================= */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            >
              
              {/* Modal Toolbar */}
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-3 text-slate-500">
                  <MailOpen size={20} />
                  <span className="text-sm font-semibold uppercase tracking-wider">Email View</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-full transition-colors active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-dashboard-scroll">
                {/* Email Header Area */}
                <div className="px-8 py-6 border-b border-slate-100">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 leading-snug">
                    {selectedLog.subject}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Sender/Recipient Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                        {selectedLog.name ? selectedLog.name.charAt(0).toUpperCase() : <User size={20}/>}
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-900 text-base">{selectedLog.name}</span>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {selectedLog.role || "User"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          <span className="text-slate-400">to</span> <span className="font-medium text-slate-600">&lt;{selectedLog.email}&gt;</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col sm:items-end gap-2 ml-16 sm:ml-0">
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                        {formatDate(selectedLog.created_at)}
                      </span>
                      {selectedLog.status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                            <CheckCircle2 size={10} /> Delivered
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-200 w-fit">
                            <XCircle size={10} /> Failed
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Content Body */}
                <div className="p-8 bg-white min-h-[300px]">
                  <div 
                    className="prose prose-slate max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: selectedLog.content }}
                  />
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Hash size={12}/> Log ID: {selectedLog.id}
                  </div>
                  <button
                      onClick={() => setSelectedLog(null)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                  >
                      Close Window
                  </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}