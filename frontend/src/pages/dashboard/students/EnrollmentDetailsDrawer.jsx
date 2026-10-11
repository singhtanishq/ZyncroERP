import { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import ConfirmModal from "../../../components/ConfirmModal";
import AppModal from "../../../components/common/AppModal";

const DOCUMENT_TYPES = [
  {
    key: "payment_proof",
    label: "Payment Proof",
    mandatory: true,
  },
];

export default function EnrollmentDetailsDrawer({
  open,
  onClose,
  enrollment,
  refresh,
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [overrideConfirm, setOverrideConfirm] = useState(null);

  // Fresh copy of the enrollment fetched after actions — props are never mutated.
  const [fetched, setFetched] = useState(null);

  // Inline reject flows (document + enrollment)
  const [rejectDoc, setRejectDoc] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState("");
  const [showEnrollmentReject, setShowEnrollmentReject] = useState(false);
  const [enrollmentRejectReason, setEnrollmentRejectReason] = useState("");

  // Reset the fetched copy whenever a different enrollment is opened.
  useEffect(() => {
    setFetched(null);
  }, [enrollment?.id]);

  // Reset inline flows when the drawer closes.
  useEffect(() => {
    if (!open) {
      setRejectDoc(null);
      setDocRejectReason("");
      setShowEnrollmentReject(false);
      setEnrollmentRejectReason("");
    }
  }, [open]);

  const current = fetched || enrollment;

  if (!open || !enrollment) return null;

  const docs = current.enrollment_documents || [];

  const fee = current.student?.fees?.find(
    (x) => x.course_id === current.course_id
  );

  const totalFee = Number(fee?.total_fees || 0);
  const paidFee = Number(fee?.paid_fees || 0);
  const balanceFee = Math.max(totalFee - paidFee, 0);
  const isFreeCourse = totalFee === 0;

  const paymentProof = docs.find(
    (x) => x.document_type === "payment_proof"
  );

  const paymentProofVerified =
    paymentProof?.verification_status === "verified";

  // Status flags for UI constraints
  const isApproved = current.status === "active" || current.status === "approved";
  const isRejected = current.status === "cancelled";
  const isCompleted = current.status === "completed";

  // Free courses have no fee to record; paid courses need a verified proof and balance.
  const canMarkPaid = paymentProofVerified && !isFreeCourse && balanceFee > 0;

  // Free courses can be approved once the proof is verified; otherwise fully paid.
  const canApprove =
    paymentProofVerified &&
    (isFreeCourse || paidFee >= totalFee) &&
    !isApproved &&
    !isCompleted;

  const canComplete =
    current.status === "active" &&
    !isCompleted;

  const getDocument = (type) => docs.find((x) => x.document_type === type);

  const fetchEnrollment = async () => {
    const res = await api.get(`/admin/enrollments/${enrollment.id}`);
    setFetched(res.data);
    return res.data;
  };

  const reloadEnrollment = async () => {
    try {
      await fetchEnrollment();
    } catch (e) {
      console.error(e);
      toast(e?.response?.data?.message || "Unable to refresh enrollment", "error");
    }
    refresh?.();
  };

  const openDocument = async (doc) => {
    try {
      const response = await api.get(
        `/admin/student-documents/${doc.id}/view`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setPreviewUrl(blobUrl);
      setPreviewDoc(doc);
    } catch (e) {
      console.error(e);
      const message =
        e?.response?.status === 404
          ? "No document exists for this payment proof. It was verified using Admin Override."
          : "Unable to load document.";
      toast(message, "error");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewDoc(null);
  };

  const verifyDocument = async (doc) => {
    try {
      setBusy(true);
      await api.post(`/admin/student-documents/${doc.id}/verify`);
      const fresh = await fetchEnrollment();
      refresh?.();

      if (previewDoc?.id === doc.id) {
        setPreviewDoc(
          fresh.enrollment_documents.find((d) => d.id === doc.id) || null
        );
      }
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to verify document", "error");
    } finally {
      setBusy(false);
    }
  };

  const startDocReject = (doc) => {
    setRejectDoc(doc);
    setDocRejectReason("");
  };

  const cancelDocReject = () => {
    setRejectDoc(null);
    setDocRejectReason("");
  };

  const submitDocReject = async () => {
    const doc = rejectDoc;
    const remarks = docRejectReason.trim();
    if (!doc || !remarks) return;

    try {
      setBusy(true);
      await api.post(`/admin/student-documents/${doc.id}/reject`, { remarks });
      const fresh = await fetchEnrollment();
      refresh?.();

      if (previewDoc?.id === doc.id) {
        setPreviewDoc(
          fresh.enrollment_documents.find((d) => d.id === doc.id) || null
        );
      }

      cancelDocReject();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to reject document", "error");
    } finally {
      setBusy(false);
    }
  };

  const adminOverrideDocument = async () => {
    try {
      setBusy(true);
      await api.post(
        "/admin/student-documents/admin-override",
        { enrollment_id: enrollment.id }
      );
      const fresh = await fetchEnrollment();
      refresh?.();

      if (previewDoc) {
        setPreviewDoc(
          fresh.enrollment_documents.find(
            (d) => d.document_type === "payment_proof"
          ) || null
        );
      }
    } catch (e) {
      console.error(e);
      toast(e?.response?.data?.message || "Unable to bypass verification.", "error");
    } finally {
      setBusy(false);
      setOverrideConfirm(null);
    }
  };

  const markPaid = async () => {
    if (!amount) return;

    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/mark-paid`, { amount });
      setAmount("");
      await reloadEnrollment();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to mark payment", "error");
    } finally {
      setBusy(false);
    }
  };

  const approveEnrollment = async () => {
    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/approve`);
      await reloadEnrollment();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to approve enrollment", "error");
    } finally {
      setBusy(false);
    }
  };

  const startEnrollmentReject = () => {
    setShowEnrollmentReject(true);
    setEnrollmentRejectReason("");
  };

  const cancelEnrollmentReject = () => {
    setShowEnrollmentReject(false);
    setEnrollmentRejectReason("");
  };

  const submitEnrollmentReject = async () => {
    const remarks = enrollmentRejectReason.trim();
    if (!remarks) return;

    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/reject`, { remarks });
      cancelEnrollmentReject();
      await reloadEnrollment();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to reject enrollment", "error");
    } finally {
      setBusy(false);
    }
  };

  const completeEnrollment = async () => {
    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/complete`);
      await reloadEnrollment();
    } catch (e) {
      toast(e?.response?.data?.message || "Unable to complete enrollment", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        title="Enrollment Details"
        size="xl"
      >
        <div className="space-y-6 bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))]">
          {/* STUDENT OVERVIEW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Info label="Student" value={enrollment.student?.user?.name} />
            <Info label="SID" value={enrollment.student?.sid} />
            <Info label="Course" value={enrollment.course?.name} />
            <Info label="Batch" value={enrollment.batch?.name} />
            <Info label="Enrollment Status" value={enrollment.status} />
            <Info label="Payment Status" value={enrollment.payment_status} />
          </div>

          {/* DOCUMENTS */}
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 dark:bg-slate-900/40 border border-[rgb(var(--zx-border))] dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-brand-teal-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))] dark:text-white">
                Documents Verification
              </h3>
            </div>

            <div className="space-y-2.5">
              {DOCUMENT_TYPES.map((type) => {
                const doc = getDocument(type.key);
                const uploaded = !!doc;
                const hasPhysicalFile = !!doc?.file_path;
                
                const isDocVerified = doc?.verification_status === "verified";
                const isDocRejected = doc?.verification_status === "rejected";

                const disableVerifyBtn = !uploaded || busy || isDocVerified;
                const disableRejectBtn = !uploaded || busy || isDocVerified || isDocRejected;

                return (
                  <div key={type.key} className="space-y-2">
                    <div className="border border-[rgb(var(--zx-border))] dark:border-slate-800 bg-[rgb(var(--zx-surface))] dark:bg-slate-900 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-[rgb(var(--zx-text))] dark:text-white">
                        {type.label}
                        {type.mandatory && <span className="text-rose-500 ml-1">*</span>}
                      </div>

                      <div className="text-[10px] font-bold mt-0.5 text-[rgb(var(--zx-text-muted))] dark:text-slate-400 uppercase tracking-wider">
                        {uploaded ? doc.verification_status : "Not Uploaded"}
                      </div>

                      {doc?.remarks && (
                        <div className="text-[11px] font-medium text-rose-500 mt-1 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg inline-block">
                          {doc.remarks}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        disabled={!hasPhysicalFile}
                        onClick={() => openDocument(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasPhysicalFile
                            ? "bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 hover:bg-brand-teal-500/20"
                            : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {hasPhysicalFile ? "View" : "NA"}
                      </button>

                      <button
                        disabled={disableVerifyBtn}
                        onClick={() => verifyDocument(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          !disableVerifyBtn
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Verify
                      </button>

                      <button
                        disabled={disableRejectBtn}
                        onClick={() => startDocReject(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          !disableRejectBtn
                            ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                            : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Reject
                      </button>

                      <button
                        disabled={busy || paymentProofVerified}
                        onClick={() => setOverrideConfirm(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                          paymentProofVerified
                            ? "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 cursor-not-allowed"
                            : "bg-amber-600 text-white hover:bg-amber-700"
                        }`}                       
                      >
                        Admin Override
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAYMENTS */}
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 dark:bg-slate-900/40 border border-[rgb(var(--zx-border))] dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-brand-teal-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))] dark:text-white">Payments</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <Info label="Course Fee" value={`₹${totalFee}`} />
              <Info label="Paid Fee" value={`₹${paidFee}`} />
              <Info label="Balance" value={`₹${balanceFee}`} />
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-[rgb(var(--zx-surface))] dark:bg-slate-900 border border-[rgb(var(--zx-border))] dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] dark:text-white placeholder:text-[rgb(var(--zx-text-muted))]/60 dark:placeholder:text-slate-500"
              />

              <button
                disabled={!canMarkPaid || busy}
                onClick={markPaid}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  canMarkPaid
                    ? "bg-brand-teal-500 hover:bg-brand-teal-600 text-white shadow-md shadow-brand-teal-500/20"
                    : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                }`}
              >
                Mark Paid
              </button>
            </div>

            {!paymentProofVerified && (
              <div className="text-xs font-medium text-rose-500 mt-2.5 flex items-center gap-1">
                <XCircle size={13} /> Verify payment proof before recording payment.
              </div>
            )}
          </div>

          {/* ENROLLMENT FINAL ACTIONS */}
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 dark:bg-slate-900/40 border border-[rgb(var(--zx-border))] dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))] dark:text-white">
                Final Enrollment Actions
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                disabled={!canApprove || busy}
                onClick={approveEnrollment}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  canApprove
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                    : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 size={16} />
                Approve
              </button>

              <button
                disabled={isRejected || isCompleted || busy}
                onClick={rejectEnrollment}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  !isRejected && !isCompleted
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                    : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                }`}
              >
                <XCircle size={16} />
                Reject
              </button>

              <button
                disabled={!canComplete || busy}
                onClick={completeEnrollment}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  canComplete
                    ? "bg-brand-teal-500 hover:bg-brand-teal-600 text-white shadow-md shadow-brand-teal-500/20"
                    : "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                }`}
              >
                <GraduationCap size={16} />
                Complete
              </button>
            </div>
          </div>
        </div>
      </AppModal>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-950/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[rgb(var(--zx-surface))] dark:bg-slate-900 border border-[rgb(var(--zx-border))] dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-5xl flex flex-col overflow-hidden h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--zx-border))] dark:border-slate-800 bg-[rgb(var(--zx-surface-hover))]/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-brand-teal-500" />
                <h3 className="font-bold text-[rgb(var(--zx-text))] dark:text-white text-lg tracking-tight">
                  Document Preview
                  <span className="ml-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 border border-[rgb(var(--zx-border))] dark:border-slate-700 text-[rgb(var(--zx-text-muted))] dark:text-slate-400 uppercase tracking-wider">
                    {previewDoc.document_type?.replace("_", " ")}
                  </span>
                </h3>
              </div>
              <button 
                onClick={closePreview} 
                className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] dark:text-slate-400 hover:bg-[rgb(var(--zx-surface-hover))] dark:hover:bg-slate-800 hover:text-[rgb(var(--zx-text))] dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-[rgb(var(--zx-surface-hover))]/30 dark:bg-slate-950/40 p-4 md:p-6 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-2xl border border-[rgb(var(--zx-border))] dark:border-slate-800 shadow-sm bg-[rgb(var(--zx-surface))] dark:bg-slate-900"
                title="Document Preview"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-[rgb(var(--zx-border))] dark:border-slate-800 bg-[rgb(var(--zx-surface-hover))]/50 dark:bg-slate-800/50 flex justify-center gap-4">
              <button
                disabled={busy || previewDoc.verification_status === "verified"}
                onClick={() => verifyDocument(previewDoc)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  previewDoc.verification_status === "verified"
                    ? "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                }`}
              >
                <CheckCircle2 size={18} /> Verify Document
              </button>
              
              <button
                disabled={busy || previewDoc.verification_status === "verified" || previewDoc.verification_status === "rejected"}
                onClick={() => rejectDocument(previewDoc)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  previewDoc.verification_status === "verified" || previewDoc.verification_status === "rejected"
                    ? "bg-[rgb(var(--zx-surface-hover))] dark:bg-slate-800 text-[rgb(var(--zx-text-muted))] dark:text-slate-500 border border-[rgb(var(--zx-border))] dark:border-slate-700 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
                }`}
              >
                <XCircle size={18} /> Reject Document
              </button>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        open={overrideConfirm}
        onClose={() => setOverrideConfirm(null)}
        onConfirm={adminOverrideDocument}
        title="Admin Override"
        message="This will bypass the requirement for the student to upload payment proof and will immediately mark the payment proof as verified. Continue?"
      />
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="border border-[rgb(var(--zx-border))] dark:border-slate-800 bg-[rgb(var(--zx-surface))] dark:bg-slate-900 rounded-xl p-3 transition-all">
      <div className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] dark:text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="font-semibold text-[rgb(var(--zx-text))] dark:text-white text-xs sm:text-sm truncate">
        {value || "-"}
      </div>
    </div>
  );
}