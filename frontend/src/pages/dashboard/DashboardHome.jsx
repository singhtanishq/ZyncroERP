import React, { useEffect, useState } from "react";
import api from "../../lib/api/apiClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import {
  Users,
  BookOpen,
  GraduationCap,
  IndianRupee,
  Store,
  Wallet,
  MailWarning,
  UserPlus,
  Clock,
  CheckCircle2,
  FileText,
  Award,
  Video,
  Radio,
  PlayCircle,
  TrendingUp,
  Inbox,
  ArrowRight,
  ShieldAlert,
  ClipboardCheck,
  Building2,
  Layers
} from "lucide-react";
import useAuth from "../../lib/auth/useAuth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData({ error: true }));
  }, []);

  if (!data) return <DashboardSkeleton />;

  return (
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans overflow-x-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Scrollbar Styling for internal lists */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { width: 6px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 md:space-y-8"
      >
        <Header user={user} />

        {/* TOP LEVEL KPIs */}
        <TopKPISection data={data} />

        {/* CRITICAL ALERTS */}
        <AlertsSection data={data} />

        {/* MAIN CHARTS */}
        <ChartsSection data={data} />

        {/* GRANULAR METRICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <motion.div variants={itemVariants} className="flex flex-col gap-6 md:gap-8 w-full">
            <AcademicSection data={data} />
            <ClassSection data={data} />
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col gap-6 md:gap-8 w-full">
            <FinanceSection data={data} />
            <ExamSection data={data} />
          </motion.div>
        </div>

        {/* RECENT ACTIVITY FEEDS */}
        <RecentSection data={data} />

      </motion.div>
    </div>
  );
}

