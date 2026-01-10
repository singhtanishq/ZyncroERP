import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api/apiClient";

import {
    Search,
    Users,
    GraduationCap,
    BookOpen,
    Layers,
    Calendar,
    Mail,
    BadgeCheck,
    UserRound,
    Eye,
    X,
    Hash
} from "lucide-react";

/* ================= MODAL COMPONENT ================= */

function ViewStudentModal({ open, student, onClose }) {
    if (!open || !student) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
                
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-200">
                            <UserRound size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{student.name}</h2>
                            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Enrollment Active
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">
                    
                    {/* INFO GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                                <Hash size={12} className="text-indigo-400"/> Student ID
                            </div>
                            <div className="font-semibold text-slate-800 text-sm truncate">{student.sid}</div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                                <Calendar size={12} className="text-indigo-400"/> Joined Date
                            </div>
                            <div className="font-semibold text-slate-800 text-sm truncate">
                                {student.joined_at ? new Date(student.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                            </div>
                        </div>
                    </div>

                    {/* FULL WIDTH FIELDS */}
                    <div className="space-y-4 pt-2">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                                <Mail size={12} className="text-slate-400"/> Email Address
                            </div>
                            <div className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium text-sm shadow-sm">
                                {student.email}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                                <BookOpen size={12} className="text-slate-400"/> Course Assigned
                            </div>
                            <div className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium text-sm shadow-sm">
                                {student.course_name}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                                <Layers size={12} className="text-slate-400"/> Batch
                            </div>
                            <div className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium text-sm shadow-sm">
                                {student.batch_name}
                            </div>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm transition-all active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}


/* ================= MAIN COMPONENT ================= */

export default function FacultyMyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal State
    const [viewStudent, setViewStudent] = useState(null);

    /* ================= LOAD ================= */

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {
        try {
            setLoading(true);
            const res = await api.get("/faculty/students");
            setStudents(res.data || []);
        } catch (err) {
            console.error(err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }

    /* ================= SEARCH FILTER ================= */

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;
        const keyword = search.toLowerCase();
        
        return students.filter((student) =>
            student.name?.toLowerCase().includes(keyword) ||
            student.email?.toLowerCase().includes(keyword) ||
            student.sid?.toLowerCase().includes(keyword) ||
            student.course_name?.toLowerCase().includes(keyword) ||
            student.batch_name?.toLowerCase().includes(keyword)
        );
    }, [students, search]);

    /* ================= UI ================= */

    // Adjusted for 5 columns: Student, Contact, Program, Joined, Actions
    const gridLayout = "grid grid-cols-[1.5fr_1.5fr_2fr_1fr_80px] gap-4 items-center";

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} />
                        My Students
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-xl">
                        View and manage students enrolled in your assigned courses and batches.
                    </p>
                </div>

                {/* REFINED STAT CARD */}
                <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-200">
                        {filteredStudents.length}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">
                        Assigned<br/>Students
                    </div>
                </div>
            </div>

            {/* FILTERS / SEARCH BAR */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, ID, email, course..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
                
                {/* HEADERS */}
                <div className={`${gridLayout} px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm hidden md:grid`}>
                    <div>Student Info</div>
                    <div>Contact</div>
                    <div>Program Details</div>
                    <div>Joined</div>
                    <div className="text-right">Actions</div>
                </div>

                {/* BODY */}
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-medium text-sm tracking-wide">Loading students...</span>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/30">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm transition-transform hover:scale-105">
                            <GraduationCap size={36} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-600">No Students Found</p>
                        <p className="text-sm mt-1">{search ? "No students match your search criteria." : "No students are currently assigned to you."}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredStudents.map((student) => (
                            <div
                                key={`${student.id}-${student.course_id}-${student.batch_id}`}
                                className={`${gridLayout} px-6 py-5 hover:bg-slate-50/80 transition-all duration-200 group items-center`}
                            >
                                
                                {/* 1. STUDENT INFO */}
                                <div className="flex items-center gap-3 pr-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-500 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                        <UserRound size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors">
                                            {student.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                            <Hash size={10} className="text-slate-400"/> {student.sid}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. CONTACT */}
                                <div className="min-w-0 pr-4">
                                    <div className="text-sm font-medium text-slate-600 truncate flex items-center gap-1.5">
                                        <Mail size={14} className="text-slate-400 shrink-0"/>
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                </div>

                                {/* 3. PROGRAM DETAILS */}
                                <div className="min-w-0 pr-4 space-y-1.5">
                                    <div className="text-xs font-bold text-slate-700 truncate flex items-center gap-1.5">
                                        <BookOpen size={14} className="text-indigo-400 shrink-0"/>
                                        <span className="truncate">{student.course_name}</span>
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5 bg-slate-100 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                                        <Layers size={12} className="text-slate-400 shrink-0"/>
                                        <span className="truncate">{student.batch_name}</span>
                                    </div>
                                </div>

                                {/* 4. JOINED */}
                                <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400 shrink-0"/>
                                    {student.joined_at ? new Date(student.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                                </div>

                                {/* 5. ACTIONS */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setViewStudent(student)}
                                        title="View Student Details"
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100 shadow-sm hover:shadow active:scale-95"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* STUDENT DETAILS MODAL */}
            <ViewStudentModal 
                open={!!viewStudent}
                student={viewStudent}
                onClose={() => setViewStudent(null)}
            />
            
        </div>
    );
}