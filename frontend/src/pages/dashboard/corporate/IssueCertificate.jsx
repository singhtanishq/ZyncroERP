import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Eye,
  Plus,
  ArrowLeft,
  X,
  CheckCircle2,
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
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Award className="text-indigo-600" size={32} />
            Certificate Management
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Issue official credentials, manage employee certifications, and view documented achievements.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isPageLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="font-medium">Loading employees...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-slate-600">No employees found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <React.Fragment key={emp.id}>
                    <tr
                      className={`cursor-pointer transition-colors ${expandedId === emp.id ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                      onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    >
                      <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono tracking-tight">
                        #{emp.employee_id || emp.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <User size={14} className="text-slate-400" /> {emp.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-200">
                          <ShieldCheck size={12} /> {emp.role?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Building2 size={14} className="text-slate-400"/> {emp.department || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === emp.id ? "rotate-90 bg-indigo-100 text-indigo-600" : "text-slate-300"}`}>
                          <MoreHorizontal size={18} />
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED ACTION ROW */}
                    {expandedId === emp.id && (
                      <tr className="bg-indigo-50/30 transition-all duration-200">
                        <td colSpan="5" className="px-6 py-4 border-b border-slate-100">
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto">Actions:</span>

                            {/* VIEW CERTIFICATES */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadCertificates(emp.id);
                                setViewModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95"
                            >
                              <Eye size={16} /> View Certificates
                            </button>

                            {/* ISSUE CERTIFICATE */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIssueModal(emp.id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-sm text-sm font-bold hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
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

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIssueModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading || !form.certificate_name || !form.issued_date}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${
                  loading || !form.certificate_name || !form.issued_date
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
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
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {isCertLoading ? (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-medium">Loading certificates...</span>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center flex flex-col items-center justify-center py-10 text-slate-400">
                <Inbox size={40} className="mb-3 opacity-20" />
                <span className="text-sm font-medium text-slate-500">No certificates on record</span>
              </div>
            ) : (
              certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{c.certificate_name}</div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Hash size={12} /> {c.certificate_number}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPdfModal(c.certificate_number)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
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
              onClick={() => setPdfModal(null)}
              className="flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} /> Back to List
            </button>

            <div className="w-full h-[65vh] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative">
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
              <iframe
                src={`/api/corporate-certificate/${pdfModal}/view`}
                className="w-full h-full bg-white z-10 relative"
                title="Certificate PDF"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] transition-all duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 min-w-[300px]">
            <div className="rounded-full p-1 bg-emerald-500">
              <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold tracking-wide mr-4">{toast}</span>
            <button onClick={() => setToast("")} className="ml-auto text-slate-400 hover:text-white transition-colors">
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
      <div className={`bg-white rounded-3xl w-full ${width} shadow-2xl flex flex-col overflow-hidden transform transition-all duration-200 border border-slate-100`}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
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
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-indigo-500" />} {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
      />
    </div>
  );
}