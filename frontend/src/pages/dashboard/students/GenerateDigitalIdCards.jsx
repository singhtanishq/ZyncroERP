import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Download, 
  Power, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Filter,
  Search,
  User,
  RefreshCw
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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} />
            Digital ID Cards
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Manage student identification cards. Activate new cards, set expiry dates, and download digital copies for printing.
          </p>
        </div>

        {/* FILTERS - SEGMENTED CONTROL */}
        <div className="bg-slate-100/80 p-1.5 rounded-xl flex items-center shadow-inner">
          {[
            { key: "all", label: "All Students" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                filter === opt.key
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        
        {/* TABLE HEADER */}
        <div
          className={`${gridLayout} px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm`}
        >
          <div className="text-left">SID</div>
          <div className="text-left">Student</div>
          <div className="text-left">Card Status</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="font-medium">Loading students...</span>
          </div>
        )}

        {/* LIST */}
        <div className="divide-y divide-slate-100">
          {!loading && filteredStudents.length === 0 && (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center bg-slate-50/30">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Filter size={24} className="text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-600">No students found</p>
              <p className="text-sm">Try changing the filter status.</p>
            </div>
          )}

          {!loading && filteredStudents.map((s) => (
            <div 
              key={s.student_id} 
              className={`${gridLayout} px-6 py-5 hover:bg-slate-50/80 transition-all duration-200 group border-l-[3px] border-l-transparent hover:border-l-indigo-500`}
            >
              {/* SID */}
              <div>
                 <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                    {s.sid}
                 </span>
              </div>
              
              {/* STUDENT (Name & Email Combined) */}
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 hidden md:flex shrink-0">
                    <User size={16} />
                 </div>
                 <div className="flex flex-col overflow-hidden">
                    <div className="font-bold text-slate-800 text-sm md:text-base truncate">{s.name}</div>
                    <div className="text-slate-500 text-sm font-medium truncate">{s.email}</div>
                 </div>
              </div>
              
              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  s.active 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${s.active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {s.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-2 pr-2">
                {/* ACTIVATE/GENERATE BUTTON */}
                <button
                  disabled={s.active}
                  onClick={() => openActivate(s.student_id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border ${
                    s.active
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                      : "bg-indigo-600 border-transparent text-white hover:bg-indigo-700 hover:shadow-indigo-200"
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
                <div className="w-px h-5 bg-slate-200 mx-1"></div>

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
                  className={`p-2 rounded-lg transition-all ${
                    s.active
                      ? "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                      : "text-slate-200 cursor-not-allowed"
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
                  className={`p-2 rounded-lg transition-all ${
                    s.active
                      ? "text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                      : "text-slate-200 cursor-not-allowed"
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
            className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50"
          >
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}