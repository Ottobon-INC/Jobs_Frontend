import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { NewGradHero } from '../../components/new-grad/NewGradHero';
import { NewGradFilters } from '../../components/new-grad/NewGradFilters';
import { CompanyCard } from '../../components/new-grad/CompanyCard';
import { COMPANIES } from '../../data/newGradData';

const NewGradPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [role, setRole] = useState('All Roles');
    const [difficulty, setDifficulty] = useState('All Levels');
    const [hiringZone, setHiringZone] = useState('off-campus');

    const filteredCompanies = useMemo(() => {
        return COMPANIES.filter(company => {
            const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 company.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = category === 'All Categories' || company.category === category;
            const matchesRole = role === 'All Roles' || company.roles.includes(role);
            const matchesDifficulty = difficulty === 'All Levels' || company.difficulty === difficulty;
            const matchesZone = company.hiringZone === hiringZone;

            return matchesSearch && matchesCategory && matchesRole && matchesDifficulty && matchesZone;
        });
    }, [searchQuery, category, role, difficulty, hiringZone]);

    return (
        <div className="min-h-screen bg-[#F6F3ED]">
            {/* Header Navigation */}
            <div className="bg-[#313851] py-4 px-6 flex items-center justify-between border-b border-white/5">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Back to Home
                </Link>
                <div className="flex items-center gap-2 text-white/90">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">New Grad Launchpad</span>
                </div>
            </div>

            <NewGradHero />
            
            <NewGradFilters 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                category={category} setCategory={setCategory}
                role={role} setRole={setRole}
                difficulty={difficulty} setDifficulty={setDifficulty}
            />

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#313851] tracking-tight">Browse Playbooks</h2>
                        <p className="text-sm font-medium text-zinc-400 mt-1">Showing {filteredCompanies.length} curated companies</p>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-zinc-200 p-1.5 rounded-[20px] w-fit shadow-sm">
                        <button 
                            onClick={() => setHiringZone('off-campus')}
                            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${hiringZone === 'off-campus' ? 'bg-[#313851] text-white shadow-md' : 'text-zinc-400 hover:text-[#313851] hover:bg-zinc-50'}`}
                        >
                            Off-Campus
                        </button>
                        <button 
                            onClick={() => setHiringZone('on-campus')}
                            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${hiringZone === 'on-campus' ? 'bg-[#313851] text-white shadow-md' : 'text-zinc-400 hover:text-[#313851] hover:bg-zinc-50'}`}
                        >
                            On-Campus
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCompanies.map(company => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
                                <AlertCircle size={40} className="text-zinc-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#313851]">No playbooks found</h3>
                            <p className="text-zinc-400 mt-2 max-w-sm">Try adjusting your filters or search query to find what you're looking for.</p>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setCategory('All Categories');
                                    setRole('All Roles');
                                    setDifficulty('All Levels');
                                }}
                                className="mt-8 text-sm font-bold text-[#313851] border-b-2 border-[#313851] pb-1 hover:pb-2 transition-all uppercase tracking-widest"
                            >
                                Reset All Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Placeholder */}
            <footer className="bg-white py-20 px-6 border-t border-zinc-100 text-center">
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Ottobon Jobs • New Grad Playbook</p>
            </footer>
        </div>
    );
};

export default NewGradPage;
