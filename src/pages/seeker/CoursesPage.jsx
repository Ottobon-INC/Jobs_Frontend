import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { getCourses } from '../../api/coursesApi';
import { toast } from 'react-hot-toast';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(data || []);
            } catch (err) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pt-8 pb-12 px-6 md:px-10 bg-[#FBFBFB] min-h-screen">
            {/* Page Header */}
            <header className="mb-8 border-b border-zinc-100 pb-8">
                <h1 className="text-2xl font-sans font-bold text-zinc-900 tracking-tight">
                    Learning Pathways
                </h1>
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-6 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-zinc-200" />
                    Exclusive cohorts and upskilling resources to bridge your gaps.
                </div>
            </header>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.length > 0 ? (
                    courses.map((course, index) => (
                        <motion.div
                            key={course.id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-xl shadow-zinc-900/5 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between"
                        >
                            {/* Top Zone — Gradient Banner */}
                            <div className="h-24 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 p-6 relative overflow-hidden flex items-center justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
                                <div className="relative inline-flex items-center gap-2.5 bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-xl">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                                    </span>
                                    ONLINE COURSE
                                </div>
                                <div className="text-white/20 group-hover:text-white/40 transition-colors">
                                    <BookOpen size={24} />
                                </div>
                            </div>

                            {/* Bottom Zone — Content */}
                            <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight mb-2 group-hover:text-zinc-700 transition-colors">
                                        {course.name}
                                    </h2>
                                    <div className="text-sm font-medium text-zinc-500 leading-relaxed min-h-[60px] mb-6">
                                        {course.description}
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <a
                                    href={course.redirect_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md shadow-zinc-900/10 active:scale-95"
                                >
                                    Enroll Now
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    /* Fallback Flagship Course Card if no backend courses exist */
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-full group bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-2xl shadow-zinc-900/5 hover:-translate-y-1 transition-all duration-500"
                    >
                        {/* Top Zone — Hero Gradient */}
                        <div className="h-32 bg-zinc-900 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-700 rounded-full blur-3xl opacity-30 -ml-16 -mb-16" />

                            {/* Live Cohort Badge */}
                            <div className="relative inline-flex items-center gap-2.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                LIVE SYNTHESIS
                            </div>
                        </div>

                        {/* Bottom Zone — Content */}
                        <div className="p-6 bg-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">
                                        AI Native Architect
                                    </h2>
                                    <div className="text-sm font-medium text-zinc-500 leading-relaxed max-w-xl">
                                        Master high-performance system architecture and LLM integration. 
                                        Deep dive into React, Hexagonal Architecture, and Production AI Ops.
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-900 border border-zinc-100">
                                        <Sparkles size={28} />
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <a
                                href="https://learn.ottobon.in/course/ai-native-fullstack-developer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3 rounded-xl bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
                            >
                                Enroll Now
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer hint */}
            <div className="mt-8 text-center">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.5em]">
                    New signals dropping soon
                </p>
            </div>
        </div>
    );
};

export default CoursesPage;