/* ================= HEADER ================= */
function Header({ user }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <Users size={14} strokeWidth={2.5} />
          Administration Overview
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
          {greeting}, {user?.name || "Administrator"}
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-2xl leading-relaxed">
          Here's the overview of system operations, financial health, and academic performance.
        </p>
      </div>
      <div className="bg-[rgb(var(--zx-surface))] px-5 py-3 rounded-2xl border border-[rgb(var(--zx-border))] flex items-center gap-3 shrink-0 w-fit shadow-sm">
        <Clock size={16} className="text-brand-teal-500" />
        <span className="text-xs font-bold text-[rgb(var(--zx-text))] uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}

/* ================= COMPREHENSIVE LOADING SKELETON ================= */
function DashboardSkeleton() {
  return (
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-6 md:space-y-8 font-sans">
      <div className="animate-pulse space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full">
            <div className="h-6 bg-[rgb(var(--zx-surface-hover))] rounded-full w-32 mb-3"></div>
            <div className="h-10 bg-[rgb(var(--zx-surface-hover))] rounded-xl w-3/4 sm:w-1/3 mb-2"></div>
            <div className="h-4 bg-[rgb(var(--zx-surface-hover))] rounded-lg w-full sm:w-1/2"></div>
          </div>
          <div className="h-12 bg-[rgb(var(--zx-surface-hover))] rounded-2xl w-48 shrink-0"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= TOP KPIs ================= */
function TopKPISection({ data }) {
  const kpis = [
    { 
      title: "Total Revenue", 
      value: `₹${Number(data.stats.revenue).toLocaleString("en-IN")}`, 
      icon: IndianRupee, 
      color: "from-brand-teal-500 to-emerald-400", 
      light: "bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20" 
    },
    { title: "Active Students", value: data.stats.students, icon: Users, color: "from-brand-blue-500 to-indigo-500", light: "bg-brand-blue-500/10 text-brand-blue-500 border border-brand-blue-500/20" },
    { title: "Total Faculties", value: data.stats.faculties, icon: GraduationCap, color: "from-purple-500 to-fuchsia-500", light: "bg-purple-500/10 text-purple-500 border border-purple-500/20" },
    { title: "Active Courses", value: data.stats.courses, icon: BookOpen, color: "from-amber-500 to-orange-400", light: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
    { title: "Pending Payments", value: data.stats.pending_payments, icon: Wallet, color: "from-rose-500 to-pink-500", light: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
    { title: "Franchise Branches", value: data.stats.franchises, icon: Store, color: "from-cyan-500 to-sky-500", light: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" },
  ];

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-[rgb(var(--zx-surface))] rounded-3xl p-6 border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-teal-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${kpi.light} flex items-center justify-center shadow-sm shrink-0`}>
              <kpi.icon size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1 truncate">{kpi.title}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight truncate">{kpi.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ================= ALERTS SECTION ================= */
function AlertsSection({ data }) {
  const hasAlerts = data.alerts.pending_users > 0 || data.alerts.failed_emails > 0;
  
  if (!hasAlerts) return null;

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
      {data.alerts.pending_users > 0 && (
        <Link to="/dashboard/users/pending" className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex items-center justify-between shadow-sm overflow-hidden hover:bg-amber-500/20 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 text-amber-500 p-3 rounded-2xl relative shrink-0 group-hover:scale-105 transition-transform border border-amber-500/30">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
              <UserPlus size={22} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[rgb(var(--zx-text))] font-bold text-base truncate flex items-center gap-2">
                Pending Approvals
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-amber-500" />
              </h4>
              <p className="text-[rgb(var(--zx-text-muted))] text-xs font-semibold truncate hidden sm:block">Users waiting for verification</p>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 pl-4">{data.alerts.pending_users}</div>
        </Link>
      )}

      {data.alerts.failed_emails > 0 && (
        <Link to="/dashboard/communication/logs" className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-center justify-between shadow-sm overflow-hidden hover:bg-rose-500/20 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 text-rose-500 p-3 rounded-2xl relative shrink-0 group-hover:scale-105 transition-transform border border-rose-500/30">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <MailWarning size={22} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[rgb(var(--zx-text))] font-bold text-base truncate flex items-center gap-2">
                Failed Emails
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-rose-500" />
              </h4>
              <p className="text-[rgb(var(--zx-text-muted))] text-xs font-semibold truncate hidden sm:block">Messages not delivered</p>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-500 pl-4">{data.alerts.failed_emails}</div>
        </Link>
      )}
    </motion.div>
  );
}

/* ================= CHARTS ================= */
function ChartsSection({ data }) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Inter', weight: 'bold' },
        bodyFont: { size: 13, family: 'Inter', weight: 'bold' },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { font: { family: 'Inter', weight: '600', size: 11 }, color: 'rgb(var(--zx-text-muted))' }, 
        border: { display: false } 
      },
      y: { 
        grid: { color: 'rgba(148, 163, 184, 0.15)', drawBorder: false }, 
        ticks: { font: { family: 'Inter', weight: '600', size: 11 }, color: 'rgb(var(--zx-text-muted))', maxTicksLimit: 6 }, 
        border: { display: false } 
      }
    },
    interaction: { intersect: false, mode: 'index' },
  };

  const revenueData = {
    labels: data.charts.revenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.charts.revenue.map((r) => r.total),
        borderColor: '#14b8a6', // brand-teal-500
        backgroundColor: (context) => {
            const ctx = context?.chart?.ctx;
            if(!ctx) return 'transparent';
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(20, 184, 166, 0.12)');
            gradient.addColorStop(1, 'rgba(20, 184, 166, 0.00)');
            return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(var(--zx-surface))',
        pointBorderColor: '#14b8a6',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const studentData = {
    labels: data.charts.students.map((s) => s.month),
    datasets: [
      {
        label: "New Students",
        data: data.charts.students.map((s) => s.total),
        backgroundColor: 'rgba(59, 130, 246, 0.45)', // very light brand-blue
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.65)',
        borderColor: 'transparent',
        borderRadius: 6,
        barPercentage: 0.45,
      },
    ],
  };

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 w-full relative z-10">
      <div className="bg-[rgb(var(--zx-surface))] p-5 sm:p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))]">Revenue Trajectory</h3>
                <p className="text-xs font-semibold text-[rgb(var(--zx-text-muted))] mt-0.5 hidden sm:block">Monthly financial inflow overview</p>
            </div>
            <div className="p-2.5 bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 rounded-xl shrink-0">
                <TrendingUp size={18} />
            </div>
        </div>
        <div className="relative w-full min-h-[300px] flex-1">
          <Line data={revenueData} options={{...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, ticks: { ...commonOptions.scales.y.ticks, callback: (val) => '₹' + val } } } }} />
        </div>
      </div>

      <div className="bg-[rgb(var(--zx-surface))] p-5 sm:p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))]">Enrollment Growth</h3>
                <p className="text-xs font-semibold text-[rgb(var(--zx-text-muted))] mt-0.5 hidden sm:block">New student registrations per month</p>
            </div>
            <div className="p-2.5 bg-brand-blue-500/10 border border-brand-blue-500/20 text-brand-blue-500 rounded-xl shrink-0">
                <Users size={18} />
            </div>
        </div>
        <div className="relative w-full min-h-[300px] flex-1">
          <Bar data={studentData} options={commonOptions} />
        </div>
      </div>
    </motion.div>
  );
}

/* ================= GRANULAR SECTIONS ================= */
function MetricCard({ icon: Icon, title, value, colorClass }) {
    return (
        <div className="bg-[rgb(var(--zx-surface-hover))] rounded-2xl p-4 border border-[rgb(var(--zx-border))] flex items-center gap-4 transition-colors group w-full overflow-hidden">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110 border ${colorClass}`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-0.5 truncate">{title}</p>
                <h4 className="text-base sm:text-lg font-extrabold text-[rgb(var(--zx-text))] truncate">{value}</h4>
            </div>
        </div>
    );
}

function SectionWrapper({ title, icon: Icon, children }) {
    return (
        <div className="bg-[rgb(var(--zx-surface))] p-5 sm:p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col w-full relative z-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgb(var(--zx-border))] shrink-0">
                <div className="p-2 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-brand-teal-500 rounded-xl">
                    <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] truncate">{title}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {children}
            </div>
        </div>
    );
}

function FinanceSection({ data }) {
  return (
    <SectionWrapper title="Financial Logistics" icon={Building2}>
      <MetricCard 
        icon={IndianRupee} 
        title="Total Revenue" 
        value={`₹${Number(data.stats.revenue).toLocaleString("en-IN")}`} 
        colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
      />
      <MetricCard 
        icon={Wallet} 
        title="Pending Payments" 
        value={Number(data.stats.pending_payments).toLocaleString("en-IN")} 
        colorClass="bg-rose-500/10 text-rose-500 border-rose-500/20" 
      />
      <MetricCard 
        icon={ShieldAlert} 
        title="Failed Emails" 
        value={data.alerts.failed_emails} 
        colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20" 
      />
      <MetricCard 
        icon={UserPlus} 
        title="Pending Approvals" 
        value={data.alerts.pending_users} 
        colorClass="bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20" 
      />
    </SectionWrapper>
  );
}

function AcademicSection({ data }) {
  return (
    <SectionWrapper title="Academic Infrastructure" icon={Layers}>
      <MetricCard icon={Users} title="Total Students" value={data.stats.students} colorClass="bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20" />
      <MetricCard icon={BookOpen} title="Active Courses" value={data.stats.courses} colorClass="bg-brand-teal-500/10 text-brand-teal-500 border-brand-teal-500/20" />
      <MetricCard icon={Layers} title="Total Batches" value={data.stats.batches || 0} colorClass="bg-purple-500/10 text-purple-600 border-purple-500/20" />
      <MetricCard icon={Award} title="Certificates" value={data.stats.certificates || 0} colorClass="bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20" />
    </SectionWrapper>
  );
}

function ExamSection({ data }) {
  return (
    <SectionWrapper title="Examination Metrics" icon={ClipboardCheck}>
      <MetricCard icon={FileText} title="Total Exams" value={data.stats.exams || 0} colorClass="bg-cyan-500/10 text-cyan-600 border-cyan-500/20" />
      <MetricCard icon={UserPlus} title="Admit Cards" value={data.stats.admit_cards || 0} colorClass="bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20" />
      <MetricCard icon={CheckCircle2} title="Results Published" value={data.stats.results || 0} colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" />
      <MetricCard icon={Award} title="Certificates" value={data.stats.certificates || 0} colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20" />
    </SectionWrapper>
  );
}

function ClassSection({ data }) {
  return (
    <SectionWrapper title="Virtual Classrooms" icon={Video}>
      <MetricCard icon={Clock} title="Upcoming Sessions" value={data.stats.upcoming_classes || 0} colorClass="bg-brand-teal-500/10 text-brand-teal-500 border-brand-teal-500/20" />
      <MetricCard icon={Radio} title="Currently Live" value={data.stats.live_classes || 0} colorClass="bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse" />
      <MetricCard icon={PlayCircle} title="Completed Classes" value={data.stats.completed_classes || 0} colorClass="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]" />
      <MetricCard icon={Users} title="Est. Attendance" value="N/A" colorClass="bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20" />
    </SectionWrapper>
  );
}

const getValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj);
};

/* ================= RECENT ACTIVITY ================= */
function RecentListCard({ title, icon: Icon, data, field, valuePrefix = "", valueSuffix = "", isMonetary = false, link }) {
    return (
        <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col overflow-hidden w-full h-full max-h-[420px] relative z-10">
            <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-brand-teal-500">
                        <Icon size={16} />
                    </div>
                    <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm truncate">{title}</h3>
                </div>
                <Link to={link} className="text-[11px] font-bold text-brand-teal-500 uppercase tracking-widest hover:text-brand-teal-600 flex items-center gap-1 group shrink-0">
                  View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto custom-dashboard-scroll">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px] p-8 text-[rgb(var(--zx-text-muted))]">
                        <Inbox size={32} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">No recent activity</span>
                    </div>
                ) : (
                    <ul className="space-y-1">
                    {data.map((item, idx) => (
                        <li key={item.id || idx} className="flex items-center justify-between p-3 hover:bg-[rgb(var(--zx-surface-hover))] rounded-2xl transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] flex items-center justify-center font-bold text-[rgb(var(--zx-text))] text-xs shrink-0">
                                    {isMonetary ? '₹' : getValue(item, field)?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-[rgb(var(--zx-text))] truncate group-hover:text-brand-teal-500 transition-colors">
                                        {valuePrefix}{getValue(item, field)}{valueSuffix}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--zx-text-muted))] mt-0.5">
                                        <Clock size={12} className="shrink-0" />
                                        <span className="truncate">
                                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function RecentSection({ data }) {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 items-start w-full">
      <RecentListCard 
        title="Enrollments" 
        icon={UserPlus} 
        data={data.recent.students} 
        field="user.name"
        link="/dashboard/students"
      />

      <RecentListCard 
        title="Transactions" 
        icon={Wallet} 
        data={data.recent.payments} 
        field="amount" 
        valuePrefix="₹"
        isMonetary={true}
        link="/dashboard/payments/history"
      />

      <RecentListCard 
        title="Registrations" 
        icon={Users} 
        data={data.recent.users} 
        field="name"
        link="/dashboard/users/manage"
      />
    </motion.div>
  );
}