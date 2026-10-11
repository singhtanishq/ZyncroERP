import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { ErrorState } from "../../../components/common/States";
import { useToast } from "../../../components/common/ToastProvider";
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

// Render stored email HTML as plain, preformatted text (never inject raw HTML).
const stripHtml = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
};

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
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingLogId, setLoadingLogId] = useState(null);

  // ================= FETCH LOGS =================
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/communication/logs", {
        withCredentials: true,
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogs([]);
      setError(true);
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
    } catch (err) {
      console.error("Failed to fetch log details", err);
      toast(
        err?.response?.data?.message || "Failed to load log details",
        "error"
      );
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
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans overflow-x-hidden">
      {/* Custom Scrollbar */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
      `}</style>

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
              <Mailbox size={14} strokeWidth={2.5} />
              System Diagnostics
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
              Communication Logs
            </h1>
            <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
              Review the history of all outbound emails. Monitor delivery statuses, view exact timestamps, and inspect message contents.
            </p>
          </div>
        </div>

        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col min-h-[500px] relative z-10">
          <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-teal-500" />
              Outbound Mail Ledger
            </h3>
            {logs.length > 0 && !isLoading && (
              <span className="bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {logs.length} Records
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Log ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Date Sent</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-[rgb(var(--zx-text-muted))]">
                        <Loader2 size={40} className="animate-spin text-brand-teal-500" />
                        <span className="font-bold tracking-widest text-xs uppercase">Fetching Logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8">
                      <ErrorState
                        message="We couldn't load the email logs. Please try again."
                        onRetry={fetchLogs}
                      />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No email logs found</p>
                        <p className="text-sm mt-1">Outbound communication records will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => openLog(log.id)}
                      className="cursor-pointer hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                          #{log.id}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{log.name}</span>
                          <span className="text-xs font-semibold text-[rgb(var(--zx-text-muted))]">{log.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-[rgb(var(--zx-text))] truncate max-w-[250px] lg:max-w-md block">
                          {log.subject}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {log.status ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                             Delivered
                           </span>
                        ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-500/10 text-rose-500 border-rose-500/20">
                             Failed
                           </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--zx-text-muted))]">
                          <Clock size={14} className="text-[rgb(var(--zx-text-muted))]" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        {loadingLogId === log.id ? (
                          <Loader2 size={18} className="animate-spin text-brand-teal-500 inline-block" />
                        ) : (
                          <div className="p-2 rounded-xl inline-flex transition-all duration-200 text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 group-hover:bg-brand-teal-500/10 active:scale-95">
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
      {selectedLog && (
        <AppModal
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Email View"
          size="xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest flex items-center gap-1.5">
                <Hash size={12} /> Log ID: {selectedLog.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/25"
              >
                Close Window
              </button>
            </div>
          }
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
            {/* Email Header Area */}
            <div className="pb-6 border-b border-[rgb(var(--zx-border))]">
              <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--zx-text))] mb-6 leading-snug">
                {selectedLog.subject}
              </h2>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Sender/Recipient Info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-teal-500 to-brand-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                    {selectedLog.name ? selectedLog.name.charAt(0).toUpperCase() : <User size={20}/>}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[rgb(var(--zx-text))] text-sm sm:text-base">{selectedLog.name}</span>
                      <span className="text-[10px] font-bold text-brand-teal-500 bg-brand-teal-500/10 border border-brand-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedLog.role || "User"}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-[rgb(var(--zx-text-muted))] mt-0.5">
                      <span className="text-[rgb(var(--zx-text-muted))]/60">to</span> <span className="font-semibold text-[rgb(var(--zx-text))]">&lt;{selectedLog.email}&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-col sm:items-end gap-2 ml-16 sm:ml-0">
                  <span className="text-xs sm:text-sm font-medium text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5">
                    {formatDate(selectedLog.created_at)}
                  </span>
                  {selectedLog.status ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 w-fit">
                        <CheckCircle2 size={12} /> Delivered
                      </span>
                  ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-500/10 text-rose-500 border-rose-500/20 w-fit">
                        <XCircle size={12} /> Failed
                      </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Content Body */}
            <div className="p-6 bg-[rgb(var(--zx-surface-hover))]/50 border border-[rgb(var(--zx-border))] rounded-2xl min-h-[250px]">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none text-[rgb(var(--zx-text))] text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedLog.content }}
              />
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}