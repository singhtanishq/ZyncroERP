import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";

import {
    BookOpen,
    Layers,
    Users,
    GraduationCap,
    Library
} from "lucide-react";

export default function FacultyMyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD ================= */

    useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        try {
            setLoading(true);
            const res = await api.get("/faculty/courses");
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Library className="text-indigo-600" size={32} />
                        My Courses
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-xl">
                        View all courses and batches assigned to you.
                    </p>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[400px]">
                {loading ? (
                    // LOADING STATE
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-medium text-sm tracking-wide">Loading assigned courses...</span>
                    </div>
                ) : courses.length === 0 ? (
                    // EMPTY STATE
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center py-24 text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm transition-transform hover:scale-105">
                            <GraduationCap className="text-slate-300" size={36} />
                        </div>
                        <p className="text-lg font-bold text-slate-600">No Courses Assigned</p>
                        <p className="text-sm mt-1">No course assignments have been made yet.</p>
                    </div>
                ) : (
                    // DATA GRID
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {courses.map((course) => (
                            <div
                                key={course.assignment_id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-300 transition-all duration-300 group overflow-hidden flex flex-col"
                            >
                                <div className="p-6 flex-1 flex flex-col">
                                    
                                    {/* CARD HEADER */}
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                                            <BookOpen className="text-indigo-600" size={24} />
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wide">
                                            Batch
                                        </span>
                                    </div>

                                    {/* COURSE TITLE */}
                                    <h2 className="mt-5 text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                        {course.course_name}
                                    </h2>

                                    {/* COURSE DETAILS */}
                                    <div className="mt-auto pt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
                                                <Layers size={16} />
                                            </div>
                                            <span className="truncate">{course.batch_name}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
                                                <Users size={16} />
                                            </div>
                                            <span>{course.students} Active Students</span>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}