import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import AppModal from "../../../components/common/AppModal";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  X,
  Save,
  Hash,
  Inbox,
  ShieldCheck,
  AlertCircle,
  Building2
} from "lucide-react";

// --- VIEW MODAL COMPONENT ---
function ViewEmployeeModal({ data, onClose }) {
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
      title="Employee Details"
      size="lg"
      footer={
        <button 
          type="button"
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/25"
        >
          Close Panel
        </button>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Corporate Profile Overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Employee ID" value={`#${data.employee_id || data.id}`} icon={Hash} />
          <DetailRow label="Full Name" value={data.name} icon={User} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="System Role" value={data.role?.name} icon={ShieldCheck} />
          <DetailRow label="Department" value={data.department} icon={Building2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Email Address" value={data.email} icon={Mail} />
          <DetailRow label="Contact Number" value={data.phone} icon={Phone} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <DetailRow label="Date of Joining" value={data.joining_date} icon={Calendar} />
        </div>
      </div>
    </AppModal>
  );
}

// --- EDIT MODAL COMPONENT ---
function EditModal({ open, data, onClose, onSaved }) {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    department: "", 
    joining_date: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        joining_date: data.joining_date ? data.joining_date.substring(0, 10) : ""
      });
    }
  }, [data]);

  if (!open) return null;

  const save = async () => {
    await api.put(`/corporate/employees/${data.id}`, form);
    onSaved();
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Update Employee"
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
            className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={16} /> Save Changes
          </button>
        </>
      }
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Edit corporate profile
        </p>

        <div className="grid grid-cols-1 gap-4">
          <ModalInput label="Full Name" value={form.name} onChange={v => updateField("name", v)} icon={User} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Email Address" value={form.email} onChange={v => updateField("email", v)} type="email" icon={Mail} />
          <ModalInput label="Phone Number" value={form.phone} onChange={v => updateField("phone", v)} type="tel" icon={Phone} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Department" value={form.department} onChange={v => updateField("department", v)} icon={Building2} />
          <ModalInput label="Joining Date" value={form.joining_date} onChange={v => updateField("joining_date", v)} type="date" icon={Calendar} />
        </div>
      </div>
    </AppModal>
  );
}

function ModalInput({ label, value, onChange, type = "text", icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-brand-teal-500"/>} {label}
      </label>
      <input
        type={type}
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ManageEmployees() {
  const [data, setData] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // ================= LOAD =================
  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/corporate/employees");
      setData(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= DELETE =================
  const remove = async (id) => {
    try {
      await api.delete(`/corporate/employees/${id}`);
      showToast("Employee deleted successfully", "success");
      load();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete employee", "error");
    } finally {
      setConfirm(null);
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
            <Briefcase size={14} strokeWidth={2.5} />
            Corporate Directory
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Employees
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            View the corporate roster, manage professional credentials, and update departmental assignments.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
                <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Emp ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-right"></th>
                </tr>
            </thead>

            <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {loading ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading employees...</span>
                  </div>
                    </td>
                </tr>
                ) : data.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                        <div className="flex flex-col items-center justify-center">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No employees found</p>
                        </div>
                    </td>
                </tr>
                ) : (
                data.map((emp) => (
                    <React.Fragment key={emp.id}>
                    <tr
                        className={`cursor-pointer transition-colors ${expandedId === emp.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                        onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    >
                        <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono tracking-tight">
                            #{emp.employee_id || emp.id}
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm">
                                <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {emp.name}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                            {emp.email}
                        </td>
                        <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border-[rgb(var(--zx-border))]">
                                <ShieldCheck size={12}/> {emp.role?.name || "Unassigned"}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                                <Building2 size={14} className="text-[rgb(var(--zx-text-muted))]"/> {emp.department || "N/A"}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === emp.id ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                                <MoreHorizontal size={18} />
                            </div>
                        </td>
                    </tr>

                    {/* EXPANDED ACTION ROW */}
                    {expandedId === emp.id && (
                        <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                        <td colSpan="6" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto">Management Actions:</span>
                                
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all"
                                    onClick={(e) => { e.stopPropagation(); setViewModal(emp); }}
                                >
                                    <Eye size={16} /> View Profile
                                </button>

                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-amber-500 hover:text-amber-500 transition-all"
                                    onClick={(e) => { e.stopPropagation(); setEditModal({ ...emp }); }}
                                >
                                    <Pencil size={16} /> Update Details
                                </button>

                                <div className="w-px h-6 bg-[rgb(var(--zx-border))] mx-1"></div>

                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-500 shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-rose-500/10 transition-all"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setConfirm({ id: emp.id, name: emp.name }); 
                                    }}
                                >
                                    <Trash2 size={16} /> Terminate
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
      </div>

      {/* VIEW MODAL */}
      {viewModal && (
        <ViewEmployeeModal data={viewModal} onClose={() => setViewModal(null)} />
      )}

      {/* EDIT MODAL */}
      <EditModal
        open={!!editModal}
        data={editModal}
        onClose={() => setEditModal(null)}
        onSaved={() => {
          setEditModal(null);
          load();
          showToast("Employee profile updated successfully", "success");
        }}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Terminate Employee"
        message={
          <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
            Are you sure you want to remove <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span> from the corporate directory?
            This action cannot be undone and will revoke their system access.
          </span>
        }
        onConfirm={() => remove(confirm.id)}
        onClose={() => setConfirm(null)}
      />

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
            <div className={`rounded-full p-1 border ${toast.type === "success" ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border-rose-500/30'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} strokeWidth={3} /> 
                    : <AlertCircle size={14} strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-bold tracking-wide mr-4">{toast.msg}</span>
            <button type="button" onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}