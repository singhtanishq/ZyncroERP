import { useEffect, useMemo, useState } from "react";
import EnrollmentDetailsDrawer from "./EnrollmentDetailsDrawer";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock3,
  CheckCircle2,
  GraduationCap,
  XCircle,
  Eye,
  Inbox,
  Loader2,
  Users,
  ShieldCheck,
  Plus,
  Save,
  UserCheck
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

export default function EnrollmentCenter() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    student_id: "",
    course_id: "",
    batch_id: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/enrollments");
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    api.get("/admin/students").then((res) => {
      setStudents(res.data || []);
    });

    api.get("/admin/courses").then((res) => {
      setCourses((res.data || []).filter((c) => c.status === "active"));
    });
  }, []);

  useEffect(() => {
    if (!form.course_id) {
      setBatches([]);
      setForm((prev) => ({ ...prev, batch_id: "" }));
      return;
    }

    api.get(`/admin/courses/${form.course_id}/batches`).then((res) => {
      setBatches((res.data || []).filter((b) => b.status === "active"));
    });
  }, [form.course_id]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.sid?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = {
    pending: rows.filter((x) => x.status === "pending").length,
    active: rows.filter((x) => x.status === "active").length,
    completed: rows.filter((x) => x.status === "completed").length,
    cancelled: rows.filter((x) => x.status === "cancelled").length,
  };

  const openEnrollment = async (id) => {
    try {
      const res = await api.get(`/admin/enrollments/${id}`);
      setSelected(res.data);
      setDrawerOpen(true);
    } catch (e) {
      console.error("Failed to load enrollment details", e);
    }
  };

  const createEnrollment = async () => {
    try {
      setSaving(true);
      await api.post("/admin/enrollments", form);

      setForm({ student_id: "", course_id: "", batch_id: "" });
      setShowForm(false);
      loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to create enrollment");
    } finally {
      setSaving(false);
    }
  };

  // Helper to get the currently selected student object for the UI
  const selectedStudent = useMemo(() => {
    if (!form.student_id) return null;
    return students.find((s) => String(s.student_id) === String(form.student_id));
  }, [form.student_id, students]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
              <Users size={14} strokeWidth={2.5} />
              Admissions Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
              Enrollment Center
            </h1>
            <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
              Review and manage student applications, verify academic documentation, and process enrollment payments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all active:scale-95 shadow-sm ${
              showForm
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))]"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20"
            }`}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel Form" : "Add Enrollment"}
          </button>
        </div>

        {/* ADD ENROLLMENT FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", overflow: "visible" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm relative z-10"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[rgb(var(--zx-text))] mb-6 pb-4 border-b border-[rgb(var(--zx-border))]">Create New Enrollment</h3>
                
                <div className="flex flex-col gap-6">
                  {/* STUDENT SELECTION SECTION */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                      Applicant Profile
                    </label>
                    
                    {selectedStudent ? (
                      // Selected Student Card UX
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between p-4 rounded-2xl border border-brand-teal-500/30 bg-brand-teal-500/5"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="bg-brand-teal-500/10 text-brand-teal-500 p-3 rounded-xl hidden sm:block border border-brand-teal-500/20">
                            <UserCheck size={24} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center text-[10px] font-bold text-brand-teal-500 bg-brand-teal-500/10 px-2 py-0.5 rounded border border-brand-teal-500/20 uppercase tracking-widest w-fit">
                              SID: {selectedStudent.sid || selectedStudent.student_id}
                            </span>
                            <span className="text-base font-bold text-[rgb(var(--zx-text))]">
                              NAME: {selectedStudent.name}
                            </span>
                            <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">
                              EMAIL: {selectedStudent.email}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setForm({ ...form, student_id: "" })}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] hover:text-rose-500 bg-[rgb(var(--zx-surface))] hover:bg-rose-500/10 border border-[rgb(var(--zx-border))] px-3 py-2 rounded-xl transition-colors"
                        >
                          <XCircle size={14} /> Change
                        </button>
                      </motion.div>
                    ) : (
                      // Default Select Dropdown
                      <select
                        value={form.student_id}
                        onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))]"
                      >
                        <option value="">Select Student</option>
                        {students.map((s) => (
                          <option key={s.student_id} value={s.student_id}>
                            {s.name} • {s.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* COURSE AND BATCH SELECTION SECTION */}
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                        Course Target
                      </label>
                      <select
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))]"
                      >
                        <option value="">Select Course</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                        Cohort Batch
                      </label>
                      <select
                        value={form.batch_id}
                        onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                        disabled={!form.course_id}
                        className="w-full px-4 py-3.5 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Batch</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[rgb(var(--zx-border))] flex justify-end">
                  <button
                    onClick={createEnrollment}
                    disabled={saving || !form.student_id || !form.course_id || !form.batch_id}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Processing..." : "Confirm & Save Enrollment"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          <Card
            title="Pending Review"
            value={stats.pending}
            icon={<Clock3 size={20} strokeWidth={2.5} />}
            lightClass="bg-amber-500/10 text-amber-500"
          />
          <Card
            title="Active Students"
            value={stats.active}
            icon={<CheckCircle2 size={20} strokeWidth={2.5} />}
            lightClass="bg-emerald-500/10 text-emerald-500"
          />
          <Card
            title="Completed"
            value={stats.completed}
            icon={<GraduationCap size={20} strokeWidth={2.5} />}
            lightClass="bg-blue-500/10 text-blue-500"
          />
          <Card
            title="Cancelled"
            value={stats.cancelled}
            icon={<XCircle size={20} strokeWidth={2.5} />}
            lightClass="bg-rose-500/10 text-rose-500"
          />
        </motion.div>

        {/* SIMPLIFIED SEARCH BAR */}
        <motion.div variants={itemVariants} className="relative group w-full z-20">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or SID..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))]/60 shadow-sm"
          />
        </motion.div>

        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col min-h-[500px] relative z-10">
          <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-[rgb(var(--zx-text))] text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-teal-500" />
              Enrollment Ledger
            </h3>
            {filtered.length > 0 && !loading && (
              <span className="bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                {filtered.length} Records
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">SID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Profile</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-[rgb(var(--zx-text-muted))]">
                        <Loader2 size={40} className="animate-spin text-brand-teal-500" />
                        <span className="font-bold tracking-widest text-sm">Fetching Enrollments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No records found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                          {row.sid || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{row.name}</span>
                          <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">{row.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-[rgb(var(--zx-text))] text-sm">{row.course_name}</span>
                          <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">{row.batch_name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEnrollment(row.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-teal-500 bg-brand-teal-500/10 border border-brand-teal-500/20 hover:bg-brand-teal-500/20 transition-all shadow-sm active:scale-95"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ENROLLMENT MODAL */}
      <EnrollmentDetailsDrawer
        open={drawerOpen}
        enrollment={selected}
        onClose={() => setDrawerOpen(false)}
        refresh={loadData}
      />
    </div>
  );
}

// ================= REUSABLE UI COMPONENTS =================

function Card({ title, value, icon, lightClass }) {
  return (
    <div className="group relative p-6 rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-xl hover:shadow-brand-teal-500/5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${lightClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  if (s === "active" || s === "completed" || s === "paid" || s === "success") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        {status}
      </span>
    );
  }

  if (s === "pending" || s === "partial") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-amber-500/10 text-amber-600 border-amber-500/20">
        {status}
      </span>
    );
  }

  if (s === "cancelled" || s === "failed" || s === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-500/10 text-rose-600 border-rose-500/20">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]">
      {status || "N/A"}
    </span>
  );
}