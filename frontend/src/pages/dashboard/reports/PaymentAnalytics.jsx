import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Wallet,
  GraduationCap,
  Building2,
  Globe,
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  Store,
  CreditCard,
  IndianRupee,
  Activity
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

export default function PaymentAnalytics() {
  const [studentFees, setStudentFees] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [externalPayments, setExternalPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, franchise, external] = await Promise.all([
          api.get("/student-fees"),
          api.get("/franchise-payments"),
          api.get("/external-payments"),
        ]);

        setStudentFees(students.data || []);
        setFranchiseData(franchise.data?.data || []);
        setExternalPayments(external.data || []);
      } catch (e) {
        console.error("Analytics load failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= CALCULATIONS ================= */

  const totalStudentRevenue = studentFees.reduce(
    (sum, s) => sum + Number(s.paid_fees || 0), 0
  );

  const totalFranchiseRevenue = franchiseData.reduce(
    (sum, f) => sum + Number(f.total_revenue || 0), 0
  );

  const successfulExternalPayments = externalPayments.filter(
    (p) =>
      p.status === "success" ||
      p.status === "paid" ||
      p.status === "SUCCESS"
  );

  const totalExternalRevenue = successfulExternalPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0), 0
  );

  const totalRevenue =
    totalStudentRevenue + totalFranchiseRevenue + totalExternalRevenue;

  /* ================= CHART DATA ================= */

  const revenueSplit = [
    { name: "Students", value: totalStudentRevenue },
    { name: "Franchise", value: totalFranchiseRevenue },
    { name: "External", value: totalExternalRevenue },
  ];

  const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b"];
  const STATUS_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

  const topStudents = [...studentFees]
    .sort((a, b) => b.paid_fees - a.paid_fees)
    .slice(0, 5)
    .map((s) => ({
      name: s.name,
      paid: Number(s.paid_fees || 0),
    }));

  const topFranchise = [...franchiseData]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5)
    .map((f) => ({
      name: f.name,
      revenue: Number(f.total_revenue || 0),
    }));

  /* STUDENT STATUS */
  const studentStatusData = [
    {
      name: "Paid",
      value: studentFees.filter((s) => s.status === "paid").length,
    },
    {
      name: "Partial",
      value: studentFees.filter((s) => s.status === "partial").length,
    },
    {
      name: "Pending",
      value: studentFees.filter((s) => s.status === "pending").length,
    },
  ];

  /* FRANCHISE STATUS */
  const franchiseStatusData = [
    {
      name: "Paid",
      value: franchiseData.filter((f) => f.status === "paid").length,
    },
    {
      name: "Partial",
      value: franchiseData.filter((f) => f.status === "partial").length,
    },
    {
      name: "Pending",
      value: franchiseData.filter((f) => f.status === "pending").length,
    },
  ];

  /* ================= UI HELPERS ================= */
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] text-xs rounded-xl py-2.5 px-4 shadow-xl border border-[rgb(var(--zx-border))] backdrop-blur-xl">
          <p className="font-bold mb-1 opacity-80 uppercase tracking-wider">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-base font-black flex items-center gap-1 text-brand-teal-500">
            <IndianRupee size={14} /> {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase() || "unknown";
    if (s === "paid" || s === "success") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Paid / Success</span>;
    if (s === "partial") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-amber-500/10 text-amber-500 border-amber-500/20">Partial</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-500/10 text-rose-500 border-rose-500/20">{status || "Pending"}</span>;
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-pulse font-sans">
        <div>
          <div className="w-32 h-5 bg-[rgb(var(--zx-surface-hover))] rounded-md mb-3"></div>
          <div className="w-72 sm:w-96 h-10 bg-[rgb(var(--zx-surface-hover))] rounded-xl mb-3"></div>
          <div className="w-full max-w-2xl h-4 bg-[rgb(var(--zx-surface-hover))] rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-[rgb(var(--zx-surface-hover))] rounded-3xl"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-[400px] bg-[rgb(var(--zx-surface-hover))] rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans overflow-x-hidden">
       <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
      `}</style>

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
              <Activity size={14} strokeWidth={2.5} />
              Financial Overview
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
               Payment Analytics
            </h1>
            <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-2xl leading-relaxed">
              Comprehensive breakdown of organizational revenue, distributed across internal students, franchises, and external endpoints.
            </p>
          </div>
        </motion.div>

        {/* KPI CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl p-6 border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-teal-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 flex items-center justify-center shadow-sm">
                <Wallet size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1">Total System Revenue</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight flex items-baseline">
                  <span className="text-lg text-[rgb(var(--zx-text-muted))] mr-1">₹</span>{totalRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl p-6 border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-blue-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-500/10 border border-brand-blue-500/20 text-brand-blue-500 flex items-center justify-center shadow-sm">
                <GraduationCap size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1">Student Receipts</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight flex items-baseline">
                  <span className="text-lg text-[rgb(var(--zx-text-muted))] mr-1">₹</span>{totalStudentRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl p-6 border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-sm">
                <Building2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1">Franchise Volume</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight flex items-baseline">
                  <span className="text-lg text-[rgb(var(--zx-text-muted))] mr-1">₹</span>{totalFranchiseRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl p-6 border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-sm">
                <Globe size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1">External Operations</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight flex items-baseline">
                  <span className="text-lg text-[rgb(var(--zx-text-muted))] mr-1">₹</span>{totalExternalRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

        </motion.div>

        {/* MAIN CHARTS ROW 1 */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          <div className="bg-[rgb(var(--zx-surface))] p-6 md:p-8 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-base font-bold text-[rgb(var(--zx-text))]">Revenue Distribution</h3>
                    <p className="text-xs font-semibold text-[rgb(var(--zx-text-muted))] mt-0.5">Holistic split across income channels</p>
                </div>
                <div className="p-2.5 bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 rounded-xl">
                    <PieChartIcon size={20} />
                </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(var(--zx-text-muted))' }}/>
                  <Pie 
                    data={revenueSplit} 
                    dataKey="value" 
                    innerRadius={70}
                    outerRadius={100} 
                    paddingAngle={5}
                    stroke="none"
                    label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {revenueSplit.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] p-6 md:p-8 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-base font-bold text-[rgb(var(--zx-text))]">Top Performing Students</h3>
                    <p className="text-xs font-semibold text-[rgb(var(--zx-text-muted))] mt-0.5">Highest individual fee contributions</p>
                </div>
                <div className="p-2.5 bg-brand-blue-500/10 border border-brand-blue-500/20 text-brand-blue-500 rounded-xl">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStudents} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgb(var(--zx-text-muted))', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgb(var(--zx-text-muted))' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgb(var(--zx-surface-hover))' }} />
                  <Bar dataKey="paid" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>

        {/* SECONDARY CHARTS ROW */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          <div className="bg-[rgb(var(--zx-surface))] p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 rounded-xl">
                    <Users size={16} />
                </div>
                <h3 className="text-sm font-bold text-[rgb(var(--zx-text))]">Student Fee Status</h3>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}/>
                  <Pie data={studentStatusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                    {studentStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
                    <Store size={16} />
                </div>
                <h3 className="text-sm font-bold text-[rgb(var(--zx-text))]">Franchise Accounts</h3>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}/>
                  <Pie data={franchiseStatusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                    {franchiseStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[rgb(var(--zx-surface))] p-6 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-blue-500/10 border border-brand-blue-500/20 text-brand-blue-500 rounded-xl">
                        <TrendingUp size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[rgb(var(--zx-text))]">Top Franchises</h3>
                </div>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFranchise} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--zx-text-muted))', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--zx-text-muted))' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgb(var(--zx-surface-hover))' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>

        {/* TABLES SECTION */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
            
          {/* STUDENT TABLE */}
          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center gap-3 shrink-0">
                <div className="p-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl shadow-sm text-brand-teal-500">
                    <Users size={16} />
                </div>
                <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm">Student Fees Ledger</h3>
            </div>
            <div className="overflow-x-auto custom-dashboard-scroll flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Profile</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Total Fee</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Remitted</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                    {studentFees.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                        <td className="px-6 py-4 font-bold text-[rgb(var(--zx-text))] text-sm">{s.name}</td>
                        <td className="px-6 py-4 text-[rgb(var(--zx-text-muted))] font-medium text-sm">₹{Number(s.total_fees || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-brand-teal-500 text-sm">₹{Number(s.paid_fees || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                           <StatusBadge status={s.status} />
                        </td>
                    </tr>
                    ))}
                    {studentFees.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-[rgb(var(--zx-text-muted))] text-sm">No data available</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* FRANCHISE TABLE */}
          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center gap-3 shrink-0">
                <div className="p-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl shadow-sm text-emerald-500">
                    <Store size={16} />
                </div>
                <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm">Franchise Settlements</h3>
            </div>
            <div className="overflow-x-auto custom-dashboard-scroll flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Entity Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                    {franchiseData.slice(0, 10).map((f) => (
                    <tr key={f.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                        <td className="px-6 py-4 font-bold text-[rgb(var(--zx-text))] text-sm">{f.name}</td>
                        <td className="px-6 py-4 font-bold text-emerald-500 text-sm">₹{Number(f.total_revenue || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-[rgb(var(--zx-text-muted))] font-medium text-sm">₹{Number(f.amount_due || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                           <StatusBadge status={f.status} />
                        </td>
                    </tr>
                    ))}
                    {franchiseData.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-[rgb(var(--zx-text-muted))] text-sm">No data available</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

        </motion.div>

        {/* EXTERNAL TRANSACTIONS */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col relative z-10">
            <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center gap-3 shrink-0">
                <div className="p-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl shadow-sm text-amber-500">
                    <CreditCard size={16} />
                </div>
                <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm">Recent External Inflows</h3>
            </div>
            
            <div className="overflow-x-auto custom-dashboard-scroll">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))]">
                    <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Payer Origin</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Contact Address</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Gateway / Mode</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                    {successfulExternalPayments
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10)
                    .map((p) => (
                        <tr key={p.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                        <td className="px-6 py-5 font-bold text-[rgb(var(--zx-text))] text-sm">{p.name}</td>
                        <td className="px-6 py-5 text-[rgb(var(--zx-text-muted))] font-medium text-sm">{p.email}</td>
                        <td className="px-6 py-5 font-black text-amber-500 text-sm">
                            ₹{Number(p.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border-[rgb(var(--zx-border))]">
                                {p.payment_mode || "Online"}
                            </span>
                        </td>
                        <td className="px-6 py-5 text-right text-[rgb(var(--zx-text-muted))] text-sm font-medium">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                        </td>
                        </tr>
                    ))}
                    {successfulExternalPayments.length === 0 && (
                        <tr><td colSpan="5" className="p-12 text-center text-[rgb(var(--zx-text-muted))] text-sm">No external transaction history found</td></tr>
                    )}
                </tbody>
                </table>
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
}