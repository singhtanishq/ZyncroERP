import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
  Mail, 
  Search, 
  CheckSquare, 
  Square, 
  Users, 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MessageSquare,
  Inbox,
  ListChecks
} from "lucide-react";

export default function SendBulkEmails() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/communication/users", {
        params: { role: filter, search: debouncedSearch },
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the search input so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [filter, debouncedSearch]);

  // ================= SELECT =================
  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === users.length && users.length > 0) {
        setSelected([]); // Deselect all if already all selected
    } else {
        setSelected(users.map((u) => u.id));
    }
  };

  // ================= SEND =================
  const sendEmails = async () => {
    setIsSending(true);
    try {
      await api.post("/admin/communication/send", {
        user_ids: selected,
        subject,
        content,
      });

      showToast(`Emails successfully dispatched to ${selected.length} users`, "success");
      setShowModal(false);
      setSelected([]);
      setSubject("");
      setContent("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send communications", "error");
    } finally {
      setIsSending(false);
    }
  };

  // ================= UI HELPERS =================
  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'student': return 'bg-brand-blue-500/10 text-brand-blue-600 border-brand-blue-500/20';
      case 'franchise': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]';
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
            <MessageSquare size={14} strokeWidth={2.5} />
            Outbound Messaging
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Bulk Communication
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Target specific user groups, write announcements, and dispatch bulk emails across the organization.
          </p>
        </div>

        {/* SEND BUTTON (Top Right) */}
        <button
          type="button"
          disabled={!selected.length}
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-lg ${
            selected.length > 0 
            ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20" 
            : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
          }`}
        >
          <Mail size={18} />
          Compose Message {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-[rgb(var(--zx-surface))] p-4 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 relative z-10">
        
        {/* Role Tabs */}
        <div className="flex flex-wrap bg-[rgb(var(--zx-surface-hover))] p-1.5 rounded-2xl w-full lg:w-auto border border-[rgb(var(--zx-border))]">
          {["all", "student", "faculty", "franchise", "admin"].map((r) => (
            <button 
                key={r} 
                type="button"
                onClick={() => { setFilter(r); setSelected([]); }}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    filter === r 
                    ? 'bg-[rgb(var(--zx-surface))] text-brand-teal-500 shadow-sm border border-[rgb(var(--zx-border))]' 
                    : 'text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))]'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
            <input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-sm font-semibold text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] flex flex-col relative z-10">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] flex items-center justify-between">
            <button 
                type="button"
                onClick={selectAll} 
                disabled={isLoading || users.length === 0}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--zx-text))] hover:text-brand-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
                {selected.length === users.length && users.length > 0 ? (
                    <><CheckSquare size={16} className="text-brand-teal-500" /> Deselect All</>
                ) : (
                    <><ListChecks size={16} /> Select All</>
                )}
            </button>
            <span className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">
                {selected.length} Selected
            </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))]">
                <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">System Role</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {isLoading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading users...</span>
                  </div>
                    </td>
                </tr>
                ) : users.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                    <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                    </td>
                </tr>
                ) : (
                users.map((u) => {
                    const isSelected = selected.includes(u.id);
                    return (
                        <tr
                            key={u.id}
                            onClick={() => toggleUser(u.id)}
                            className={`cursor-pointer transition-all duration-200 border-l-[3px] group ${
                                isSelected 
                                ? "bg-brand-teal-500/5 border-l-brand-teal-500" 
                                : "hover:bg-[rgb(var(--zx-surface-hover))] border-l-transparent"
                            }`}
                        >
                            <td className="px-6 py-5">
                                <span className="text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 transition-colors inline-block">
                                    {isSelected ? <CheckSquare size={18} className="text-brand-teal-500" /> : <Square size={18} />}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono tracking-tight">
                                #{u.id}
                            </td>
                            <td className="px-6 py-5">
                                <div className="font-bold text-[rgb(var(--zx-text))] text-sm flex items-center gap-2">
                                    <Users size={14} className="text-[rgb(var(--zx-text-muted))]" /> {u.name}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                                    {u.email}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getRoleColor(u.role)}`}>
                                    {u.role}
                                </span>
                            </td>
                        </tr>
                    );
                })
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* COMPOSE MODAL */}
      {showModal && (
        <AppModal
          open={showModal}
          onClose={() => !isSending && setShowModal(false)}
          title="Compose Broadcast"
          subtitle={
            <span>
              Sending to <span className="font-bold text-brand-teal-500">{selected.length}</span> recipients
            </span>
          }
          size="lg"
          footer={
            <div className="w-full flex justify-between items-center">
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!subject.trim() || !content.trim() || isSending}
                onClick={sendEmails}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                    (!subject.trim() || !content.trim() || isSending)
                    ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                    : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/25"
                }`}
              >
                {isSending ? (
                    <>
                        <Loader2 size={16} className="animate-spin" /> Dispatching...
                    </>
                ) : (
                    <>
                        <Send size={16} /> Dispatch Emails
                    </>
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Email Subject *</label>
              <input
                placeholder="Enter a clear, concise subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Message Content *</label>
              <textarea
                placeholder="Type your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSending}
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 h-48 resize-none disabled:opacity-50"
              />
            </div>
          </div>
        </AppModal>
      )}

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