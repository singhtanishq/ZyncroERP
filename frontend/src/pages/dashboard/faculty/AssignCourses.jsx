import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  User,
  BookOpen,
  Layers3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Loader2,
  X,
  XCircle,
  ShieldCheck,
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

export default function AssignCourses() {
  // Global Data State
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Dashboard View State
  const [globalFacultyId, setGlobalFacultyId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    faculty_id: "",
    course_id: "",
    batch_id: "",
  });
  const [batches, setBatches] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Modal & Toast State
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3000);
  };

  // 1. Initial Load (Faculties & Courses)
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
      setForm(prev => ({
          ...prev,
          course_id: "",
          batch_id: "",
      }));

      setBatches([]);

  }, [form.faculty_id]);

  async function loadInitialData() {
    try {
      setLoadingInitial(true);
      const [facultyRes, courseRes] = await Promise.all([
        api.get("/faculty-assignments/faculties"),
        api.get("/faculty-assignments/courses"),
      ]);
      setFaculties(facultyRes.data || []);
      setCourses(courseRes.data || []);
    } catch {
      showToast("Failed to load initial data", "error");
    } finally {
      setLoadingInitial(false);
    }
  }

  // 2. Load Table Assignments (Triggered by Global Filter)
  useEffect(() => {
    if (!globalFacultyId) {
      setAssignments([]);
      return;
    }
    loadAssignments(globalFacultyId);
  }, [globalFacultyId]);

  async function loadAssignments(id) {
    try {
      setLoadingAssignments(true);
      const res = await api.get(`/faculty-assignments/${id}`);
      setAssignments(res.data || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }

  // 3. Load Form Batches (Triggered by Form Course Selection)
  useEffect(() => {
      if (!form.course_id || !form.faculty_id) {
          setBatches([]);
          setForm(prev => ({
              ...prev,
              batch_id: "",
          }));
          return;
      }

      loadBatches(
          form.course_id,
          form.faculty_id
      );

  }, [
      form.course_id,
      form.faculty_id,
  ]);

  async function loadBatches(
      courseId,
      facultyId
  ) {
      try {

          const res = await api.get(
              `/faculty-assignments/courses/${courseId}/batches`,
              {
                  params: {
                      faculty_id: facultyId,
                  },
              }
          );

          setBatches(res.data || []);

      } catch {

          setBatches([]);

      }
  }

  // 4. API Actions
  async function assignCourse() {
    try {
      setAssigning(true);
      const res = await api.post("/faculty-assignments", {
        faculty_id: form.faculty_id,
        course_id: form.course_id,
        batch_id: form.batch_id,
      });

      showToast(res.data?.message || "Assigned successfully");

      // Reset form but keep the faculty selected
      setForm((prev) => ({ ...prev, course_id: "", batch_id: "" }));
      setShowForm(false);

      // If the assigned faculty matches our current dashboard view, refresh the table
      if (globalFacultyId === form.faculty_id) {
        loadAssignments(globalFacultyId);
      } else {
        // Otherwise, switch the view to the newly assigned faculty
        setGlobalFacultyId(form.faculty_id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Assignment failed", "error");
    } finally {
      setAssigning(false);
    }
  }

  async function removeAssignment(id) {
    try {
      const res = await api.delete(`/faculty-assignments/${id}`);
      showToast(res.data?.message || "Removed successfully");
      setConfirm(null);
      
      if (globalFacultyId) {
        loadAssignments(globalFacultyId);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to remove assignment", "error");
    }
  }

  // Helper for UI card representation in the form
  const selectedFormFaculty = useMemo(() => {
    if (!form.faculty_id) return null;
    return faculties.find((f) => String(f.id) === String(form.faculty_id));
  }, [form.faculty_id, faculties]);

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
              <GraduationCap className="text-indigo-600" size={32} />
              Course Assignments
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Assign faculty members to specific course batches. Every faculty assignment is now batch-based.
            </p>
          </div>

          <button
            onClick={() => {
              // If opening form, optionally pre-fill with current dashboard faculty
              if (!showForm && globalFacultyId && !form.faculty_id) {
                setForm(prev => ({ ...prev, faculty_id: globalFacultyId }));
              }
              setShowForm(!showForm);
            }}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
              showForm
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
            }`}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel Form" : "Add Assignment"}
          </button>
        </div>

        {/* ADD ASSIGNMENT FORM (Toggleable) */}
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
                <h3 className="text-lg font-bold text-slate-800 mb-6">Create New Assignment</h3>
                
                <div className="flex flex-col gap-6">
                  {/* FACULTY SELECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Faculty Member
                    </label>
                    
                    {selectedFormFaculty ? (
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
                              CODE: {selectedFormFaculty.code}
                            </span>
                            <span className="text-base font-bold text-slate-800">
                              {selectedFormFaculty.name}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setForm({ ...form, faculty_id: "" })}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors"
                        >
                          <XCircle size={14} /> Change
                        </button>
                      </motion.div>
                    ) : (
                      <select
                        value={form.faculty_id}
                        onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                        disabled={loadingInitial}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 disabled:opacity-50"
                      >
                        <option value="">{loadingInitial ? "Loading Faculties..." : "Select Faculty"}</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.code} • {f.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* COURSE AND BATCH SELECTION */}
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <BookOpen size={14} /> Course Program
                      </label>
                      <select
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        disabled={loadingInitial}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 disabled:opacity-50"
                      >
                        <option value="">{loadingInitial ? "Loading Courses..." : "Select Course"}</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Layers3 size={14} /> Batch
                      </label>
                      <select
                        value={form.batch_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                batch_id: e.target.value,
                            })
                        }
                        disabled={!form.course_id}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            Select Batch
                        </option>

                        {batches.map((b) => (
                            <option
                                key={b.id}
                                value={b.id}
                            >
                                {b.name}
                            </option>
                        ))}
                    </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={assignCourse}
                    disabled={
                      assigning ||
                      !form.faculty_id ||
                      !form.course_id ||
                      !form.batch_id
                  }
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {assigning ? "Processing..." : "Confirm & Assign"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FACULTY GLOBAL FILTER (Sticky UX Improvement) */}
        <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-30 transition-all flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 pl-2 sm:border-r border-slate-200 sm:pr-4 shrink-0">
             <User className="text-indigo-500" size={24} />
             <span className="font-bold text-slate-700">View Ledger</span>
          </div>
          <div className="relative group w-full max-w-xl">
            <select
              value={globalFacultyId}
              onChange={(e) => setGlobalFacultyId(e.target.value)}
              disabled={loadingInitial}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">{loadingInitial ? "-- Loading Workspace... --" : "-- Select a Faculty Member to view assignments --"}</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} • {f.name}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow to replace native one */}
            <div className="absolute right-4 top-3 pointer-events-none text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </motion.div>

        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" />
              Current Assignments
            </h3>
            {assignments.length > 0 && !loadingAssignments && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {assignments.length} Records
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingInitial || loadingAssignments ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <span className="font-bold tracking-widest text-sm">
                          {loadingInitial ? "Fetching Workspace..." : "Fetching Assignments..."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : !globalFacultyId ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <User size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No faculty selected</p>
                        <p className="text-sm mt-1">Please select a faculty member from the filter above.</p>
                      </div>
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No assignments found</p>
                        <p className="text-sm mt-1">Assign a course using the form above to begin.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-800 text-base">{assignment.course_name}</span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                            {assignment.batch_name}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                         <span className="text-sm font-medium text-slate-500">{assignment.assigned_at}</span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setConfirm({
                              id: assignment.id,
                              course: assignment.course_name,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shadow-sm active:scale-95"
                        >
                          <Trash2 size={14} /> Remove
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

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Remove Assignment"
        message={
          <span>
            Remove this faculty assignment from <strong>{confirm?.course}</strong>?
          </span>
        }
        onConfirm={() => removeAssignment(confirm.id)}
        onClose={() => setConfirm(null)}
      />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border border-slate-800">
              <div
                className={`rounded-full p-1 ${
                  toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={14} strokeWidth={3} className="text-slate-900" />
                ) : (
                  <AlertCircle size={14} strokeWidth={3} className="text-white" />
                )}
              </div>
              <span className="font-medium flex-1 text-sm">{toast.message}</span>
              <button
                onClick={() => setToast({ show: false, type: "success", message: "" })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}