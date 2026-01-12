import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Eye,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  User,
  MoreHorizontal,
  CheckCircle2,
  X,
  Calendar,
  Mail,
  Smartphone,
  Globe,
  Hash,
  Save,
  AlertTriangle
} from "lucide-react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { useToast } from "../../../components/common/ToastProvider";


/* ========================================================================= */
/* =============================== HELPERS ================================= */
/* ========================================================================= */

function formatDate(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

// Formats dates specifically for the HTML <input type="date">
const formatForInput = (date) => {
  if (!date) return "";
  return date.split("T")[0]; // converts to YYYY-MM-DD
};


/* ========================================================================= */
/* ============================= VIEW MODAL ================================ */
/* ========================================================================= */

function ViewStudentModal({ open, onClose, student }) {
  if (!open || !student || typeof student !== "object") return null;

  const user = student.user ?? {};

  const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-3 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] px-4 py-3 rounded-xl">
        {Icon && <Icon size={16} className="text-[rgb(var(--zx-text-muted))] shrink-0" />}
        <span className="text-sm font-semibold text-[rgb(var(--zx-text))] break-all">{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <AppModal open={open} onClose={onClose} title="Student Details" size="md"
      footer={
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95">
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Student ID" value={student.sid} icon={Hash} />
          <DetailRow label="Full Name" value={user.name} icon={User} />
        </div>
        <DetailRow label="Email Address" value={user.email} icon={Mail} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Mobile Number" value={user.mobile || "-"} icon={Smartphone} />
          <DetailRow label="Date of Birth" value={formatDate(user.dob)} icon={Calendar} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Country" value={user.country || "-"} icon={Globe} />
          <DetailRow label="Admission Date" value={formatDate(student.admission_date)} icon={Calendar} />
        </div>
      </div>
    </AppModal>
  );
}

/* ============================= EDIT MODAL ================================ */
/* ========================================================================= */

function ModalInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))]"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function EditStudentModal({ open, onClose, student, onUpdated }) {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!student || !student.user) return;
    setForm({
      name: student.user.name ?? "",
      dob: formatForInput(student.user.dob),
      country: student.user.country ?? "",
      mobile: student.user.mobile ?? "",
      admission_date: formatForInput(student.admission_date),
    });
  }, [student]);

  const update = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/students/${student.student_id}`, {
        ...form,
        dob: form.dob || null,
        admission_date: form.admission_date || null,
      });
      toast("Student updated successfully.", "success");
      onUpdated();
      onClose();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to update student. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !form) return null;

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <AppModal open={open} onClose={onClose} title="Update Student" size="md"
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
            Cancel
          </button>
          <button
            onClick={update}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Full Name" value={form.name} onChange={v => updateField("name", v)} />
          <ModalInput label="Mobile Number" value={form.mobile} onChange={v => updateField("mobile", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Date of Birth" type="date" value={form.dob} onChange={v => updateField("dob", v)} />
          <ModalInput label="Country" value={form.country} onChange={v => updateField("country", v)} />
        </div>
        <ModalInput label="Admission Date" type="date" value={form.admission_date} onChange={v => updateField("admission_date", v)} />
      </div>
    </AppModal>
  );
}

/* ================= MAIN COMPONENT (ManageStudents) ======================= */
/* ========================================================================= */

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmText, setConfirmText] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");

  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const parseResponse = (data) => {
    if (typeof data === "string") {
      return JSON.parse(data.replace(/^\uFEFF/, "").trim());
    }
    return data;
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      const data = parseResponse(res.data);
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const openView = async (studentId) => {
    try {
      const res = await api.get(`/admin/students/${studentId}`);
      setViewStudent(parseResponse(res.data));
      setViewOpen(true);
    } catch (e) {
      console.error(e);
      showToast("Failed to load student");
    }
  };

  const openEdit = async (studentId) => {
    try {
      const res = await api.get(`/admin/students/${studentId}`);
      setEditStudent(parseResponse(res.data));
      setEditOpen(true);
    } catch (e) {
      console.error(e);
      showToast("Failed to load student for edit");
    }
  };

  const onUpdated = () => {
    fetchStudents();
    setEditOpen(false);
    showToast("Student details updated successfully");
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/students/${deleteTarget}`);
      fetchStudents();
      showToast("Student removed successfully");
    } catch (e) {
      console.error(e);
      showToast("Failed to remove student");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const confirmResetLogin = (userId) => {
    setConfirmTitle("Reset Login Credentials");
    setConfirmText(
      "Are you sure you want to reset credentials? New login details will be emailed to the student."
    );
    setConfirmAction(() => async () => {
      try {
        await api.post(`/admin/students/${userId}/generate-login`);
        fetchStudents();
        showToast("Credentials reset and emailed successfully");
      } catch (e) {
        console.error(e);
        showToast("Failed to reset credentials");
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s?.name?.toLowerCase().includes(q) ||
        s?.email?.toLowerCase().includes(q) ||
        String(s?.sid || "").toLowerCase().includes(q) ||
        String(s?.mobile || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const gridLayout = "grid grid-cols-[100px_2fr_2.5fr_1.5fr_1.5fr_40px] gap-4 items-center";

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <User size={14} strokeWidth={2.5} />
            Student Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Student Directory
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Manage student enrollments, profiles, and access credentials.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, or SID..."
            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-sm focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 font-medium text-[rgb(var(--zx-text))]"
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] overflow-hidden shadow-sm relative z-10">
        
        {/* TABLE HEADERS */}
        <div className={`${gridLayout} px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider`}>
          <div>SID</div>
          <div>Name</div>
          <div>Email Address</div>
          <div>Mobile Number</div>
          <div>Admission Date</div>
          <div className="text-center"><MoreHorizontal size={16}/></div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading students...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredStudents.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-[rgb(var(--zx-surface))]">
            <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-2xl flex items-center justify-center mb-4 text-[rgb(var(--zx-text-muted))] shadow-sm">
                <User size={24} />
            </div>
            <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No students found</p>
            <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">Adjust your search query to find students.</p>
          </div>
        )}

        {/* LIST */}
        <div className="divide-y divide-[rgb(var(--zx-border))]">
          {!loading && filteredStudents.map((s) => {
            const expanded = expandedId === s.student_id;

            return (
              <div key={s.student_id} className="group transition-colors bg-[rgb(var(--zx-surface))]">
                {/* ROW */}
                <div
                  onClick={() => toggleExpand(s.student_id)}
                  className={`${gridLayout} px-6 py-4 cursor-pointer transition-all duration-200 border-l-[3px] ${
                    expanded 
                    ? "bg-brand-teal-500/5 border-l-brand-teal-500" 
                    : "hover:bg-[rgb(var(--zx-surface-hover))] border-l-transparent"
                  }`}
                >
                  <div className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block w-fit">
                    {s.sid}
                  </div>
                  
                  <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{s.name}</div>
                  
                  <div className="text-sm text-[rgb(var(--zx-text-muted))] font-medium truncate pr-4">{s.email}</div>

                  <div className="text-sm text-[rgb(var(--zx-text))] font-medium truncate pr-4">
                    {s.mobile ? s.mobile : <span className="text-[rgb(var(--zx-text-muted))] italic">-</span>}
                  </div>
                  
                  <div className="text-sm font-medium text-[rgb(var(--zx-text))]">
                    {s.admission_date ? (
                      formatDate(s.admission_date)
                    ) : (
                      <span className="text-[rgb(var(--zx-text-muted))] italic">-</span>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <div className={`p-1.5 rounded-full transition-all duration-300 ${expanded ? 'bg-brand-teal-500/10 text-brand-teal-500 rotate-180' : 'text-[rgb(var(--zx-text-muted))] group-hover:bg-[rgb(var(--zx-surface-hover))] group-hover:text-[rgb(var(--zx-text))]'}`}>
                       <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* EXPANDED ACTION DRAWER */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] shadow-inner"
                    >
                      <div className="px-6 py-4 flex flex-wrap gap-3 items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-bold text-[rgb(var(--zx-text-muted))] mr-auto uppercase tracking-wider flex items-center gap-2">
                          <User size={14} /> Student Actions:
                        </span>

                        <button
                          onClick={() => openView(s.student_id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-sm font-semibold hover:border-brand-teal-500/40 hover:text-brand-teal-500 hover:shadow-md transition-all"
                        >
                          <Eye size={16} />
                          View Details
                        </button>

                        <button
                          onClick={() => openEdit(s.student_id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-sm font-semibold hover:border-brand-teal-500/40 hover:text-brand-teal-500 hover:shadow-md transition-all"
                        >
                          <Pencil size={16} />
                          Edit Profile
                        </button>

                        <button
                          onClick={() => confirmResetLogin(s.user_id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-sm font-semibold hover:border-brand-teal-500/40 hover:text-brand-teal-500 hover:shadow-md transition-all"
                        >
                          <KeyRound size={16} />
                          Reset Credentials
                        </button>

                        <div className="w-px h-6 bg-[rgb(var(--zx-border))] mx-1"></div>

                        <button
                          onClick={() => {
                            setDeleteTarget(s.student_id);
                            setDeleteOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/20 text-rose-500 shadow-sm text-sm font-semibold hover:bg-rose-500/10 hover:border-rose-500/30 hover:shadow-md transition-all"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS RENDERED HERE */}
      <ViewStudentModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        student={viewStudent}
      />

      <EditStudentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={editStudent}
        onUpdated={onUpdated}
      />

      {/* Replaced ConfirmModal with AppModal for proper alignment and background blurring */}
      <AppModal 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        title="Remove Student" 
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteOpen(false)} className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-sm transition-all active:scale-95"
            >
              Yes, Remove
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2 space-y-3">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <AlertTriangle size={24} />
          </div>
          <p className="text-[rgb(var(--zx-text))] text-sm leading-relaxed font-medium">
            This will permanently delete the student and their login access. This action cannot be undone.
          </p>
        </div>
      </AppModal>

      <AppModal 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        title={confirmTitle} 
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 shadow-sm transition-all active:scale-95"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2 space-y-3">
          <div className="w-12 h-12 bg-brand-teal-500/10 text-brand-teal-500 rounded-2xl flex items-center justify-center border border-brand-teal-500/20">
            <KeyRound size={24} />
          </div>
          <p className="text-[rgb(var(--zx-text))] text-sm leading-relaxed font-medium">
            {confirmText}
          </p>
        </div>
      </AppModal>

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