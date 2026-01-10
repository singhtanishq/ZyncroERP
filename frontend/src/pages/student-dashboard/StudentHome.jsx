import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  Mail,
  Hash,
  BookOpen,
  Layers,
  ShieldCheck,
  FileText,
  Video,
  ClipboardList,
  CheckCircle2,
  Award,
  IndianRupee,
  Wallet,
  CreditCard,
  FileCheck,
  AlertCircle,
  ArrowUpRight,
  GraduationCap,
  Clock3,
  RefreshCcw,
  ArrowRight,
  UploadCloud,
  Search
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- SKELETON LOADER ---
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6 mt-4 w-full animate-pulse">
    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 md:p-8 flex flex-col md:flex-row gap-8">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-200/50 shrink-0"></div>
      <div className="flex flex-col w-full gap-3 justify-center">
        <div className="h-3 bg-slate-200/50 rounded-full w-32"></div>
        <div className="h-7 bg-slate-200/50 rounded-lg w-1/2"></div>
        <div className="h-3 bg-slate-200/50 rounded-full w-2/3"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 p-5 h-28"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 h-52"></div>
      ))}
    </div>
  </div>
);

export default function StudentHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/dashboard");
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data?.student?.name ? `Welcome, ${data.student.name.split(" ")[0]}` : "Student Dashboard"}
            </h1>
            <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
              Your central command center — track learning materials, examinations, and fee status.
            </p>
          </div>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DashboardSkeleton />
              </motion.div>
            ) : !data ? (
              <motion.div
                key="error-dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <AlertCircle size={48} className="text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Unable to Load Data</h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  We couldn't retrieve your dashboard information. Please try refreshing.
                </p>
              </motion.div>
            ) : data.dashboard_state === "not_enrolled" ? (

              <NotEnrolledDashboard />

            ) : data.dashboard_state === "pending" ? (

              <PendingEnrollmentDashboard data={data} />

            ) : (
              <motion.div
                key="dashboard-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8"
              >
                {/* ================= PROFILE CARD ================= */}
                <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-150 blur-3xl"></div>
                  
                  <div className="flex flex-col xl:flex-row gap-8 relative z-10">
                    {/* Identity Info */}
                    <div className="flex items-center gap-5 md:w-80 shrink-0 xl:border-r border-slate-200/60 xl:pr-8">
                      <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100/50 shrink-0 relative overflow-hidden">
                        <span className="text-2xl font-black tracking-tight">{getInitials(data.student.name)}</span>
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <User size={12} className="text-indigo-400" /> Student ID {data.student.sid}
                        </p>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight truncate">
                          {data.student.name}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 truncate mt-1">{data.student.email}</p>
                      </div>
                    </div>

                    {/* Academic Info */}
                    <div className="flex-1">

                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">

                      Active Enrollments

                    </div>

                    <div className="space-y-3">

                      {data.active_enrollments?.map((item, index) => {

                        const status = item.status?.toLowerCase();

                        const badge =
                          status === "completed"
                            ? {
                                text: "Completed",
                                bg: "bg-blue-50",
                                textColor: "text-blue-600",
                                border: "border-blue-100",
                              }
                            : status === "pending"
                            ? {
                                text: "Pending",
                                bg: "bg-amber-50",
                                textColor: "text-amber-600",
                                border: "border-amber-100",
                              }
                            : {
                                text: "Active",
                                bg: "bg-emerald-50",
                                textColor: "text-emerald-600",
                                border: "border-emerald-100",
                              };

                        return (

                          <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >

                            <div>

                              <div className="font-bold text-slate-800">

                                {item.course}

                              </div>

                              <div className="text-sm text-slate-500">

                                {item.batch}

                              </div>

                            </div>

                            <span
                              className={`mt-3 md:mt-0 inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase ${badge.bg} ${badge.textColor} ${badge.border}`}
                            >

                              <CheckCircle2 size={12} />

                              {badge.text}

                            </span>

                          </div>

                        );

                      })}
                    </div>

                  </div>
                  </div>
                </div>

                {/* ================= QUICK STATS ROW ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatTile to="/student/my-learning/study-materials" icon={FileText} label="Study Materials" value={data.learning.study_materials} />
                  <StatTile to="/student/my-learning/online-classes" icon={Video} label="Online Classes" value={data.learning.online_classes} />
                  <StatTile to="/student/assignments" icon={ClipboardList} label="Assignments" value={data.examination.assignments} />
                  <StatTile to="/student/certificates" icon={Award} label="Certificates" value={data.certificates.issued} />
                </div>

                {/* ================= LEARNING + EXAMINATION ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Section title="Learning Resources" icon={BookOpen}>
                    <SectionRow to="/student/my-learning/study-materials" icon={FileText} label="Study Materials" value={data.learning.study_materials} />
                    <SectionRow to="/student/my-learning/online-classes" icon={Video} label="Online Classes" value={data.learning.online_classes} isLast />
                  </Section>

                  <Section title="Examination Center" icon={ClipboardList}>
                    <SectionRow to="/student/assignments" icon={ClipboardList} label="Assignments" value={data.examination.assignments} />
                    <SectionRow to="/student/assignments" icon={CheckCircle2} label="Submitted Work" value={data.examination.submitted_assignments} isLast />
                  </Section>
                </div>

                {/* ================= FINANCIAL TRACKING ================= */}
                <Section title="Financial Tracking" icon={Wallet}>

                  <div className="divide-y divide-slate-100">

                    {data.payments?.map((payment, index) => (

                      <div
                        key={index}
                        className="p-6 hover:bg-slate-50/70 transition"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

                          <div>

                            <h3 className="font-bold text-slate-800">

                              {payment.course_name}

                            </h3>

                            <p className="text-sm text-slate-500">

                              {payment.batch_name}

                            </p>

                          </div>

                          <Link
                            to="/student/payments/track-fees"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                          >

                            View Details →

                          </Link>

                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">

                          <FinanceStat
                            icon={IndianRupee}
                            label="Total Fees"
                            value={`₹${payment.total_fees}`}
                          />

                          <FinanceStat
                            icon={Wallet}
                            label="Paid"
                            value={`₹${payment.paid_fees}`}
                            tone="emerald"
                          />

                          <FinanceStat
                            icon={CreditCard}
                            label="Remaining"
                            value={`₹${payment.remaining_fees}`}
                            tone="rose"
                          />

                          <FinanceStat
                            icon={FileCheck}
                            label="Proof"
                            value={payment.proof_status.replaceAll("_", " ")}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </Section>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ================= REUSABLE UI COMPONENTS =================

function InfoStat({ icon: Icon, label, value, badge }) {
  return (
    <div className="flex flex-col gap-2 justify-center">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Icon size={14} className="text-indigo-400" />
        {label}
      </div>
      {badge ? (
        <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 shadow-sm">
          <CheckCircle2 size={14} /> {value}
        </span>
      ) : (
        <span className="text-base font-bold text-slate-700 truncate">{value || "—"}</span>
      )}
    </div>
  );
}

function StatTile({ to, icon: Icon, label, value }) {
  return (
    <Link
      to={to}
      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center gap-5 hover:bg-white/90 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="p-3 bg-slate-50 border border-slate-100/60 text-indigo-500 rounded-2xl shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{value}</p>
      </div>
    </Link>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100/60 bg-white/40">
        <Icon size={18} className="text-indigo-500" />
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="flex flex-col h-full">{children}</div>
    </div>
  );
}

function SectionRow({ to, icon: Icon, label, value, isLast }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between gap-4 px-6 py-5 hover:bg-white/60 transition-colors group ${
        !isLast ? "border-b border-slate-100/60" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
        <span className="text-sm font-bold text-slate-600 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xl font-black text-slate-800 tracking-tight">{value}</span>
        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
      </div>
    </Link>
  );
}

function FinanceCell({ to, icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "text-slate-500 group-hover:text-slate-700",
    emerald: "text-emerald-500 group-hover:text-emerald-600",
    rose: "text-rose-500 group-hover:text-rose-600",
    indigo: "text-indigo-500 group-hover:text-indigo-600",
  };

  return (
    <Link
      to={to}
      className="flex flex-col gap-2.5 px-6 py-6 hover:bg-white/60 transition-colors group"
    >
      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${tones[tone]}`}>
        <Icon size={16} />
        {label}
      </div>
      <span className="text-2xl font-black text-slate-800 tracking-tight capitalize truncate">{value}</span>
    </Link>
  );
}

/* ==========================================================
      DASHBOARD STATE : NOT ENROLLED
========================================================== */

function NotEnrolledDashboard() {
  return (
    <motion.div
      key="not-enrolled"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden group"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none"></div>

      <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100/50 mb-6 relative z-10">
        <GraduationCap size={36} />
      </div>

      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">
        No Course Enrolled
      </h2>
      <p className="mt-4 text-slate-500 max-w-lg leading-relaxed relative z-10">
        You are not enrolled in any course yet. Begin your learning journey by applying for a course from the Enrollment Center.
      </p>

      <Link
        to="/student/enroll-course"
        className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow relative z-10"
      >
        <BookOpen size={18} />
        Browse Available Courses
      </Link>
    </motion.div>
  );
}

/* ==========================================================
      DASHBOARD STATE : PENDING ENROLLMENT
========================================================== */

function PendingEnrollmentDashboard({ data }) {
  const enrollment = data.pending_enrollment;

  return (
    <motion.div
      key="pending-enrolled"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
    >
      {/* Top Banner */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner border border-amber-100/50 shrink-0">
              <Clock3 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enrollment Under Review</h2>
              <p className="mt-1.5 text-slate-500 font-medium">Your enrollment request is currently awaiting administrative approval.</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
             <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm bg-amber-50/80 text-amber-700 border-amber-200/60">
               <Clock3 size={16} /> {enrollment?.status || "Pending"}
             </span>
          </div>
        </div>

        {/* Program Details row */}
        <div className="mt-8 bg-slate-50/50 border border-slate-100/60 rounded-2xl flex flex-col sm:flex-row overflow-hidden">
          <div className="flex-1 p-5 border-b sm:border-b-0 sm:border-r border-slate-100/60 flex items-center gap-4">
            <BookOpen size={20} className="text-indigo-400 shrink-0"/>
            <div className="min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Program</p>
               <p className="text-sm font-bold text-slate-800 truncate">{enrollment?.course || "—"}</p>
            </div>
          </div>
          <div className="flex-1 p-5 flex items-center gap-4">
            <Layers size={20} className="text-indigo-400 shrink-0"/>
            <div className="min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cohort Batch</p>
               <p className="text-sm font-bold text-slate-800 truncate">{enrollment?.batch || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Grid */}
      <h3 className="text-lg font-extrabold text-slate-800 mt-4 px-2">Next Steps</h3>
      
      <div className="grid md:grid-cols-3 gap-6">
        <PendingActionCard 
          to="/student/payments/make-payment"
          icon={Wallet}
          title="Clear Pending Fees"
          desc="Complete your course fee payment to finalize the admission process."
          actionText="Pay Now"
        />
        <PendingActionCard 
          to="/student/upload-payment-proof"
          icon={UploadCloud}
          title="Upload Evidence"
          desc="Already paid? Upload your transaction proof for manual verification."
          actionText="Upload Proof"
        />
        <PendingActionCard 
          to="/student/payments/track-fees"
          icon={Search}
          title="Track Status"
          desc="Check whether your fee submission has been successfully verified."
          actionText="Check Status"
        />
      </div>

    </motion.div>
  );
}

function PendingActionCard({ to, icon: Icon, title, desc, actionText }) {
  return (
    <Link
      to={to}
      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col h-full hover:bg-white/90 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl w-fit mb-5 shadow-sm group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <h4 className="font-extrabold text-lg text-slate-800 tracking-tight mb-2 group-hover:text-indigo-900 transition-colors">
        {title}
      </h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">
        {desc}
      </p>
      <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 mt-auto group-hover:gap-3 transition-all">
        {actionText} <ArrowRight size={16} />
      </div>
    </Link>
  );
}

function FinanceStat({
  icon: Icon,
  label,
  value,
  tone = "slate",
}) {

  const colors = {
    slate: "text-slate-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
  };

  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">

      <div
        className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${colors[tone]}`}
      >

        <Icon size={14} />

        {label}

      </div>

      <div className="mt-2 text-xl font-black text-slate-800 capitalize">

        {value}

      </div>

    </div>

  );

}