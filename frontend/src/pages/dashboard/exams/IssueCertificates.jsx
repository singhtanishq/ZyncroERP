import React, { useEffect, useState, Fragment } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Award, 
  User, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle,
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
  }, []);

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
    <div className="max-w-7xl mx-auto p-6 font-sans animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} />
            Issue Certificates
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Validate exam results and officially issue certificates to passing students. 
            Once issued, certificates can be viewed via the public verification link.
        </p>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Reference</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Result Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Issuance</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                             <span className="font-medium">Loading certificates...</span>
                        </div>
                    </td>
                </tr>
            ) : certificates.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                            <Award size={48} className="mb-4 opacity-10" />
                            <p className="text-lg font-medium text-slate-600">No certificates pending</p>
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
                                className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                                onClick={() => toggleExpand(cert.id)}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                            <User size={16} />
                                        </div>
                                        <span className="font-bold text-slate-800 text-sm">{cert.certifiable?.user?.name}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="text-sm font-medium text-slate-600">{cert.exam?.name}</div>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    <span className="text-sm font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                        {cert.score ?? "-"}
                                    </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        passed 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                        {passed ? "Passed" : "Failed"}
                                    </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                    {issued ? (
                                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                                            <CheckCircle2 size={14} strokeWidth={3} /> Issued
                                        </div>
                                    ) : (
                                        <div className="text-slate-300 text-xs font-medium italic">Pending</div>
                                    )}
                                </td>

                                <td className="px-6 py-5 text-right">
                                    <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-indigo-100 text-indigo-600' : 'text-slate-300'}`}>
                                        <MoreHorizontal size={18} />
                                    </div>
                                </td>
                            </tr>

                            {/* EXPANDED ACTION ROW */}
                            {isExpanded && (
                                <tr className="bg-indigo-50/30 animate-in fade-in duration-200">
                                    <td colSpan="6" className="px-6 py-4 border-b border-slate-100">
                                        <div className="flex flex-wrap items-center justify-end gap-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto flex items-center gap-2">
                                                Management Actions <ChevronRight size={12} />
                                            </span>

                                            {!issued && (
                                                <button
                                                    disabled={!passed}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
                                                        passed 
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95" 
                                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
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
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`${import.meta.env.VITE_API_BASE_URL}/certificate/${cert.certificate_number}`, "_blank");
                                                    }}
                                                >
                                                    <ExternalLink size={16} /> View Digital Certificate
                                                </button>
                                            )}

                                            {!passed && !issued && (
                                                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-white border border-rose-100 px-3 py-2 rounded-lg shadow-sm">
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
            <div className="space-y-2">
                <p className="text-slate-600">
                    Are you sure you want to issue a certificate to <span className="font-bold text-slate-900">{confirm.certifiable?.user?.name}</span>?
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
                    <p><span className="font-bold uppercase tracking-wider">Exam:</span> {confirm.exam?.name}</p>
                    <p><span className="font-bold uppercase tracking-wider">Final Score:</span> {confirm.score}</p>
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