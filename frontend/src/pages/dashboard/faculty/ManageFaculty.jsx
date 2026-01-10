import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  Save,
  X,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  Mail,
  Phone,
  Hash,
  User,
  BookOpen,
  Briefcase,
  Inbox,
  KeyRound
} from "lucide-react";

// --- VIEW MODAL COMPONENT ---
function ViewFacultyModal({ data, onClose }) {
  if (!data) return null;

  const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
        {Icon && <Icon size={16} className="text-slate-400" />}
        <span className="text-sm font-semibold text-slate-700">{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Faculty Details</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Professional Profile Overview</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Faculty ID" value={data.code} icon={Hash} />
            <DetailRow label="Full Name" value={data.name} icon={User} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Qualification" value={data.qualification} icon={BookOpen} />
            <DetailRow label="Specialization" value={data.specialization} icon={Briefcase} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Email Address" value={data.email} icon={Mail} />
            <DetailRow label="Contact Number" value={data.phone} icon={Phone} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <DetailRow label="Joining Date" value={data.join_date} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- EDIT MODAL COMPONENT ---
function EditModal({ open, data, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", code: "", email: "", phone: "", qualification: "", specialization: "", join_date: "",});

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        join_date: data.join_date ? data.join_date.substring(0, 10) : ""
      });
    }
  }, [data]);

  if (!open) return null;

  const save = async () => {
    await api.put(`/faculties/${data.id}`, form);
    onSaved();
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Update Faculty</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Edit professional details</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Full Name" value={form.name} onChange={v => updateField("name", v)} />
            <ModalInput label="Faculty ID" value={form.code} onChange={v => updateField("code", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Qualification" value={form.qualification} onChange={v => updateField("qualification", v)} />
            <ModalInput label="Specialization" value={form.specialization} onChange={v => updateField("specialization", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Phone" value={form.phone} onChange={v => updateField("phone", v)} />
            <ModalInput label="Email" value={form.email} onChange={v => updateField("email", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Joining Date" value={form.join_date} onChange={v => updateField("join_date", v)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition-colors">
            Cancel
          </button>
          <button onClick={save} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <input
        type={label === "Joining Date" ? "date" : "text"}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// --- MAIN MANAGEMENT COMPONENT ---
export default function ManageFaculty() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const [confirm, setConfirm] = useState(null); // Added state for confirm modal
  const [viewFaculty, setViewFaculty] = useState(null);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/faculties");
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeFaculty = async (id) => {
    await api.delete(`/faculties/${id}`);
    showToast("Faculty member removed");
    setConfirm(null);
    load();
  };

  const resetCredentials = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/reset`);
      showToast("Credentials reset and emailed");
      setConfirm(null);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        "Failed to reset credentials"
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={32} />
            Manage Faculty
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Overview of academic staff members. Manage professional credentials, contact data, and joining date.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading faculties...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No faculty members found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <React.Fragment key={f.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === f.id ? "bg-blue-50/30" : "hover:bg-slate-50"}`}
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-indigo-600 uppercase tracking-tight">#{f.code}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">{f.name}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{f.phone}</td>
                    <td className="px-6 py-5 text-sm text-slate-500">{f.email}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium italic">{f.specialization}</td>
                    
                    <td className="px-6 py-5 text-right">
                      <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === f.id ? 'rotate-90 bg-blue-100 text-blue-600' : 'text-slate-300'}`}>
                        <MoreHorizontal size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ACTIONS ROW */}
                  {expandedId === f.id && (
                    <tr className="bg-blue-50/30 animate-in fade-in duration-200">
                      <td colSpan="6" className="px-6 py-4 border-b border-slate-100">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto">Faculty Actions:</span>
                          
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
                            onClick={(e) => { e.stopPropagation(); setViewFaculty(f); }}
                          >
                            <Eye size={16} /> View Profile
                          </button>

                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-amber-300 hover:text-amber-600 hover:shadow-md transition-all"
                            onClick={(e) => { e.stopPropagation(); setEdit(f); }}
                          >
                            <Pencil size={16} /> Update
                          </button>

                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirm({
                                type: "reset",
                                userId: f.user_id,
                                name: f.name,
                              });
                            }}
                          >
                            <KeyRound size={16} />
                            Reset Login
                          </button>

                          <div className="w-px h-6 bg-slate-300 mx-1"></div>

                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-100 text-red-600 shadow-sm text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setConfirm({
                                type: "delete",
                                id: f.id,
                                name: f.name
                            });
                            }}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium tracking-wide">{toast}</span>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === "reset"
            ? "Reset Login Credentials"
            : "Remove Faculty"
        }
        message={
          confirm?.type === "reset" ? (
            <span className="block text-slate-600">
              Reset login credentials for{" "}
              <span className="font-bold text-slate-900">
                "{confirm?.name}"
              </span>
              ? A new password will be generated and emailed.
            </span>
          ) : (
            <span className="block text-slate-600">
              Are you sure you want to remove{" "}
              <span className="font-bold text-slate-900">
                "{confirm?.name}"
              </span>
              ? This action cannot be undone.
            </span>
          )
        }
        onConfirm={() => {
          if (confirm.type === "reset") {
            resetCredentials(confirm.userId);
          } else {
            removeFaculty(confirm.id);
          }
        }}
        onClose={() => setConfirm(null)}
      />

      {/* MODALS */}
      {viewFaculty && (
        <ViewFacultyModal data={viewFaculty} onClose={() => setViewFaculty(null)} />
      )}

      <EditModal
        open={!!edit}
        data={edit}
        onClose={() => setEdit(null)}
        onSaved={() => {
          setEdit(null);
          load();
          showToast("Faculty profile updated");
        }}
      />
    </div>
  );
}