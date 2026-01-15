import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import AppModal from "../../../components/common/AppModal";
import { 
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Store,
  Save,
  X,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  Mail,
  Phone,
  Hash,
  User,
  Inbox
} from "lucide-react";

// --- VIEW MODAL COMPONENT ---
function ViewFranchiseModal({ data, onClose }) {
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
      title="Franchise Details"
      size="lg"
      footer={
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/20"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Branch Information Overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Branch ID" value={data.code} icon={Hash} />
          <DetailRow label="Branch Name" value={data.name} icon={Store} />
        </div>
        <DetailRow label="Owner Name" value={data.owner_name} icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Email Address" value={data.email} icon={Mail} />
          <DetailRow label="Contact Number" value={data.phone} icon={Phone} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Address</span>
          <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-4 py-3 rounded-xl text-sm text-[rgb(var(--zx-text))] leading-relaxed font-medium">
            {data.address || "No address provided."}
          </div>
        </div>
      </div>
    </AppModal>
  );
}

// --- EDIT MODAL COMPONENT ---
function EditModal({ open, data, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", code: "", owner_name: "", phone: "", email: "", address: "" });

  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  if (!open) return null;

  const save = async () => {
    await api.put(`/franchises/${data.id}`, form);
    onSaved();
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Update Franchise"
      size="lg"
      footer={
        <>
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
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
          Edit branch profile
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Franchise Name" value={form.name} onChange={v => updateField("name", v)} />
          <ModalInput label="Franchise Code" value={form.code} onChange={v => updateField("code", v)} />
        </div>
        <ModalInput label="Owner Name" value={form.owner_name} onChange={v => updateField("owner_name", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalInput label="Phone" value={form.phone} onChange={v => updateField("phone", v)} />
          <ModalInput label="Email" value={form.email} onChange={v => updateField("email", v)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Address</label>
          <textarea
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-medium resize-none shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
            rows={3}
            value={form.address}
            onChange={e => updateField("address", e.target.value)}
          />
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
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// --- MAIN MANAGEMENT COMPONENT ---
export default function ManageFranchise() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewFranchise, setViewFranchise] = useState(null);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/franchises");
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await api.delete(`/franchises/${id}`);
    showToast("Franchise deleted successfully");
    setConfirm(null);
    load();
  };

  const toggle = async (id) => {
    await api.patch(`/franchises/${id}/toggle`);
    showToast("Status updated");
    load();
  };

  const getStatusColor = (status) => {
    return status === "active" 
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
      : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]";
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
            <Store size={14} strokeWidth={2.5} />
            Network Management
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Franchises
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Monitor branch performance, update operational details, or manage activation status.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Branch ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Branch Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading franchise...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No franchises found</p>
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
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">{f.owner_name}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))]">{f.email}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">{f.phone}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === f.id ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                        <MoreHorizontal size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ACTIONS ROW */}
                  {expandedId === f.id && (
                    <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                      <td colSpan="7" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto">Franchise Actions:</span>
                          
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all"
                            onClick={(e) => { e.stopPropagation(); setViewFranchise(f); }}
                          >
                            <Eye size={16} /> View Details
                          </button>

                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-amber-500 hover:text-amber-500 transition-all"
                            onClick={(e) => { e.stopPropagation(); setEdit(f); }}
                          >
                            <Pencil size={16} /> Update
                          </button>

                          <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm text-xs font-bold uppercase tracking-wider transition-all ${f.status === 'active' ? 'bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] hover:border-amber-500 hover:text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:border-emerald-500'}`}
                            onClick={(e) => { e.stopPropagation(); toggle(f.id); }}
                          >
                            {f.status === "active" ? <><ToggleRight size={16} /> Disable</> : <><ToggleLeft size={16} /> Enable</>}
                          </button>

                          <div className="w-px h-6 bg-[rgb(var(--zx-border))] mx-1"></div>

                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-500 shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-rose-500/10 transition-all"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setConfirm({ id: f.id, name: f.name }); 
                            }}
                          >
                            <Trash2 size={16} /> Delete
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
        title="Delete Franchise"
        message={
          <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
            Are you sure you want to delete the franchise <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>? 
            This action cannot be undone.
          </span>
        }
        onConfirm={() => handleDelete(confirm.id)}
        onClose={() => setConfirm(null)}
      />

      {/* MODALS */}
      {viewFranchise && (
        <ViewFranchiseModal data={viewFranchise} onClose={() => setViewFranchise(null)} />
      )}

      <EditModal
        open={!!edit}
        data={edit}
        onClose={() => setEdit(null)}
        onSaved={() => {
          setEdit(null);
          load();
          showToast("Franchise details updated");
        }}
      />
    </div>
  );
}