import React, { useEffect, useState } from "react";
import api from "../../lib/api/apiClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  FileText,
  Video,
  ClipboardCheck,
  MessageSquare,
  Clock,
  ArrowRight,
  Inbox,
  Layers,
  GraduationCap
} from "lucide-react";

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

export default function FacultyHome() {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [communications, setCommunications] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const [
                coursesRes,
                studentsRes,
                materialsRes,
                classesRes,
                examsRes,
                communicationsRes,
            ] = await Promise.all([
                api.get("/faculty/courses"),
                api.get("/faculty/students"),
                api.get("/faculty/study-materials"),
                api.get("/faculty/online-classes"),
                api.get("/faculty/exams"),
                api.get("/faculty/student-communications"),
            ]);

            setCourses(coursesRes.data);
            setStudents(studentsRes.data);
            setMaterials(materialsRes.data);
            setClasses(classesRes.data);
            setExams(examsRes.data);
            setCommunications(communicationsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const upcomingClasses = classes.filter(c => c.status === "upcoming");
    const upcomingExams = exams.filter(e => e.status === "upcoming");

    if (isLoading) return <FacultySkeleton />;

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
                <Header />

                {/* TOP LEVEL KPIs */}
                <TopKPISection 
                    stats={{
                        courses: courses.length,
                        students: students.length,
                        materials: materials.length,
                        classes: classes.length,
                        exams: upcomingExams.length,
                        communications: communications.length
                    }} 
                />

                {/* MY COURSES TABLE - Full Width for Symmetry */}
                <div className="w-full">
                    <CoursesTable courses={courses} />
                </div>

                {/* 4-GRID LAYOUT FOR LISTS - Perfectly Balanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start w-full">
                    <RecentListCard 
                        title="Upcoming Classes" 
                        icon={Video} 
                        data={upcomingClasses.slice(0, 5)} 
                    />
                    <RecentListCard 
                        title="Upcoming Exams" 
                        icon={ClipboardCheck} 
                        data={upcomingExams.slice(0, 5)} 
                    />
                    <RecentListCard 
                        title="Recent Study Materials" 
                        icon={FileText} 
                        data={materials.slice(0, 5)} 
                    />
                    <RecentListCard 
                        title="Student Communications" 
                        icon={MessageSquare} 
                        data={communications.slice(0, 5)} 
                    />
                </div>

            </motion.div>
        </div>
    );
}

/* ================= HEADER ================= */
function Header() {
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
                    {greeting}, Faculty
                </h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl text-sm sm:text-base">
                    Here's the overview of your classes, student metrics, and academic responsibilities.
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
function FacultySkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 pb-24">
            <div className="animate-pulse space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="w-full">
                        <div className="h-10 bg-slate-200 rounded-xl w-3/4 sm:w-1/3 mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-full sm:w-1/2"></div>
                    </div>
                    <div className="h-12 bg-slate-200 rounded-2xl w-48 shrink-0"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
                    ))}
                </div>

                {/* Table Skeleton */}
                <div className="h-[350px] bg-slate-200/70 border border-slate-100 rounded-3xl w-full"></div>

                {/* 2x2 Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-[250px] bg-slate-200/70 border border-slate-100 rounded-3xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ================= TOP KPIs ================= */
function TopKPISection({ stats }) {
    const kpis = [
        { title: "Total Courses", value: stats.courses, icon: BookOpen, color: "from-blue-600 to-indigo-500", light: "bg-blue-50 text-blue-600" },
        { title: "Total Students", value: stats.students, icon: Users, color: "from-emerald-500 to-teal-400", light: "bg-emerald-50 text-emerald-600" },
        { title: "Study Materials", value: stats.materials, icon: FileText, color: "from-amber-500 to-orange-400", light: "bg-amber-50 text-amber-600" },
        { title: "Online Classes", value: stats.classes, icon: Video, color: "from-purple-600 to-fuchsia-500", light: "bg-purple-50 text-purple-600" },
        { title: "Upcoming Exams", value: stats.exams, icon: ClipboardCheck, color: "from-rose-500 to-pink-500", light: "bg-rose-50 text-rose-600" },
        { title: "Communications", value: stats.communications, icon: MessageSquare, color: "from-cyan-600 to-sky-500", light: "bg-cyan-50 text-cyan-600" },
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

/* ================= MY COURSES TABLE ================= */
function CoursesTable({ courses }) {
    return (
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden w-full h-full">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <Layers size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">My Courses</h3>
                </div>
            </div>
            
            <div className="overflow-x-auto w-full">
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[250px] p-8 text-slate-400">
                        <Inbox size={32} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">No courses assigned yet</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Batch</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Students</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {courses.map((course) => (
                                <tr key={course.assignment_id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <GraduationCap size={16} />
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                {course.course_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {course.batch_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                            <Users size={16} className="text-slate-400" />
                                            {course.students}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
}

/* ================= RECENT ACTIVITY WIDGET ================= */
function RecentListCard({ title, icon: Icon, data }) {
    return (
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden w-full h-full max-h-[420px]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg truncate">{title}</h3>
                </div>
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
                                        {item.title?.charAt(0)?.toUpperCase() || "-"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    );
}