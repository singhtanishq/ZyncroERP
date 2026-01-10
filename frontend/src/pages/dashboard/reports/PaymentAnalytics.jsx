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

  // Premium Tailwind Indigo, Emerald, Amber
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b"];
  const STATUS_COLORS = ["#10b981", "#f59e0b", "#f43f5e"]; // Paid (Green), Partial (Amber), Pending (Rose)

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
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl py-2.5 px-4 shadow-xl border border-slate-700">
          <p className="font-bold mb-1 opacity-80 uppercase tracking-wider">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-base font-black flex items-center gap-1">
            <IndianRupee size={14} /> {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase() || "unknown";
    if (s === "paid" || s === "success") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200">Paid / Success</span>;
    if (s === "partial") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200">Partial</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-200">{status || "Pending"}</span>;
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-pulse pb-24">
        {/* Header Skeleton */}
        <div>
          <div className="w-32 h-5 bg-slate-200 rounded-md mb-3"></div>
          <div className="w-72 sm:w-96 h-10 bg-slate-200 rounded-xl mb-3"></div>
          <div className="w-full max-w-2xl h-4 bg-slate-200 rounded-md"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>

        {/* Main Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-[400px] bg-slate-200 rounded-3xl"></div>
          ))}
        </div>

        {/* Secondary Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[320px] bg-slate-200 rounded-3xl"></div>
          ))}
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-[450px] bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
       <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-wide text-sm mb-1 uppercase">
              <Activity size={16} /> Financial Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
               Payment Analytics
            </h1>
            <p className="text-slate-500 mt-2 font-medium max-w-2xl">
              Comprehensive breakdown of organizational revenue, distributed across internal students, franchises, and external endpoints.
            </p>
          </div>
        </motion.div>

        {/* KPI CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Wallet size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total System Revenue</p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight flex items-baseline">
                  <span className="text-2xl text-slate-400 mr-1">₹</span>{totalRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <GraduationCap size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Student Receipts</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-baseline">
                  <span className="text-xl text-slate-400 mr-1">₹</span>{totalStudentRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Building2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Franchise Volume</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-baseline">
                  <span className="text-xl text-slate-400 mr-1">₹</span>{totalFranchiseRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Globe size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">External Operations</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-baseline">
                  <span className="text-xl text-slate-400 mr-1">₹</span>{totalExternalRevenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

        </motion.div>

        {/* MAIN CHARTS ROW 1 */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Revenue Distribution</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Holistic split across income channels</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <PieChartIcon size={24} />
                </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}/>
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

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Top Performing Students</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Highest individual fee contributions</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <TrendingUp size={24} />
                </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStudents} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="paid" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>

        {/* SECONDARY CHARTS ROW */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Student Fee Status</h3>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}/>
                  <Pie data={studentStatusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                    {studentStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Store size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Franchise Accounts</h3>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}/>
                  <Pie data={franchiseStatusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                    {franchiseStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Top Franchises</h3>
                </div>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFranchise} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>

        {/* TABLES SECTION */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
          {/* STUDENT TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <Users size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Student Fees Ledger</h3>
            </div>
            <div className="overflow-x-auto custom-dashboard-scroll flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Profile</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fee</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Remitted</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {studentFees.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{s.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-sm">₹{Number(s.total_fees || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600 text-sm">₹{Number(s.paid_fees || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                           <StatusBadge status={s.status} />
                        </td>
                    </tr>
                    ))}
                    {studentFees.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-400 text-sm">No data available</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* FRANCHISE TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                    <Store size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Franchise Settlements</h3>
            </div>
            <div className="overflow-x-auto custom-dashboard-scroll flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Entity Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {franchiseData.slice(0, 10).map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{f.name}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 text-sm">₹{Number(f.total_revenue || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-sm">₹{Number(f.amount_due || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                           <StatusBadge status={f.status} />
                        </td>
                    </tr>
                    ))}
                    {franchiseData.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-400 text-sm">No data available</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

        </motion.div>

        {/* EXTERNAL TRANSACTIONS */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                    <CreditCard size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Recent External Inflows</h3>
            </div>
            
            <div className="overflow-x-auto custom-dashboard-scroll">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payer Origin</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway / Mode</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {successfulExternalPayments
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10)
                    .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5 font-bold text-slate-800 text-sm">{p.name}</td>
                        <td className="px-6 py-5 text-slate-500 font-medium text-sm">{p.email}</td>
                        <td className="px-6 py-5 font-black text-amber-600 text-sm">
                            ₹{Number(p.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-200">
                                {p.payment_mode || "Online"}
                            </span>
                        </td>
                        <td className="px-6 py-5 text-right text-slate-400 text-sm font-medium">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                        </td>
                        </tr>
                    ))}
                    {successfulExternalPayments.length === 0 && (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-400 text-sm">No external transaction history found</td></tr>
                    )}
                </tbody>
                </table>
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
}