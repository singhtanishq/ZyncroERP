import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
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
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employee Details</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Corporate Profile Overview</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Employee ID" value={`#${data.employee_id || data.id}`} icon={Hash} />
            <DetailRow label="Full Name" value={data.name} icon={User} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="System Role" value={data.role?.name} icon={ShieldCheck} />
            <DetailRow label="Department" value={data.department} icon={Building2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Email Address" value={data.email} icon={Mail} />
            <DetailRow label="Contact Number" value={data.phone} icon={Phone} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <DetailRow label="Date of Joining" value={data.joining_date} icon={Calendar} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-md">
            Close Panel
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Update Employee</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Edit corporate profile</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 gap-4">
            <ModalInput label="Full Name" value={form.name} onChange={v => updateField("name", v)} icon={User} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Email Address" value={form.email} onChange={v => updateField("email", v)} type="email" icon={Mail} />
            <ModalInput label="Phone Number" value={form.phone} onChange={v => updateField("phone", v)} type="tel" icon={Phone} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Department" value={form.department} onChange={v => updateField("department", v)} icon={Building2} />
            <ModalInput label="Joining Date" value={form.joining_date} onChange={v => updateField("joining_date", v)} type="date" icon={Calendar} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
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

function ModalInput({ label, value, onChange, type = "text", icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-indigo-500"/>} {label}
      </label>
      <input
        type={type}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-24">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={32} />
            Manage Employees
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            View the corporate roster, manage professional credentials, and update departmental assignments.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Emp ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-right"></th>
                </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
                {loading ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading employees...</span>
                  </div>
                    </td>
                </tr>
                ) : data.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-600">No employees found</p>
                        </div>
                    </td>
                </tr>
                ) : (
                data.map((emp) => (
                    <React.Fragment key={emp.id}>
                    <tr
                        className={`cursor-pointer transition-colors ${expandedId === emp.id ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                        onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    >
                        <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono tracking-tight">
                            #{emp.employee_id || emp.id}
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                                <User size={14} className="text-slate-400" /> {emp.name}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                            {emp.email}
                        </td>
                        <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-200">
                                <ShieldCheck size={12}/> {emp.role?.name || "Unassigned"}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <Building2 size={14} className="text-slate-400"/> {emp.department || "N/A"}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === emp.id ? 'rotate-90 bg-indigo-100 text-indigo-600' : 'text-slate-300'}`}>
                                <MoreHorizontal size={18} />
                            </div>
                        </td>
                    </tr>

                    {/* EXPANDED ACTION ROW */}
                    {expandedId === emp.id && (
                        <tr className="bg-indigo-50/30 animate-in fade-in duration-200">
                        <td colSpan="6" className="px-6 py-4 border-b border-slate-100">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto">Management Actions:</span>
                                
                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
                                    onClick={(e) => { e.stopPropagation(); setViewModal(emp); }}
                                >
                                    <Eye size={16} /> View Profile
                                </button>

                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-amber-300 hover:text-amber-600 hover:shadow-md transition-all"
                                    onClick={(e) => { e.stopPropagation(); setEditModal({ ...emp }); }}
                                >
                                    <Pencil size={16} /> Update Details
                                </button>

                                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-100 text-red-600 shadow-sm text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all"
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
          <span className="block text-slate-600">
            Are you sure you want to remove <span className="font-bold text-slate-900">"{confirm?.name}"</span> from the corporate directory?
            This action cannot be undone and will revoke their system access.
          </span>
        }
        onConfirm={() => remove(confirm.id)}
        onClose={() => setConfirm(null)}
      />

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 min-w-[300px]">
            <div className={`rounded-full p-1 ${toast.type === "success" ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} className="text-white" strokeWidth={3} /> 
                    : <AlertCircle size={14} className="text-white" strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-semibold tracking-wide mr-4">{toast.msg}</span>
            <button onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}