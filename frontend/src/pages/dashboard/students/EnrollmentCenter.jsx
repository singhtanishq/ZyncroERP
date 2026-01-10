import { useEffect, useMemo, useState } from "react";
import EnrollmentDetailsDrawer from "./EnrollmentDetailsDrawer";
import api from "../../../lib/api/apiClient";
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              Enrollment Center
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Review and manage student applications, verify academic documentation, and process enrollment payments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
              showForm
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
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
              className="bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Create New Enrollment</h3>
                
                <div className="flex flex-col gap-6">
                  {/* STUDENT SELECTION SECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Applicant Profile
                    </label>
                    
                    {selectedStudent ? (
                      // Selected Student Card UX
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between p-4 rounded-xl border border-indigo-200 bg-indigo-50/40"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full hidden sm:block">
                            <UserCheck size={24} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center text-[11px] font-bold text-indigo-700 bg-indigo-100/50 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-widest w-fit">
                              SID: {selectedStudent.sid || selectedStudent.student_id}
                            </span>
                            <span className="text-base font-bold text-slate-800">
                              NAME: {selectedStudent.name}
                            </span>
                            <span className="text-sm font-medium text-slate-600">
                              EMAIL: {selectedStudent.email}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setForm({ ...form, student_id: "" })}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors"
                        >
                          <XCircle size={14} /> Change
                        </button>
                      </motion.div>
                    ) : (
                      // Default Select Dropdown
                      <select
                        value={form.student_id}
                        onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Course Target
                      </label>
                      <select
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Cohort Batch
                      </label>
                      <select
                        value={form.batch_id}
                        onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                        disabled={!form.course_id}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={createEnrollment}
                    disabled={saving || !form.student_id || !form.course_id || !form.batch_id}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Pending Review"
            value={stats.pending}
            icon={<Clock3 size={24} strokeWidth={2.5} />}
            colorClass="from-amber-500 to-orange-400"
            lightClass="bg-amber-50 text-amber-600"
          />
          <Card
            title="Active Students"
            value={stats.active}
            icon={<CheckCircle2 size={24} strokeWidth={2.5} />}
            colorClass="from-emerald-500 to-teal-400"
            lightClass="bg-emerald-50 text-emerald-600"
          />
          <Card
            title="Completed"
            value={stats.completed}
            icon={<GraduationCap size={24} strokeWidth={2.5} />}
            colorClass="from-blue-600 to-indigo-500"
            lightClass="bg-blue-50 text-blue-600"
          />
          <Card
            title="Cancelled"
            value={stats.cancelled}
            icon={<XCircle size={24} strokeWidth={2.5} />}
            colorClass="from-rose-500 to-pink-500"
            lightClass="bg-rose-50 text-rose-600"
          />
        </motion.div>

        {/* SEARCH BAR (Sticky) */}
        <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-30 transition-all">
          <div className="relative group w-full">
            <Search
              size={20}
              className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or SID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </motion.div>

        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" />
              Enrollment Ledger
            </h3>
            {filtered.length > 0 && !loading && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {filtered.length} Records
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Profile</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <span className="font-bold tracking-widest text-sm">Fetching Enrollments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No records found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-mono text-slate-600 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          {row.sid || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 text-base">{row.name}</span>
                          <span className="text-sm font-medium text-slate-500">{row.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 text-sm">{row.course_name}</span>
                          <span className="text-sm font-medium text-slate-500">{row.batch_name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openEnrollment(row.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm active:scale-95"
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

      {/* ENROLLMENT DRAWER */}
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

function Card({ title, value, icon, colorClass, lightClass }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${colorClass} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
      <div className="flex flex-col gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${lightClass} flex items-center justify-center shadow-sm shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight truncate">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  if (s === "active" || s === "completed" || s === "paid" || s === "success") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200">
        {status}
      </span>
    );
  }

  if (s === "pending" || s === "partial") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200">
        {status}
      </span>
    );
  }

  if (s === "cancelled" || s === "failed" || s === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-200">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-slate-50 text-slate-700 border-slate-200">
      {status || "N/A"}
    </span>
  );
}