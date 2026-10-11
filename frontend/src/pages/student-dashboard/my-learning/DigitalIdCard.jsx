import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import PdfPreviewModal from "../../../components/PdfPreviewModal";
import {
  IdCard,
  User,
  Calendar,
  Cake,
  Hash,
  DownloadCloud,
  Eye,
  AlertCircle,
  Loader2
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

export default function DigitalIdCard() {
  const [student, setStudent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/id-card");
      setStudent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasCard = student?.id_card;

  // Helper to generate initials for the avatar
  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <IdCard size={24} />
            </div>
            Digital ID Card
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-3 text-m max-w-2xl leading-relaxed">
            View, verify, and download your official student identity card for campus access and examinations.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-id"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Loading profile identity...</p>
              </motion.div>
            ) : !student ? (
               <motion.div 
                key="error-id"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                {/* ERROR / NO DATA STATE */}
                <div className="bg-[rgb(var(--zx-surface-hover))] p-6 rounded-full mb-6">
                  <AlertCircle size={48} className="text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-[rgb(var(--zx-text))] tracking-tight">
                  Profile Not Found
                </h3>
                <p className="mt-2 text-[rgb(var(--zx-text-muted))] font-medium text-center max-w-md">
                  We couldn't retrieve your student profile at this time. Please contact administration.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="id-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 relative overflow-hidden group max-w-4xl mx-auto"
              >
                {/* CARD LOADED STATE */}
                
                {/* Decorative Background Glows */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-5 pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full opacity-5 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10">
                  
                  {/* Left Column: Avatar & Core Identity */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/3 border-b md:border-b-0 md:border-r border-[rgb(var(--zx-border))] pb-8 md:pb-0 md:pr-8 shrink-0">
                    <div className="w-32 h-32 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100/50 mb-6 relative overflow-hidden">
                       <span className="text-4xl font-black tracking-tight">{getInitials(student.name)}</span>
                       <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>
                    </div>
                    
                    <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-1.5">
                      <User size={14} className="text-indigo-400" /> Student Name
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight leading-tight break-words w-full">
                      {student.name}
                    </h2>
                    
                    <div className="inline-flex items-center justify-center md:justify-start gap-3 mt-5 px-4 py-3 rounded-xl bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] w-full shadow-sm">
                      <Hash size={18} className="text-[rgb(var(--zx-text-muted))] shrink-0" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest leading-none mb-0.5">Student ID</span>
                        <span className="text-sm font-black text-[rgb(var(--zx-text))] tracking-wide truncate w-full">{student.sid}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Academic Info & Actions */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    
                    {/* Personal Details */}
                    <div className="flex flex-col bg-[rgb(var(--zx-surface-hover))] rounded-2xl border border-[rgb(var(--zx-border))] mb-8 overflow-hidden shadow-sm">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors border-b border-[rgb(var(--zx-border))]">
                        <div className="flex items-center gap-2">
                          <Cake size={16} className="text-indigo-400" />
                          <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">
                            Date of Birth
                          </span>
                        </div>

                        <div className="text-sm font-bold text-[rgb(var(--zx-text))]">
                          {student.dob || "-"}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-indigo-400" />
                          <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">
                            Admission Date
                          </span>
                        </div>

                        <div className="text-sm font-bold text-[rgb(var(--zx-text))]">
                          {student.admission_date || "-"}
                        </div>
                      </div>

                    </div>

                    {/* Actions Area */}
                    <div className="mt-auto">
                      {!hasCard ? (
                        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3 shadow-sm">
                          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-amber-800">ID Card Not Activated</h4>
                            <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">Your digital ID card has not been generated by the administration yet. Please check back later.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => setPreviewOpen(true)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow text-sm"
                          >
                            <Eye size={18} />
                            View ID Card
                          </button>

                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/api/id-card/${student.public_token}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] hover:border-indigo-300 hover:text-indigo-600 shadow-sm text-sm"
                          >
                            <DownloadCloud size={18} />
                            Download PDF
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* PDF PREVIEW MODAL */}
      {student && student.public_token && (
        <div className="relative z-[100]">
          <PdfPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            url={`${import.meta.env.VITE_API_BASE_URL}/api/id-card/${student.public_token}/view`}
            title="Digital ID Card"
            iframeTitle="Student ID Card Preview"
            orientation="portrait"
          />
        </div>
      )}
      
    </div>
  );
}