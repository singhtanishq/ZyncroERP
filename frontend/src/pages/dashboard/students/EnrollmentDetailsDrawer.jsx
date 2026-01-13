import { useState } from "react";
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
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [overrideConfirm, setOverrideConfirm] = useState(null);

  if (!open || !enrollment) return null;

  const docs = enrollment.enrollment_documents || [];

  const fee = enrollment.student?.fees?.find(
    (x) => x.course_id === enrollment.course_id
  );

  const totalFee = Number(fee?.total_fees || 0);
  const paidFee = Number(fee?.paid_fees || 0);
  const balanceFee = Math.max(totalFee - paidFee, 0);

  const paymentProof = docs.find(
    (x) => x.document_type === "payment_proof"
  );

  const paymentProofVerified =
    paymentProof?.verification_status === "verified";

  // Status flags for UI constraints
  const isApproved = enrollment.status === "active" || enrollment.status === "approved";
  const isRejected = enrollment.status === "cancelled";
  const isCompleted = enrollment.status === "completed";

  // UX Refinement: Disable Mark Paid if balance is 0 or less
  const canMarkPaid = paymentProofVerified && balanceFee > 0;

  // UX Refinement: Enforce payment rules and check if not already approved/completed
  const canApprove =
    paymentProofVerified &&
    paidFee >= totalFee &&
    totalFee > 0 &&
    !isApproved &&
    !isCompleted;

  const canComplete =
    enrollment.status === "active" &&
    !isCompleted;
  
  const getDocument = (type) => docs.find((x) => x.document_type === type);

  const reloadEnrollment = async () => {
    try {
      const res = await api.get(`/admin/enrollments/${enrollment.id}`);
      enrollment.student = res.data.student;
      enrollment.enrollment_documents = res.data.enrollment_documents || [];
      enrollment.status = res.data.status;
      enrollment.payment_status = res.data.payment_status;
    } catch (e) {
      console.error(e);
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
      alert(message);
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
      await reloadEnrollment();
      
      if (previewDoc?.id === doc.id) {
        const res = await api.get(`/admin/enrollments/${enrollment.id}`);
        const freshDoc = res.data.enrollment_documents.find(d => d.id === doc.id);
        setPreviewDoc(freshDoc);
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Unable to verify document");
    } finally {
      setBusy(false);
    }
  };

  const rejectDocument = async (doc) => {
    const remarks = prompt("Enter rejection reason");
    if (!remarks) return;

    try {
      setBusy(true);
      await api.post(`/admin/student-documents/${doc.id}/reject`, { remarks });
      await reloadEnrollment();
      
      if (previewDoc?.id === doc.id) {
        const res = await api.get(`/admin/enrollments/${enrollment.id}`);
        const freshDoc = res.data.enrollment_documents.find(d => d.id === doc.id);
        setPreviewDoc(freshDoc);
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Unable to reject document");
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
      await reloadEnrollment();

      if (previewDoc) {
        const res = await api.get(`/admin/enrollments/${enrollment.id}`);
        const freshDoc = res.data.enrollment_documents.find(
          (d) => d.document_type === "payment_proof"
        );
        setPreviewDoc(freshDoc);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Unable to bypass verification.");
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
      alert(e?.response?.data?.message || "Unable to mark payment");
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
      alert(e?.response?.data?.message || "Unable to approve enrollment");
    } finally {
      setBusy(false);
    }
  };

  const rejectEnrollment = async () => {
    const remarks = prompt("Reason for rejection");
    if (!remarks) return;

    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/reject`, { remarks });
      await reloadEnrollment();
    } catch (e) {
      alert(e?.response?.data?.message || "Unable to reject enrollment");
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
      alert(e?.response?.data?.message || "Unable to complete enrollment");
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
        <div className="space-y-6">
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
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 border border-[rgb(var(--zx-border))] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-brand-teal-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))]">
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
                  <div
                    key={type.key}
                    className="border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-[rgb(var(--zx-text))]">
                        {type.label}
                        {type.mandatory && <span className="text-rose-500 ml-1">*</span>}
                      </div>

                      <div className="text-[10px] font-bold mt-0.5 text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">
                        {uploaded ? doc.verification_status : "Not Uploaded"}
                      </div>

                      {doc?.remarks && (
                        <div className="text-[11px] font-medium text-rose-500 mt-1 bg-rose-500/10 px-2 py-0.5 rounded inline-block">
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
                            : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed"
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
                            : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed"
                        }`}
                      >
                        Verify
                      </button>

                      <button
                        disabled={disableRejectBtn}
                        onClick={() => rejectDocument(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          !disableRejectBtn
                            ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                            : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed"
                        }`}
                      >
                        Reject
                      </button>

                      <button
                        disabled={busy || paymentProofVerified}
                        onClick={() => setOverrideConfirm(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                          paymentProofVerified
                            ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed"
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
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 border border-[rgb(var(--zx-border))] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-brand-teal-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))]">Payments</h3>
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
                className="flex-1 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))]/60"
              />

              <button
                disabled={!canMarkPaid || busy}
                onClick={markPaid}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  canMarkPaid
                    ? "bg-brand-teal-500 hover:bg-brand-teal-600 text-white shadow-md shadow-brand-teal-500/20"
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
          <div className="bg-[rgb(var(--zx-surface-hover))]/40 border border-[rgb(var(--zx-border))] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--zx-text))]">
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
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
          <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] shadow-2xl rounded-3xl w-full max-w-5xl flex flex-col overflow-hidden h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]/50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-brand-teal-500" />
                <h3 className="font-bold text-[rgb(var(--zx-text))] text-lg tracking-tight">
                  Document Preview
                  <span className="ml-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">
                    {previewDoc.document_type?.replace("_", " ")}
                  </span>
                </h3>
              </div>
              <button 
                onClick={closePreview} 
                className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-[rgb(var(--zx-surface-hover))]/30 p-4 md:p-6 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm bg-[rgb(var(--zx-surface))]"
                title="Document Preview"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]/50 flex justify-center gap-4">
              <button
                disabled={busy || previewDoc.verification_status === "verified"}
                onClick={() => verifyDocument(previewDoc)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  previewDoc.verification_status === "verified"
                    ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
                    ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed"
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
    <div className="border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] rounded-xl p-3 transition-all">
      <div className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="font-semibold text-[rgb(var(--zx-text))] text-xs sm:text-sm truncate">
        {value || "-"}
      </div>
    </div>
  );
}