import React, { useEffect, useState, Fragment } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Award, 
  User, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  XCircle
} from "lucide-react";

export default function IssueCertificates({
    apiPrefix = "/admin",
}) {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadCertificates = () => {
    setIsLoading(true);
    api.get(`${apiPrefix}/certificates`)
      .then(res => setCertificates(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCertificates();
  }, [apiPrefix]);

  const issueCertificate = async () => {
    if (!confirm) return;

    await api.post(
      `${apiPrefix}/certificates/${confirm.id}/issue`
    );
    setConfirm(null);
    loadCertificates();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 font-sans animate-in fade-in duration-300">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <ShieldCheck size={14} strokeWidth={2.5} />
          Credential Hub
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
          Issue Certificates
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
          Validate exam results and officially issue certificates to passing students. 
          Once issued, certificates can be viewed via the public verification link.
        </p>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Details</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Exam Reference</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-center">Score</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-center">Result Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-center">Issuance</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                             <span className="font-medium text-sm">Loading certificates...</span>
                        </div>
                    </td>
                </tr>
            ) : certificates.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                        <div className="flex flex-col items-center justify-center">
                            <Award size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No certificates pending</p>
                        </div>
                    </td>
                </tr>
            ) : (
                certificates.map(cert => {
                    const issued = !!cert.issued_at;
                    const passed = cert.status === "passed";
                    const isExpanded = expandedId === cert.id;

                    return (
                        <Fragment key={cert.id}>
                            <tr 
                                className={`cursor-pointer transition-colors ${isExpanded ? 'bg-brand-teal-500/5' : 'hover:bg-[rgb(var(--zx-surface-hover))]'}`}
                                onClick={() => toggleExpand(cert.id)}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[rgb(var(--zx-surface-hover))] flex items-center justify-center text-brand-teal-500 border border-[rgb(var(--zx-border))] shadow-sm">
                                            <User size={16} />
                                        </div>
                                        <span className="font-bold text-[rgb(var(--zx-text))] text-sm">{cert.certifiable?.user?.name}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="text-sm font-semibold text-[rgb(var(--zx-text))]">{cert.exam?.name}</div>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    <span className="text-xs font-mono font-bold text-[rgb(var(--zx-text))] bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                                        {cert.score ?? "-"}
                                    </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                                        passed 
                                        ? 'bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20' 
                                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                    }`}>
                                        {passed ? "Passed" : "Failed"}
                                    </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    {issued ? (
                                        <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                                            <CheckCircle2 size={12} strokeWidth={3} /> Issued
                                        </div>
                                    ) : (
                                        <div className="text-[rgb(var(--zx-text-muted))] text-xs font-medium italic">Pending</div>
                                    )}
                                </td>

                                <td className="px-6 py-5 text-right">
                                    <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                                        <MoreHorizontal size={18} />
                                    </div>
                                </td>
                            </tr>

                            {/* EXPANDED ACTION ROW */}
                            {isExpanded && (
                                <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                                    <td colSpan="6" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                                        <div className="flex flex-wrap items-center justify-end gap-3">
                                            <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto flex items-center gap-2">
                                                Management Actions <ChevronRight size={12} />
                                            </span>

                                            {!issued && (
                                                <button
                                                    disabled={!passed}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${
                                                        passed 
                                                        ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20 active:scale-95" 
                                                        : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        passed && setConfirm(cert);
                                                    }}
                                                    title={!passed ? "Cannot issue certificate for failed exam" : ""}
                                                >
                                                    <FileText size={16} /> Issue Certificate
                                                </button>
                                            )}

                                            {issued && (
                                                <button
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all active:scale-95"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`${import.meta.env.VITE_API_BASE_URL}/api/certificate/${cert.certificate_number}`, "_blank");
                                                    }}
                                                >
                                                    <ExternalLink size={16} /> View Digital Certificate
                                                </button>
                                            )}

                                            {!passed && !issued && (
                                                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl shadow-sm">
                                                    <XCircle size={14} /> Criteria not met for issuance
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirm && (
        <ConfirmModal
          open={true}
          title="Confirm Certificate Issuance"
          message={
            <div className="space-y-3">
                <p className="text-[rgb(var(--zx-text))]">
                    Are you sure you want to issue a certificate to <span className="font-bold text-[rgb(var(--zx-text))]">{confirm.certifiable?.user?.name}</span>?
                </p>
                <div className="bg-[rgb(var(--zx-surface-hover))] p-3.5 rounded-2xl border border-[rgb(var(--zx-border))] text-xs text-[rgb(var(--zx-text-muted))] space-y-1">
                    <p><span className="font-bold uppercase tracking-wider">Exam:</span> <span className="text-[rgb(var(--zx-text))]">{confirm.exam?.name}</span></p>
                    <p><span className="font-bold uppercase tracking-wider">Final Score:</span> <span className="text-[rgb(var(--zx-text))]">{confirm.score}</span></p>
                </div>
            </div>
          }
          onConfirm={issueCertificate}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}