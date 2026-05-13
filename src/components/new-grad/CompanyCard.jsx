import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, DollarSign, TrendingUp } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

export const CompanyCard = ({ company }) => {
    const difficultyColors = {
        'Easy': 'bg-green-600',
        'Medium': 'bg-amber-500',
        'Hard': 'bg-red-600'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white border border-[var(--color-primary)]/10 rounded-[2rem] p-8 shadow-xl shadow-[var(--color-primary)]/5 transition-all hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 overflow-hidden"
        >
            <div className="flex items-start justify-between mb-8">
                <CompanyLogo company={company} className="w-16 h-16 group-hover:scale-110 transition-transform bg-[var(--color-background-soft)] rounded-2xl p-2" />
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-1.5 ${difficultyColors[company.difficulty]} text-white rounded-full text-[10px] font-black uppercase tracking-widest`}>
                        {company.difficulty}
                    </div>
                    <div className="px-3 py-1 bg-[var(--color-primary)]/5 text-[var(--color-primary)]/40 rounded-full text-[8px] font-black uppercase tracking-widest border border-[var(--color-primary)]/10 shadow-sm">
                        {company.hiring_zone || company.hiringZone}
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-black text-[var(--color-primary)] mb-2">{company.name}</h3>
            <p className="text-[10px] font-black text-[var(--color-primary)]/30 uppercase tracking-[0.2em] mb-6">{company.category}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/5">
                    <p className="text-[9px] font-black text-[var(--color-primary)]/30 uppercase tracking-widest mb-1">Total Year 1</p>
                    <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-black text-sm">
                        <DollarSign size={14} className="text-green-600" />
                        {company.compensation?.totalYear1 || company.compensation?.total_year_1}
                    </div>
                </div>
                <div className="p-4 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/5">
                    <p className="text-[9px] font-black text-[var(--color-primary)]/30 uppercase tracking-widest mb-1">Interview</p>
                    <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-black text-sm">
                        <Layers size={14} className="text-blue-600" />
                        {company.rounds_count || company.roundsCount} Rounds
                    </div>
                </div>
            </div>

            <Link 
                to={`/new-grad/${company.slug}`}
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                View Playbook
            </Link>
        </motion.div>
    );
};
