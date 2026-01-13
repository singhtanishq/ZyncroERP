import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Filter,
  User
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import PdfPreviewModal from "../../../components/PdfPreviewModal";

export default function GenerateDigitalIdCards() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all"); // all | active | inactive

  const [activateOpen, setActivateOpen] = useState(false);
  const [activateTarget, setActivateTarget] = useState(null);

  const [toast, setToast] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/student-id-cards");

      let data = res.data;

      if (typeof data === "string") {
        data = JSON.parse(data.replace(/^\uFEFF/, "").trim());
      }

      setStudents(Array.isArray(data) ? data : []);

    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (filter === "active") {
      return students.filter((s) => s.active);
    }
    if (filter === "inactive") {
      return students.filter((s) => !s.active);
    }
    return students;
  }, [students, filter]);

  const openActivate = (studentId) => {
    setActivateTarget(studentId);
    setActivateOpen(true);
  };

  const confirmActivate = async () => {
    try {
      await api.post(
        `/admin/student-id-cards/${activateTarget}/activate`
      );
      fetchStudents();
      showToast("Student ID Card generated successfully");
    } catch (e) {
      console.error(e);
      showToast("Failed to activate ID card");
    } finally {
      setActivateOpen(false);
      setActivateTarget(null);
    }
  };

  // Shared grid layout to ensure perfect alignment between header and body rows
  const gridLayout = "grid grid-cols-[100px_minmax(0,1fr)_140px_230px] gap-4 items-center";

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <CreditCard size={14} strokeWidth={2.5} />
            Identification Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Digital ID Cards
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Manage student identification cards. Activate new cards, set expiry dates, and download digital copies for printing.
          </p>
        </div>

        {/* FILTERS - SEGMENTED CONTROL */}
        <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] p-1.5 rounded-2xl flex items-center shadow-inner">
          {[
            { key: "all", label: "All Students" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                filter === opt.key
                  ? "bg-brand-teal-500 text-white shadow-md shadow-brand-teal-500/20"
                  : "text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        
        {/* TABLE HEADER */}
        <div
          className={`${gridLayout} px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider`}
        >
          <div className="text-left">SID</div>
          <div className="text-left">Student</div>
          <div className="text-left">Card Status</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading students...</span>
          </div>
        )}

        {/* LIST */}
        <div className="divide-y divide-[rgb(var(--zx-border))]">
          {!loading && filteredStudents.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-[rgb(var(--zx-surface))]">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-2xl flex items-center justify-center mb-4 text-[rgb(var(--zx-text-muted))] shadow-sm">
                <Filter size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No students found</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">Try changing the filter status.</p>
            </div>
          )}

          {!loading && filteredStudents.map((s) => (
            <div 
              key={s.student_id} 
              className={`${gridLayout} px-6 py-4 hover:bg-[rgb(var(--zx-surface-hover))] transition-all duration-200 group border-l-[3px] border-l-transparent hover:border-l-brand-teal-500`}
            >
              {/* SID */}
              <div>
                 <span className="font-mono text-xs font-semibold text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block">
                    {s.sid}
                 </span>
              </div>
              
              {/* STUDENT (Name & Email Combined) */}
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="p-2 rounded-xl bg-brand-teal-500/10 text-brand-teal-500 hidden md:flex shrink-0 border border-brand-teal-500/20">
                    <User size={16} />
                 </div>
                 <div className="flex flex-col overflow-hidden">
                    <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base truncate">{s.name}</div>
                    <div className="text-[rgb(var(--zx-text-muted))] text-sm font-medium truncate">{s.email}</div>
                 </div>
              </div>
              
              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  s.active 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${s.active ? "bg-emerald-500 animate-pulse" : "bg-[rgb(var(--zx-text-muted))]"}`} />
                  {s.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-2 pr-2">
                {/* ACTIVATE/GENERATE BUTTON */}
                <button
                  disabled={s.active}
                  onClick={() => openActivate(s.student_id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                    s.active
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 cursor-default"
                      : "bg-brand-teal-500 border-transparent text-white hover:bg-brand-teal-600 hover:shadow-brand-teal-500/20"
                  }`}
                >
                  {s.active ? (
                    <>
                      <CheckCircle2 size={14} />
                      Activated
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Activate
                    </>
                  )}
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-5 bg-[rgb(var(--zx-border))] mx-1"></div>

                {/* VIEW */}
                <button
                  disabled={!s.active}
                  onClick={() => {
                    setPreviewUrl(
                      `${import.meta.env.VITE_API_BASE_URL}/id-card/${s.public_token}/view`
                    );
                    setPreviewOpen(true);
                  }}
                  title="View ID Card"
                  className={`p-2 rounded-xl transition-all ${
                    s.active
                      ? "text-[rgb(var(--zx-text-muted))] hover:bg-brand-teal-500/10 hover:text-brand-teal-500"
                      : "text-[rgb(var(--zx-border))] cursor-not-allowed"
                  }`}
                >
                  <Eye size={18} />
                </button>

                {/* PRINT */}
                <button
                  disabled={!s.active}
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_BASE_URL}/id-card/${s.public_token}/download`,
                      "_blank"
                    )
                  }
                  title="Download ID Card"
                  className={`p-2 rounded-xl transition-all ${
                    s.active
                      ? "text-[rgb(var(--zx-text-muted))] hover:bg-brand-blue-500/10 hover:text-brand-blue-500"
                      : "text-[rgb(var(--zx-border))] cursor-not-allowed"
                  }`}
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVATE MODAL */}
      <ConfirmModal
        open={activateOpen}
        onClose={() => setActivateOpen(false)}
        onConfirm={confirmActivate}
        title="Generate Student ID Card"
        message="This will generate or regenerate the student's Digital ID Card. Any previous card will automatically be replaced with the latest version."
        confirmText="Generate ID Card"
      />

      <PdfPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        url={previewUrl}
        title="Student ID Card"
        iframeTitle="Student ID Card Preview"
        orientation="portrait"
      />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 bg-[rgb(var(--zx-text))] text-[rgb(var(--zx-surface))] px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 flex items-center gap-3 border border-[rgb(var(--zx-border))]"
          >
            <div className="bg-emerald-500 rounded-full p-1 text-white">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
            <span className="text-[14px] font-bold tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}