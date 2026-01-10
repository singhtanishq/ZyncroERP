import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
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
        params: { role: filter, search },
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, search]);

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
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'faculty': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'student': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'franchise': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-indigo-600" size={32} />
            Bulk Communication
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Target specific user groups, write announcements, and dispatch bulk emails across the organization.
          </p>
        </div>

        {/* SEND BUTTON (Top Right) */}
        <button
          disabled={!selected.length}
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md ${
            selected.length > 0 
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300" 
            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          <Mail size={18} />
          Compose Message {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Role Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl w-full lg:w-auto">
          {["all", "student", "faculty", "franchise", "admin"].map((r) => (
            <button 
                key={r} 
                onClick={() => { setFilter(r); setSelected([]); }}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    filter === r 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
            />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between backdrop-blur-sm">
            <button 
                onClick={selectAll} 
                disabled={isLoading || users.length === 0}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
                {selected.length === users.length && users.length > 0 ? (
                    <><CheckSquare size={18} className="text-indigo-600" /> Deselect All</>
                ) : (
                    <><ListChecks size={18} /> Select All</>
                )}
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selected.length} Selected
            </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
                <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading users...</span>
                  </div>
                    </td>
                </tr>
                ) : users.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No users found</p>
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
                                ? "bg-indigo-50/40 border-l-indigo-500 shadow-sm" 
                                : "hover:bg-slate-50 border-l-transparent"
                            }`}
                        >
                            <td className="px-6 py-5">
                                <button className="text-slate-300 group-hover:text-indigo-400 transition-colors focus:outline-none">
                                    {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                                </button>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono tracking-tight">
                                #{u.id}
                            </td>
                            <td className="px-6 py-5">
                                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Users size={14} className="text-slate-400" /> {u.name}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="text-sm text-slate-600 font-medium">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Compose Broadcast</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                    Sending to <span className="font-bold text-indigo-600">{selected.length}</span> recipients
                </p>
              </div>
              <button 
                onClick={() => !isSending && setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors disabled:opacity-50"
                disabled={isSending}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Subject</label>
                <input
                  placeholder="Enter a clear, concise subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSending}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Content</label>
                <textarea
                  placeholder="Type your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSending}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 h-48 resize-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={!subject.trim() || !content.trim() || isSending}
                onClick={sendEmails}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                    (!subject.trim() || !content.trim() || isSending)
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
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
          </div>
        </div>
      )}

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