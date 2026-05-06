import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { HiringTimeline } from '../../components/new-grad/HiringTimeline';

const HiringTimelinePage = () => {
    return (
        <div className="min-h-screen bg-[#313851]">
            {/* Header Navigation */}
            <div className="bg-[#313851] py-4 px-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50">
                <Link 
                    to="/new-grad" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Back to Playbooks
                </Link>
                <div className="flex items-center gap-2 text-white/90">
                    <Calendar size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hiring Timeline</span>
                </div>
            </div>

            <main className="py-4">
                <HiringTimeline />
            </main>
            
            {/* Footer Placeholder */}
            <footer className="bg-white/5 py-10 px-6 border-t border-white/10 text-center mt-20">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Ottobon Jobs • Hiring Timeline</p>
            </footer>
        </div>
    );
};

export default HiringTimelinePage;
