import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import {
  ClipboardCheck,
  BookOpen,
  Layers,
  CalendarClock,
  Users,
  Link2,
  DownloadCloud,
  Loader2,
  Inbox
} from "lucide-react";

export default function ViewSubmissionsModal({
  apiPrefix = "/admin",
  assignmentId,
  open,
  onClose,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `${apiPrefix}/assignments/${assignmentId}/submissions`
      );

      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && assignmentId) {
        load();
    }
  }, [open, assignmentId, apiPrefix]);

  if (!open) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Assignment Submissions"
      size="xl"
      footer={
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Review student responses and files
        </p>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-[rgb(var(--zx-text-muted))]">
            <Loader2 size={40} className="animate-spin text-brand-teal-500" />
            <span className="font-bold uppercase tracking-widest text-xs">Fetching Submissions...</span>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* ASSIGNMENT DETAILS CARD */}
            <div className="bg-[rgb(var(--zx-surface))] rounded-2xl border border-[rgb(var(--zx-border))] p-5 shadow-sm">
              <h3 className="font-extrabold text-base text-[rgb(var(--zx-text))] mb-4 pb-3 border-b border-[rgb(var(--zx-border))]">
                {data.assignment?.title || "Untitled Assignment"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] rounded-xl border border-[rgb(var(--zx-border))] shrink-0"><BookOpen size={16}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">Course</p>
                    <p className="text-sm font-bold text-[rgb(var(--zx-text))] truncate">{data.assignment?.course_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] rounded-xl border border-[rgb(var(--zx-border))] shrink-0"><Layers size={16}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">Batch</p>
                    <p className="text-sm font-bold text-[rgb(var(--zx-text))] truncate">{data.assignment?.batch_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] rounded-xl border border-[rgb(var(--zx-border))] shrink-0"><CalendarClock size={16}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">Deadline</p>
                    <p className="text-sm font-bold text-[rgb(var(--zx-text))] truncate">
                      {data.assignment?.deadline ? new Date(data.assignment.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "No Deadline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-teal-500/10 text-brand-teal-500 rounded-xl border border-brand-teal-500/20 shrink-0"><Users size={16}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">Total Submitted</p>
                    <p className="text-sm font-extrabold text-brand-teal-500 truncate">{data.total_submissions || 0} Students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-dashboard-scroll max-h-[380px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[rgb(var(--zx-surface-hover))] sticky top-0 z-10 border-b border-[rgb(var(--zx-border))]">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">SID</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Profile</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Response Link</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Attached File</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                    {data.submissions?.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                          <div className="flex flex-col items-center justify-center">
                            <Inbox size={40} className="mb-3 opacity-20" />
                            <p className="text-base font-bold text-[rgb(var(--zx-text))]">No submissions yet.</p>
                            <p className="text-xs mt-1">Student responses will appear here once submitted.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.submissions?.map((submission) => (
                        <tr key={submission.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                          
                          <td className="px-6 py-4">
                            <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                              {submission.student_id || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[rgb(var(--zx-text))] text-sm">{submission.student_name}</span>
                              <span className="text-xs font-medium text-[rgb(var(--zx-text-muted))]">{submission.student_email}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {submission.response_link ? (
                              <a
                                href={submission.response_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 bg-brand-teal-500/10 text-brand-teal-500 hover:bg-brand-teal-500/20 border border-brand-teal-500/20"
                              >
                                <Link2 size={14} /> Open Link
                              </a>
                            ) : (
                              <span className="text-[rgb(var(--zx-text-muted))] font-bold text-xs uppercase tracking-wider">-</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {submission.response_file ? (
                              <a
                                href={`/api/student/assignments/file/${submission.response_file.replace("assignment-submissions/", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))]"
                              >
                                <DownloadCloud size={14} /> View File
                              </a>
                            ) : (
                              <span className="text-[rgb(var(--zx-text-muted))] font-bold text-xs uppercase tracking-wider">-</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">
                              {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                            </span>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : null}

        {/* CUSTOM SCROLLBAR CSS FOR THIS MODAL */}
        <style>{`
          .custom-dashboard-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
          .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
          .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
        `}</style>
      </div>
    </AppModal>
  );
}