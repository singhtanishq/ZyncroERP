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

      const blobUrl = URL.createObjectURL(
        response.data
      );
      
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
      
      // Update preview context if modal is open
      if (previewDoc?.id === doc.id) {

        const res = await api.get(
          `/admin/enrollments/${enrollment.id}`
        );

        const freshDoc =
          res.data.enrollment_documents.find(
            d => d.id === doc.id
          );

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
      await api.post(`/admin/student-documents/${doc.id}/reject`, {
        remarks,
      });
      await reloadEnrollment();
      
      // Update preview context if modal is open
      if (previewDoc?.id === doc.id) {

        const res = await api.get(
          `/admin/enrollments/${enrollment.id}`
        );

        const freshDoc =
          res.data.enrollment_documents.find(
            d => d.id === doc.id
          );

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
        {
          enrollment_id: enrollment.id,
        }
      );

      await reloadEnrollment();

      if (previewDoc) {
        const res = await api.get(
          `/admin/enrollments/${enrollment.id}`
        );

        const freshDoc =
          res.data.enrollment_documents.find(
            (d) => d.document_type === "payment_proof"
          );

        setPreviewDoc(freshDoc);
      }
    } catch (e) {
      console.error(e);

      alert(
        e?.response?.data?.message ||
        "Unable to bypass verification."
      );
    } finally {
      setBusy(false);
      setOverrideConfirm(null);
    }
  };

  const markPaid = async () => {
    if (!amount) return;

    try {
      setBusy(true);
      await api.post(`/admin/enrollments/${enrollment.id}/mark-paid`, {
        amount,
      });
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
      await api.post(`/admin/enrollments/${enrollment.id}/reject`, {
        remarks,
      });
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
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-all duration-300">
        <div className="w-full max-w-4xl bg-white h-full overflow-y-auto shadow-2xl">
          
          {/* HEADER */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              Enrollment Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* STUDENT */}
            <div className="grid md:grid-cols-2 gap-4">
              <Info label="Student" value={enrollment.student?.user?.name} />
              <Info label="SID" value={enrollment.student?.sid} />
              <Info label="Course" value={enrollment.course?.name} />
              <Info label="Batch" value={enrollment.batch?.name} />
              <Info label="Enrollment Status" value={enrollment.status} />
              <Info label="Payment Status" value={enrollment.payment_status} />
            </div>

            {/* DOCUMENTS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-800">
                  Documents Verification
                </h3>
              </div>

              <div className="space-y-3">
                {DOCUMENT_TYPES.map((type) => {
                  const doc = getDocument(type.key);
                  const uploaded = !!doc;
                  const hasPhysicalFile = !!doc?.file_path;
                  
                  const isDocVerified = doc?.verification_status === "verified";
                  const isDocRejected = doc?.verification_status === "rejected";

                  // UX Refinement: Verify disabled if already verified. Reject disabled if verified OR already rejected.
                  const disableVerifyBtn = !uploaded || busy || isDocVerified;
                  const disableRejectBtn = !uploaded || busy || isDocVerified || isDocRejected;

                  return (
                    <div
                      key={type.key}
                      className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-semibold text-slate-700">
                          {type.label}
                          {type.mandatory && (
                            <span className="text-rose-500 ml-1">*</span>
                          )}
                        </div>

                        <div className="text-sm font-medium mt-0.5 text-slate-500 uppercase tracking-wide text-[11px]">
                          {uploaded ? doc.verification_status : "Not Uploaded"}
                        </div>

                        {doc?.remarks && (
                          <div className="text-xs font-medium text-rose-500 mt-1.5 bg-rose-50 px-2 py-1 rounded inline-block">
                            {doc.remarks}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          disabled={!hasPhysicalFile}
                          onClick={() => openDocument(doc)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            hasPhysicalFile
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {hasPhysicalFile ? "View" : "NA"}
                        </button>

                        <button
                          disabled={disableVerifyBtn}
                          onClick={() => verifyDocument(doc)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            !disableVerifyBtn
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Verify
                        </button>

                        <button
                          disabled={disableRejectBtn}
                          onClick={() => rejectDocument(doc)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            !disableRejectBtn
                              ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Reject
                        </button>

                        <button
                          disabled={busy || paymentProofVerified}
                          onClick={() => setOverrideConfirm(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                                paymentProofVerified
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-blue-600" />
                <h3 className="font-bold text-lg text-slate-800">Payments</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <Info label="Course Fee" value={`₹${totalFee}`} />
                <Info label="Paid Fee" value={`₹${paidFee}`} />
                <Info label="Balance" value={`₹${balanceFee}`} />
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />

                <button
                  disabled={!canMarkPaid || busy}
                  onClick={markPaid}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    canMarkPaid
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Mark Amount Paid
                </button>
              </div>

              {!paymentProofVerified && (
                <div className="text-sm font-medium text-rose-500 mt-3 flex items-center gap-1.5">
                  <XCircle size={14} /> Verify payment proof before recording payment.
                </div>
              )}
            </div>

            {/* ENROLLMENT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-800">
                  Final Enrollment
                </h3>
              </div>

              {/* UX Refinement: Button sequence updated to Approve -> Reject -> Complete */}
              <div className="grid md:grid-cols-3 gap-3">
                
                {/* 1. Approve Enrollment */}
                <button
                  disabled={!canApprove || busy}
                  onClick={approveEnrollment}
                  className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                    canApprove
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={18} />
                  Approve Enrollment
                </button>

                {/* 2. Reject Enrollment */}
                <button
                  disabled={isRejected || isCompleted || busy}
                  onClick={rejectEnrollment}
                  className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                    !isRejected && !isCompleted
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <XCircle size={18} />
                  Reject Enrollment
                </button>

                {/* 3. Complete Enrollment */}
                <button
                  disabled={!canComplete || busy}
                  onClick={completeEnrollment}
                  className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                    canComplete
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <GraduationCap size={18} />
                  Course Completed
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL (Glassmorphic & Centered) */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-5xl flex flex-col overflow-hidden h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">
                  Document Preview
                  <span className="ml-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                    {previewDoc.document_type?.replace("_", " ")}
                  </span>
                </h3>
              </div>
              <button 
                onClick={closePreview} 
                className="p-2 bg-slate-100/50 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-slate-100/50 p-4 md:p-6 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-xl border border-slate-200/60 shadow-sm bg-white"
                title="Document Preview"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200/60 bg-white/50 flex justify-center gap-4">
              <button
                disabled={busy || previewDoc.verification_status === "verified"}
                onClick={() => verifyDocument(previewDoc)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  previewDoc.verification_status === "verified"
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
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
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
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
    <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 transition-all hover:bg-slate-50 hover:border-slate-200">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="font-semibold text-slate-800 text-sm md:text-base">
        {value || "-"}
      </div>
    </div>
  );
}
