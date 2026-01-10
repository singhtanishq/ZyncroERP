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
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  IndianRupee,
  AlertCircle,
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
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      {/* Scrollbar Styling for internal lists */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { width: 5px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
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
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {greeting}, {user?.name || "Administrator"}
        </h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl text-sm sm:text-base">
          Here's the overview of system operations, financial health, and academic performance.
        </p>
      </div>
      <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 shrink-0 w-fit">
        <Clock size={18} className="text-slate-400" />
        <span className="text-sm font-bold text-slate-700">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}

/* ================= COMPREHENSIVE LOADING SKELETON ================= */
function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 pb-24">
      <div className="animate-pulse space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full">
            <div className="h-10 bg-slate-200 rounded-xl w-3/4 sm:w-1/3 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-full sm:w-1/2"></div>
          </div>
          <div className="h-12 bg-slate-200 rounded-2xl w-48 shrink-0"></div>
        </div>

        {/* KPI Grid Skeleton (6 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
          ))}
        </div>

        {/* Alerts Skeleton (2 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
          ))}
        </div>

        {/* Main Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-[380px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
          ))}
        </div>

        {/* Granular Metrics Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="flex flex-col gap-6 md:gap-8 w-full">
            <div className="h-[320px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
            <div className="h-[320px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
          </div>
          <div className="flex flex-col gap-6 md:gap-8 w-full">
            <div className="h-[320px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
            <div className="h-[320px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
          </div>
        </div>

        {/* Recent Activity Skeleton (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[400px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
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
      color: "from-emerald-500 to-teal-400", 
      light: "bg-emerald-50 text-emerald-600" 
    },
    { title: "Active Students", value: data.stats.students, icon: Users, color: "from-blue-600 to-indigo-500", light: "bg-blue-50 text-blue-600" },
    { title: "Total Faculties", value: data.stats.faculties, icon: GraduationCap, color: "from-purple-600 to-fuchsia-500", light: "bg-purple-50 text-purple-600" },
    { title: "Active Courses", value: data.stats.courses, icon: BookOpen, color: "from-amber-500 to-orange-400", light: "bg-amber-50 text-amber-600" },
    { title: "Pending Payments", value: data.stats.pending_payments, icon: Wallet, color: "from-rose-500 to-pink-500", light: "bg-rose-50 text-rose-600" },
    { title: "Franchise Branches", value: data.stats.franchises, icon: Store, color: "from-cyan-600 to-sky-500", light: "bg-cyan-50 text-cyan-600" },
  ];

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
          <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${kpi.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${kpi.light} flex items-center justify-center shadow-sm shrink-0`}>
              <kpi.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{kpi.title}</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight truncate">{kpi.value}</h3>
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
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {data.alerts.pending_users > 0 && (
        <Link to="/dashboard/users/pending" className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center justify-between shadow-sm overflow-hidden hover:bg-amber-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl relative shrink-0 group-hover:scale-105 transition-transform">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></span>
              <UserPlus size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-amber-900 font-bold text-lg truncate flex items-center gap-2">
                Pending Approvals
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-amber-600" />
              </h4>
              <p className="text-amber-700 text-sm font-medium truncate hidden sm:block">Users waiting for verification</p>
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 pl-4">{data.alerts.pending_users}</div>
        </Link>
      )}

      {data.alerts.failed_emails > 0 && (
        <Link to="/dashboard/communication/logs" className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-center justify-between shadow-sm overflow-hidden hover:bg-rose-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl relative shrink-0 group-hover:scale-105 transition-transform">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
              <MailWarning size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-rose-900 font-bold text-lg truncate flex items-center gap-2">
                Failed Emails
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-rose-600" />
              </h4>
              <p className="text-rose-700 text-sm font-medium truncate hidden sm:block">Messages not delivered</p>
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 pl-4">{data.alerts.failed_emails}</div>
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
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', weight: '500' }, color: '#64748b' }, border: { display: false } },
      y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { family: 'Inter', weight: '500' }, color: '#64748b', maxTicksLimit: 6 }, border: { display: false } }
    },
    interaction: { intersect: false, mode: 'index' },
  };

  const revenueData = {
    labels: data.charts.revenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.charts.revenue.map((r) => r.total),
        borderColor: '#4f46e5', // indigo-600
        backgroundColor: (context) => {
            const ctx = context?.chart?.ctx;
            if(!ctx) return 'transparent';
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');
            return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const studentData = {
    labels: data.charts.students.map((s) => s.month),
    datasets: [
      {
        label: "New Students",
        data: data.charts.students.map((s) => s.total),
        backgroundColor: '#0ea5e9', // sky-500
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 w-full">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Revenue Trajectory</h3>
                <p className="text-sm font-medium text-slate-400 mt-1 hidden sm:block">Monthly financial inflow overview</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <TrendingUp size={20} />
            </div>
        </div>
        <div className="relative w-full min-h-[300px] flex-1">
          <Line data={revenueData} options={{...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, ticks: { ...commonOptions.scales.y.ticks, callback: (val) => '₹' + val } } } }} />
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Enrollment Growth</h3>
                <p className="text-sm font-medium text-slate-400 mt-1 hidden sm:block">New student registrations per month</p>
            </div>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
                <Users size={20} />
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
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:bg-slate-100 transition-colors group w-full overflow-hidden">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">{title}</p>
                <h4 className="text-lg sm:text-xl font-black text-slate-800 truncate">{value}</h4>
            </div>
        </div>
    );
}

function SectionWrapper({ title, icon: Icon, children }) {
    return (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col w-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">{title}</h3>
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
        colorClass="bg-emerald-100 text-emerald-600" 
      />
      <MetricCard 
        icon={Wallet} 
        title="Pending Payments" 
        value={Number(data.stats.pending_payments).toLocaleString("en-IN")} 
        colorClass="bg-rose-100 text-rose-600" 
      />
      <MetricCard 
        icon={ShieldAlert} 
        title="Failed Emails" 
        value={data.alerts.failed_emails} 
        colorClass="bg-amber-100 text-amber-600" 
      />
      <MetricCard 
        icon={UserPlus} 
        title="Pending Approvals" 
        value={data.alerts.pending_users} 
        colorClass="bg-blue-100 text-blue-600" 
      />
    </SectionWrapper>
  );
}

function AcademicSection({ data }) {
  return (
    <SectionWrapper title="Academic Infrastructure" icon={Layers}>
      <MetricCard icon={Users} title="Total Students" value={data.stats.students} colorClass="bg-blue-100 text-blue-600" />
      <MetricCard icon={BookOpen} title="Active Courses" value={data.stats.courses} colorClass="bg-indigo-100 text-indigo-600" />
      <MetricCard icon={Layers} title="Total Batches" value={data.stats.batches || 0} colorClass="bg-purple-100 text-purple-600" />
      <MetricCard icon={Award} title="Certificates" value={data.stats.certificates || 0} colorClass="bg-fuchsia-100 text-fuchsia-600" />
    </SectionWrapper>
  );
}

function ExamSection({ data }) {
  return (
    <SectionWrapper title="Examination Metrics" icon={ClipboardCheck}>
      <MetricCard icon={FileText} title="Total Exams" value={data.stats.exams || 0} colorClass="bg-sky-100 text-sky-600" />
      <MetricCard icon={UserPlus} title="Admit Cards" value={data.stats.admit_cards || 0} colorClass="bg-cyan-100 text-cyan-600" />
      <MetricCard icon={CheckCircle2} title="Results Published" value={data.stats.results || 0} colorClass="bg-emerald-100 text-emerald-600" />
      <MetricCard icon={Award} title="Certificates" value={data.stats.certificates || 0} colorClass="bg-amber-100 text-amber-600" />
    </SectionWrapper>
  );
}

function ClassSection({ data }) {
  return (
    <SectionWrapper title="Virtual Classrooms" icon={Video}>
      <MetricCard icon={Clock} title="Upcoming Sessions" value={data.stats.upcoming_classes || 0} colorClass="bg-indigo-100 text-indigo-600" />
      <MetricCard icon={Radio} title="Currently Live" value={data.stats.live_classes || 0} colorClass="bg-rose-100 text-rose-600 animate-pulse" />
      <MetricCard icon={PlayCircle} title="Completed Classes" value={data.stats.completed_classes || 0} colorClass="bg-slate-200 text-slate-600" />
      <MetricCard icon={Users} title="Est. Attendance" value="N/A" colorClass="bg-blue-100 text-blue-600" />
    </SectionWrapper>
  );
}

const getValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj);
};

/* ================= RECENT ACTIVITY ================= */
function RecentListCard({ title, icon: Icon, data, field, valuePrefix = "", valueSuffix = "", isMonetary = false, link }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden w-full h-full max-h-[420px]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg truncate">{title}</h3>
                </div>
                <Link to={link} className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 flex items-center gap-1 group shrink-0">
                  View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto custom-dashboard-scroll">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px] p-8 text-slate-400">
                        <Inbox size={32} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">No recent activity</span>
                    </div>
                ) : (
                    <ul className="space-y-1">
                    {data.map((item, idx) => (
                        <li key={item.id || idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 border border-slate-200/60">
                                    {isMonetary ? '₹' : getValue(item, field)?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                        {valuePrefix}{getValue(item, field)}{valueSuffix}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-0.5">
                                        <Clock size={10} className="shrink-0" />
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