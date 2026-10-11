import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Eye,
  Plus,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Award,
  User,
  Hash,
  ShieldCheck,
  MoreHorizontal,
  Loader2,
  FileText,
  Calendar,
  Type,
  Inbox,
  ExternalLink,
  Building2
} from "lucide-react";

export default function IssueCertificate() {
  const [employees, setEmployees] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [certificates, setCertificates] = useState([]);

  const [issueModal, setIssueModal] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [pdfModal, setPdfModal] = useState(null);

  const [form, setForm] = useState({
    certificate_name: "",
    issued_date: "",
  });

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isCertLoading, setIsCertLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    setIsPageLoading(true);
    try {
      const res = await api.get("/corporate/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // ================= LOAD CERTIFICATES =================
  const loadCertificates = async (employeeId) => {
    setIsCertLoading(true);
    try {
      const res = await api.get("/corporate/certificates");
      const filtered = res.data.filter((c) => c.employee_id === employeeId);
      setCertificates(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCertLoading(false);
    }
  };

  // ================= ISSUE =================
  const submit = async () => {
    try {
      setLoading(true);

      await api.post("/corporate/certificates", {
        ...form,
        employee_id: issueModal
      });

      showToast("Certificate issued");

      setIssueModal(null);
      setForm({ certificate_name: "", issued_date: "" });
    } catch (e) {
      console.error(e);
      showToast(
        e?.response?.data?.message || "Failed to issue certificate",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <Award size={14} strokeWidth={2.5} />
            Credential Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Certificate Management
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Issue official credentials, manage employee certifications, and view documented achievements.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] flex flex-col relative z-10">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Employee Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--zx-border))]">
              {isPageLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                      <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                      <span className="font-medium text-sm">Loading employees...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No employees found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <React.Fragment key={emp.id}>
                    <tr
                      className={`cursor-pointer transition-colors ${expandedId === emp.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                      onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    >
                      <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono tracking-tight">
                        #{emp.employee_id || emp.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[rgb(var(--zx-text))] text-sm flex items-center gap-2">
                          <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {emp.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border-[rgb(var(--zx-border))]">
                          <ShieldCheck size={12} /> {emp.role?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                          <Building2 size={14} className="text-[rgb(var(--zx-text-muted))]"/> {emp.department || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === emp.id ? "rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20" : "text-[rgb(var(--zx-text-muted))]"}`}>
                          <MoreHorizontal size={18} />
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED ACTION ROW */}
                    {expandedId === emp.id && (
                      <tr className="bg-[rgb(var(--zx-surface-hover))]/50 transition-all duration-200">
                        <td colSpan="5" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto">Actions:</span>

                            {/* VIEW CERTIFICATES */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadCertificates(emp.id);
                                setViewModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all active:scale-95"
                            >
                              <Eye size={16} /> View Certificates
                            </button>

                            {/* ISSUE CERTIFICATE */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIssueModal(emp.id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal-500 text-white shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-brand-teal-600 shadow-brand-teal-500/20 transition-all active:scale-95"
                            >
                              <Plus size={16} /> Issue New Certificate
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

      {/* ISSUE MODAL */}
      {issueModal && (
        <Modal 
          onClose={() => setIssueModal(null)} 
          title="Issue New Certificate" 
          subtitle="Generate an official credential document"
        >
          <div className="space-y-5 p-2">
            <Input
              label="Certificate Name"
              placeholder="e.g. Employee of the Month"
              icon={Type}
              value={form.certificate_name}
              onChange={(v) => setForm({ ...form, certificate_name: v })}
            />

            <Input
              label="Date of Issuance"
              type="date"
              icon={Calendar}
              value={form.issued_date}
              onChange={(v) => setForm({ ...form, issued_date: v })}
            />

            <div className="pt-4 border-t border-[rgb(var(--zx-border))] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIssueModal(null)}
                className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading || !form.certificate_name || !form.issued_date}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  loading || !form.certificate_name || !form.issued_date
                    ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                    : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
                ) : (
                  <span className="flex items-center gap-2"><Award size={16} /> Issue Credential</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW CERTIFICATES MODAL */}
      {viewModal && !pdfModal && (
        <Modal 
          onClose={() => setViewModal(false)} 
          title="Employee Certificates" 
          subtitle="Archive of issued credentials"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-dashboard-scroll">
            {isCertLoading ? (
              <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3 py-12">
                <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                <span className="font-medium text-sm">Loading certificates...</span>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center flex flex-col items-center justify-center py-10 text-[rgb(var(--zx-text-muted))]">
                <Inbox size={40} className="mb-3 opacity-20" />
                <span className="text-sm font-bold text-[rgb(var(--zx-text))]">No certificates on record</span>
              </div>
            ) : (
              certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-[rgb(var(--zx-surface-hover))]/50 border border-[rgb(var(--zx-border))] rounded-2xl hover:border-brand-teal-500/40 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] flex items-center justify-center text-brand-teal-500 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[rgb(var(--zx-text))] text-sm">{c.certificate_name}</div>
                      <div className="text-xs font-semibold text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5 mt-0.5">
                        <Hash size={12} /> {c.certificate_number}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPdfModal(c.certificate_number)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-teal-500 bg-brand-teal-500/10 hover:bg-brand-teal-500/20 border border-brand-teal-500/20 transition-all"
                  >
                    View <ExternalLink size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* PDF PREVIEW MODAL */}
      {pdfModal && (
        <Modal 
          onClose={() => {
            setPdfModal(null);
            setViewModal(false);
          }} 
          title="Document Viewer" 
          subtitle="Official Certificate Preview"
          width="max-w-4xl"
        >
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setPdfModal(null)}
              className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 transition-all shadow-sm"
            >
              <ArrowLeft size={16} /> Back to List
            </button>

            <div className="w-full h-[65vh] bg-[rgb(var(--zx-surface-hover))] rounded-2xl border border-[rgb(var(--zx-border))] overflow-hidden shadow-inner relative">
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <Loader2 className="animate-spin text-[rgb(var(--zx-text-muted))]" size={32} />
              </div>
              <iframe
                src={`/api/corporate-certificate/${pdfModal}/view`}
                className="w-full h-full bg-[rgb(var(--zx-surface))] z-10 relative"
                title="Certificate PDF"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] transition-all duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
            <div className={`rounded-full p-1 border ${toast.type === "error" ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"}`}>
              {toast.type === "error" ? (
                <AlertCircle size={14} strokeWidth={3} />
              ) : (
                <CheckCircle2 size={14} strokeWidth={3} />
              )}
            </div>
            <span className="text-sm font-bold tracking-wide mr-4">{toast.msg}</span>
            <button type="button" onClick={() => setToast(null)} className="ml-auto text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= REUSABLE ENHANCED MODAL =================
function Modal({ children, onClose, title, subtitle, width = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-200">
      <div className={`bg-[rgb(var(--zx-surface))] rounded-3xl w-full ${width} shadow-2xl flex flex-col overflow-hidden transform transition-all duration-200 border border-[rgb(var(--zx-border))]`}>
        <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] flex justify-between items-center bg-[rgb(var(--zx-surface-hover))] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">{title}</h2>
            {subtitle && <p className="text-xs text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))] p-2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ================= REUSABLE ENHANCED INPUT =================
function Input({ label, value, onChange, placeholder, type = "text", icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-brand-teal-500" />} {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
      />
    </div>
  );
}