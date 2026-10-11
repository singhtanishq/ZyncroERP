import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Loader2,
  Inbox,
  BookOpen,
  Layers,
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileBox
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export default function UploadPaymentProof() {
  const { toast } = useToast();
  const location = useLocation();
  const highlightedEnrollmentId = location.state?.enrollmentId ?? null;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/payment-proofs");
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to and highlight the enrollment card the user navigated
  // here for (MakePayment passes { state: { enrollmentId } }).
  useEffect(() => {
    if (!highlightedEnrollmentId || loading || rows.length === 0) return;

    const el = document.getElementById(
      `payment-proof-card-${highlightedEnrollmentId}`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedEnrollmentId, loading, rows.length]);

  const handleFileSelect = (enrollmentId, file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      toast(
        "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG.",
        "error"
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("File is too large. Maximum allowed size is 10MB.", "error");
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [enrollmentId]: file,
    }));
  };

  const submitUpload = async (enrollmentId) => {
    const file = selectedFiles[enrollmentId];

    if (!file) {
      toast("Please select a file first.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingId(enrollmentId);

      await api.post(
        `/student/payment-proofs/${enrollmentId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSelectedFiles((prev) => {
        const updated = { ...prev };
        delete updated[enrollmentId];
        return updated;
      });

      toast("Payment proof uploaded successfully.", "success");

      await loadData();
    } catch (e) {
      toast(e?.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusConfig = (status) => {
    const s = String(status || "not_uploaded").toLowerCase();
    if (s === "verified") {
      return {
        badge: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
        icon: <CheckCircle2 size={16} />,
        label: "Verified",
        glow: "from-emerald-500 to-teal-500"
      };
    }
    if (s === "pending") {
      return {
        badge: "bg-amber-50/80 text-amber-700 border-amber-200/60",
        icon: <Clock size={16} />,
        label: "Verification Pending",
        glow: "from-amber-500 to-orange-500"
      };
    }
    if (s === "rejected") {
      return {
        badge: "bg-rose-50/80 text-rose-700 border-rose-200/60",
        icon: <XCircle size={16} />,
        label: "Rejected",
        glow: "from-rose-500 to-pink-500"
      };
    }
    return {
      badge: "bg-slate-50/80 text-slate-600 border-slate-200/60",
      icon: <FileBox size={16} />,
      label: "Not Uploaded",
      glow: "from-indigo-500 to-purple-500"
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <UploadCloud size={24} />
            </div>
            Upload Payment Proof
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            Submit your transaction receipts or bank transfer screenshots for administrative verification.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-proofs"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching requirements...</p>
              </motion.div>
            ) : rows.length === 0 ? (
              <motion.div 
                key="empty-proofs"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                {/* EMPTY STATE */}
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <Inbox size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  No Action Required
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  You do not have any enrollments requiring manual payment verification at this time.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="proofs-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {/* UPLOAD GRID */}
                {rows.map((row, idx) => {
                  const document = row.document;
                  const status = document?.verification_status || "not_uploaded";
                  const canUpload = !document || status === "rejected";
                  const selectedFile = selectedFiles[row.id];
                  const isUploading = uploadingId === row.id;
                  
                  const config = getStatusConfig(status);

                  return (
                    <motion.div
                      key={row.id}
                      id={`payment-proof-card-${row.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group hover:bg-white/90 transition-all duration-300 flex flex-col ${
                        highlightedEnrollmentId === row.id
                          ? "ring-2 ring-indigo-500"
                          : ""
                      }`}
                    >
                      {/* Decorative Background Glows */}
                      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none bg-gradient-to-br ${config.glow}`}></div>

                      <div className="relative z-10 flex flex-col h-full gap-6">
                        
                        {/* Top Row: Course & Batch */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shrink-0 mt-1 shadow-sm">
                              <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.badge}`}>
                                  {config.icon} {config.label}
                                </span>
                              </div>
                              <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight leading-tight break-words group-hover:text-indigo-900 transition-colors">
                                {row.course_name || "Untitled Course"}
                              </h3>
                              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shrink-0">
                                <Layers size={14} className="text-slate-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase break-words">
                                  {row.batch_name || "Unassigned Batch"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rejection Remarks */}
                        {document?.remarks && status === "rejected" && (
                          <div className="bg-rose-50/80 border border-rose-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                            <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-rose-800">Submission Rejected</h4>
                              <p className="text-sm font-medium text-rose-700 mt-1 leading-relaxed break-words">
                                {document.remarks}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* UPLOAD ZONE */}
                        <div className="mt-auto pt-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
                             <UploadCloud size={14} className="text-indigo-500" /> Evidence File
                          </label>
                          
                          <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                            !canUpload 
                              ? "border-slate-200/60 bg-slate-50/50 cursor-not-allowed opacity-70" 
                              : selectedFile 
                                ? "border-emerald-400 bg-emerald-50/50 group" 
                                : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 bg-white/60 group cursor-pointer shadow-sm hover:shadow"
                          }`}>
                            <label className={`flex flex-col items-center gap-3 w-full h-full relative ${canUpload ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                              <div className={`p-3 rounded-full transition-all duration-300 shadow-sm ${
                                !canUpload 
                                  ? "bg-white border border-slate-200 text-slate-400" 
                                  : selectedFile 
                                    ? "bg-emerald-100 text-emerald-600 scale-110" 
                                    : "bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200"
                              }`}>
                                {isUploading ? <Loader2 size={24} className="animate-spin" /> : selectedFile ? <FileCheck size={24} /> : <UploadCloud size={24} />}
                              </div>
                              <div className="space-y-1 w-full px-4">
                                <p className={`text-sm font-bold transition-colors truncate ${
                                  !canUpload 
                                    ? "text-slate-500" 
                                    : selectedFile 
                                      ? "text-emerald-800" 
                                      : "text-slate-700 group-hover:text-indigo-700"
                                }`}>
                                  {isUploading ? "Uploading..." : selectedFile ? selectedFile.name : !canUpload ? "Upload Locked" : "Click to attach document"}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {!canUpload ? "Awaiting administrative action" : selectedFile ? "File selected successfully" : "PDF, JPG, PNG (Max 10MB)"}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                hidden
                                disabled={!canUpload || isUploading}
                                onChange={(e) => {
                                  handleFileSelect(row.id, e.target.files?.[0]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <div className="pt-2 border-t border-slate-100/60">
                          {canUpload ? (
                            <button
                              disabled={!selectedFile || isUploading}
                              onClick={() => submitUpload(row.id)}
                              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                                !selectedFile || isUploading
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.98]"
                              }`}
                            >
                              {isUploading ? (
                                <><Loader2 size={18} className="animate-spin" /> Transmitting...</>
                              ) : (
                                <><Upload size={18} /> Submit Verification Request</>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-start gap-2 text-xs font-bold text-amber-600 bg-amber-50/80 p-3 rounded-xl border border-amber-100/60 shadow-sm">
                              <AlertCircle size={16} className="shrink-0" />
                              <p>File modification is currently locked. Re-upload is only permitted if the current submission is rejected.</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}