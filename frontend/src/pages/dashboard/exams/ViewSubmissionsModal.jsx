import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  X,
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col h-[85vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assignment Submissions</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Review student responses and files</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 bg-slate-50/30 overflow-hidden flex flex-col relative">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 text-slate-400 z-10 bg-white/50 backdrop-blur-sm">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <span className="font-bold uppercase tracking-widest text-sm">Fetching Submissions...</span>
            </div>
          ) : data ? (
            <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
              
              {/* ASSIGNMENT DETAILS CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm shrink-0">
                <h3 className="font-extrabold text-lg text-slate-800 mb-4 pb-4 border-b border-slate-100">
                  {data.assignment?.title || "Untitled Assignment"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><BookOpen size={16}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{data.assignment?.course_name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><Layers size={16}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{data.assignment?.batch_name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><CalendarClock size={16}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {data.assignment?.deadline ? new Date(data.assignment.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "No Deadline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0"><Users size={16}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Submitted</p>
                      <p className="text-sm font-black text-indigo-600 truncate">{data.total_submissions || 0} Students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
                <div className="overflow-auto flex-1 custom-dashboard-scroll">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SID</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Profile</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Response Link</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Attached File</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.submissions?.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center">
                              <Inbox size={40} className="mb-3 opacity-20" />
                              <p className="text-base font-medium text-slate-600">No submissions yet.</p>
                              <p className="text-xs mt-1">Student responses will appear here once submitted.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        data.submissions?.map((submission) => (
                          <tr key={submission.id} className="hover:bg-slate-50 transition-colors group">
                            
                            <td className="px-6 py-4">
                              <span className="font-mono text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                {submission.student_id || "N/A"}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800 text-sm">{submission.student_name}</span>
                                <span className="text-xs font-medium text-slate-500">{submission.student_email}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {submission.response_link ? (
                                <a
                                  href={submission.response_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
                                >
                                  <Link2 size={14} /> Open Link
                                </a>
                              ) : (
                                <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">-</span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {submission.response_file ? (
                                <a
                                  href={`/api/student/assignments/file/${submission.response_file.replace("assignment-submissions/", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                                >
                                  <DownloadCloud size={14} /> View File
                                </a>
                              ) : (
                                <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">-</span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-medium text-slate-600">
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
        </div>

        {/* CUSTOM SCROLLBAR CSS FOR THIS MODAL */}
        <style>{`
          .custom-dashboard-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
          .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
      </div>
    </div>
  );
}