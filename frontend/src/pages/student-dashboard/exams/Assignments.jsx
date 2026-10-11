import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  UploadCloud,
  X,
  FileText,
  Link as LinkIcon,
  Inbox,
  Loader2,
  AlertCircle,
  FileBox,
  Send,
  CalendarClock,
  CheckCircle,
  BookOpen,
  Layers
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — matches backend max:10240 (KB)
const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "zip"];

function AssignmentModal({ assignment, onClose, onSubmitted }) {
  const { toast } = useToast();
  const [responseLink, setResponseLink] = useState("");
  const [responseFile, setResponseFile] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const detail = assignment?.detail?.assignment;
  const submission = assignment?.detail?.submission;
  const alreadySubmitted = !!submission;

  const uploadFile = async (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      toast(
        "Unsupported file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, ZIP.",
        "error"
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("File is too large. Maximum allowed size is 10MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignment_id", detail.id);
    setFileName(file.name);

    try {
      setUploading(true);
      const res = await api.post("/student/assignments/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponseFile(res.data.path);
    } catch (e) {
      toast(e?.response?.data?.message || "Upload failed", "error");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const submitAssignment = async () => {
    if (!responseLink && !responseFile) {
      toast("Provide a response link or upload a file.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/student/assignments/${detail.id}/submit`, {
        response_link: responseLink || null,
        response_file: responseFile || null,
      });
      onSubmitted();
    } catch (e) {
      toast(e?.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm shrink-0">
              <FileBox size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Assignment Details
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT COLUMN: DETAILS */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h3 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">
                {detail.title}
              </h3>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100/60">
                <CalendarClock size={16} className="text-indigo-500" />
                Deadline: <span className="text-rose-600 font-semibold">{new Date(detail.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl border border-slate-100/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" /> Instructions
              </h4>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {detail.question}
              </div>
            </div>

            {/* ATTACHMENTS & LINKS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detail.assignment_link && (
                <a
                  href={detail.assignment_link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                    <LinkIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Reference</p>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Open Link</p>
                  </div>
                </a>
              )}

              <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Attachment</p>
                  {detail.assignment_file ? (
                    <a
                      href={`/api/student/assignments/${detail.id}/attachment`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors"
                    >
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-slate-400">No file</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SUBMISSION AREA */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-6 sticky top-0">
              <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100/50">
                <Send size={18} className="text-indigo-500" /> Your Submission
              </h4>

              {alreadySubmitted ? (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-800 mb-1">Successfully Submitted</h4>
                  <p className="text-xs font-medium text-emerald-600 mb-4">You have completed this assignment.</p>
                  <div className="bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                    <Clock size={14} className="text-emerald-500" /> 
                    {new Date(submission.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                      <LinkIcon size={14} className="text-indigo-400" /> Response Link <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={responseLink}
                      onChange={(e) => setResponseLink(e.target.value)}
                      className="w-full bg-white/60 border border-slate-200/80 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-sm placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                      <UploadCloud size={14} className="text-indigo-400" /> Upload File <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
                    </label>
                    
                    <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 group ${responseFile ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-slate-50/30"}`}>
                      <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full relative">
                        <div className={`p-2.5 rounded-full transition-all duration-300 shadow-sm ${responseFile ? "bg-emerald-100 text-emerald-600 scale-105" : "bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200"}`}>
                          {uploading ? <Loader2 size={20} className="animate-spin" /> : responseFile ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
                        </div>
                        <div className="space-y-0.5">
                          <p className={`text-sm font-bold transition-colors ${responseFile ? "text-emerald-800" : "text-slate-700 group-hover:text-indigo-700"}`}>
                            {uploading ? "Uploading..." : responseFile ? fileName : "Attach a file"}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {responseFile ? "File attached" : "Max 10MB"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                          hidden
                          disabled={uploading || submitting}
                          onChange={(e) => {
                            uploadFile(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={submitAssignment}
                      disabled={uploading || submitting || (!responseLink && !responseFile)}
                      className={`w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm ${
                        (!responseLink && !responseFile) || uploading || submitting
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow"
                      }`}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Finalizing...</>
                      ) : (
                        <><CheckCircle size={16} /> Submit Assignment</>
                      )}
                    </button>
                    
                    <div className="flex items-start gap-2 mt-3 text-[11px] font-bold text-amber-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <p>Once submitted, your response cannot be edited.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Assignments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.get("/student/assignments");
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignment = async (id) => {
    try {
      const res = await api.get(`/student/assignments/${id}`);
      setSelected({ detail: res.data });
    } catch (e) {
      console.error("Failed to fetch assignment details", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
          <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
            <ClipboardList size={24} />
          </div>
          My Assignments
        </h1>
        <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
          Track your pending tasks, review instructions, and submit your work before the deadlines.
        </p>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium tracking-wide">Loading assignments...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Inbox size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            No Assignments Yet
          </h3>
          <p className="mt-2 text-slate-500 font-medium text-center max-w-sm">
            You're all caught up! New assignments will appear here when posted.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 pl-6">Assignment Title</th>
                  <th className="p-5">Program Details</th>
                  <th className="p-5">Deadline</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {rows.map((row) => {
                  const isSubmitted = row.submitted;
                  
                  return (
                    <tr 
                      key={row.id} 
                      className="group hover:bg-white/90 transition-all duration-300"
                    >
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                            <ClipboardList size={18} />
                          </div>
                          <div className="whitespace-normal min-w-0 max-w-md">
                            <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300 line-clamp-2 leading-tight">
                              {row.title}
                            </h3>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5 text-sm font-medium">
                          <span className="text-slate-700 flex items-center gap-2">
                            <BookOpen size={14} className="text-slate-400" /> 
                            {/* Adding fallback logic just in case course is nested inside batch */}
                            {row.course?.name || row.batch?.course?.name || "N/A"}
                          </span>
                          <span className="text-slate-500 flex items-center gap-2">
                            <Layers size={14} className="text-slate-400" /> 
                            {row.batch?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isSubmitted ? 'text-slate-500' : 'text-rose-600'}`}>
                          <CalendarClock size={14} className={isSubmitted ? "text-slate-400" : "text-rose-500"} />
                          {new Date(row.deadline).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest ${
                          isSubmitted 
                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' 
                            : 'bg-amber-50/80 text-amber-700 border-amber-200/60'
                        }`}>
                          {isSubmitted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                          {isSubmitted ? 'Completed' : 'Pending'}
                        </div>
                      </td>
                      <td className="p-5 pr-6 text-right">
                        <button
                          onClick={() => openAssignment(row.id)}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                            isSubmitted 
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                          }`}
                        >
                          {isSubmitted ? 'Review' : 'Start'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <AssignmentModal
          assignment={selected}
          onClose={() => setSelected(null)}
          onSubmitted={() => {
            setSelected(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}