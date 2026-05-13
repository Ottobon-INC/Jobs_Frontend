import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { CATEGORIES, ROLES, DIFFICULTIES } from '../../data/newGradData';

export const NewGradFilters = ({ 
    searchQuery, setSearchQuery, 
    category, setCategory, 
    role, setRole, 
    difficulty, setDifficulty 
}) => {
    return (
        <section className="py-6 px-6 bg-transparent">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40" size={18} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company or role..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--color-primary)]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all font-medium text-sm text-[var(--color-primary)] placeholder:text-[var(--color-primary)]/30"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-[var(--color-primary)]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all font-bold text-[11px] uppercase tracking-widest cursor-pointer text-[var(--color-primary)]"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40 pointer-events-none" size={14} />
                    </div>

                    <div className="relative group">
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-[var(--color-primary)]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all font-bold text-[11px] uppercase tracking-widest cursor-pointer text-[var(--color-primary)]"
                        >
                            {ROLES.map(r => <option key={r} value={r} className="bg-white">{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40 pointer-events-none" size={14} />
                    </div>

                    <div className="relative group">
                        <select 
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-[var(--color-primary)]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all font-bold text-[11px] uppercase tracking-widest cursor-pointer text-[var(--color-primary)]"
                        >
                            {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-white">{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>
        </section>
    );
};
