import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import AppModal from "../../../components/common/AppModal";
import { 
  Pencil,
  Trash2,
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
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-3 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-4 py-3 rounded-xl">
        {Icon && <Icon size={16} className="text-brand-teal-500 shrink-0" />}
        <span className="text-sm font-semibold text-[rgb(var(--zx-text))]">{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <AppModal
      open={!!data}
      onClose={onClose}
      title="Faculty Details"
      size="lg"
      footer={
        <button 
          type="button" 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/20"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Professional Profile Overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Faculty ID" value={data.code} icon={Hash} />
          <DetailRow label="Full Name" value={data.name} icon={User} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Qualification" value={data.qualification} icon={BookOpen} />
          <DetailRow label="Specialization" value={data.specialization} icon={Briefcase} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Email Address" value={data.email} icon={Mail} />
          <DetailRow label="Contact Number" value={data.phone} icon={Phone} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <DetailRow label="Joining Date" value={data.join_date} />
        </div>
      </div>
    </AppModal>
  );
}

// --- EDIT MODAL COMPONENT ---
function EditModal({ open, data, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", code: "", email: "", phone: "", qualification: "", specialization: "", join_date: "" });

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
    <AppModal
      open={open}
      onClose={onClose}
      title="Update Faculty"
      size="lg"
      footer={
        <>
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={save} 
            className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={16} /> Save Changes
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Edit professional details
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Full Name" value={form.name} onChange={v => updateField("name", v)} />
          <ModalInput label="Faculty ID" value={form.code} onChange={v => updateField("code", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Qualification" value={form.qualification} onChange={v => updateField("qualification", v)} />
          <ModalInput label="Specialization" value={form.specialization} onChange={v => updateField("specialization", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Phone" value={form.phone} onChange={v => updateField("phone", v)} />
          <ModalInput label="Email" value={form.email} onChange={v => updateField("email", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Joining Date" value={form.join_date} onChange={v => updateField("join_date", v)} />
        </div>
      </div>
    </AppModal>
  );
}

function ModalInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</label>
      <input
        type={label === "Joining Date" ? "date" : "text"}
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
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
  
  const [confirm, setConfirm] = useState(null);
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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <GraduationCap size={14} strokeWidth={2.5} />
            Educator Directory
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Faculty
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Overview of academic staff members. Manage professional credentials, contact data, and joining date.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Faculty ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading faculties...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No faculty members found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <React.Fragment key={f.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === f.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 uppercase tracking-tight">#{f.code}</td>
                    <td className="px-6 py-5 text-sm font-bold text-[rgb(var(--zx-text))]">{f.name}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">{f.phone}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))]">{f.email}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium italic">{f.specialization}</td>
                    
                    <td className="px-6 py-5 text-right">
                      <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === f.id ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                        <MoreHorizontal size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ACTIONS ROW */}
                  {expandedId === f.id && (
                    <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                      <td colSpan="6" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto">Faculty Actions:</span>
                          
                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all"
                            onClick={(e) => { e.stopPropagation(); setViewFaculty(f); }}
                          >
                            <Eye size={16} /> View Profile
                          </button>

                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-amber-500 hover:text-amber-500 transition-all"
                            onClick={(e) => { e.stopPropagation(); setEdit(f); }}
                          >
                            <Pencil size={16} /> Update
                          </button>

                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-blue-500 hover:text-brand-blue-500 transition-all"
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

                          <div className="w-px h-6 bg-[rgb(var(--zx-border))] mx-1"></div>

                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-500 shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-rose-500/10 transition-all"
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
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl">
            <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-1 border border-emerald-500/30">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-wide">{toast}</span>
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
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
              Reset login credentials for{" "}
              <span className="font-bold text-[rgb(var(--zx-text))]">
                "{confirm?.name}"
              </span>
              ? A new password will be generated and emailed.
            </span>
          ) : (
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
              Are you sure you want to remove{" "}
              <span className="font-bold text-[rgb(var(--zx-text))]">
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