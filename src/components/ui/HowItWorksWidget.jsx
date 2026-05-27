import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';

/**
 * HowItWorksWidget - A premium, reusable walkthrough guide component.
 * Features collapsible states preserved in localStorage, glassmorphic themes,
 * responsive grids, and micro-lifts.
 */
const HowItWorksWidget = ({
    pageKey,
    title = "How it Works",
    icon: IconComponent = HelpCircle,
    steps = [],
    creditsInfo = "",
    theme = "neutral" // 'warm' (for JobsAI/HumanSessions page) or 'neutral' (for ATSAnalyzer/MockInterview page)
}) => {
    const storageKey = `how-it-works-collapsed-${pageKey}`;
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem(storageKey);
        // By default, keep the guide closed (collapsed = true) unless explicitly opened by the user
        setIsCollapsed(savedState !== 'false');
        setIsInitialized(true);
    }, [storageKey]);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem(storageKey, String(newState));
    };

    if (!isInitialized) return null;

    // Theme Config definitions for perfect visual cohesion
    const styles = {
        warm: {
            cardBg: "bg-white/80 backdrop-blur-xl border-[#C2CBD3]/20 shadow-[0_20px_50px_rgba(49,56,81,0.02)]",
            headerText: "text-[#313851]",
            descText: "text-[#313851]/60",
            iconBg: "bg-[#313851] text-white",
            stepCardBg: "bg-[#F6F3ED]/40 border-[#C2CBD3]/10 hover:border-[#313851]/30 hover:bg-[#F6F3ED]/70",
            stepTitleText: "text-[#313851]",
            stepDescText: "text-[#313851]/60",
            badgeBg: "bg-[#313851]/10 text-[#313851]",
            toggleBtn: "text-[#313851]/60 hover:text-[#313851] hover:bg-[#313851]/5",
            miniBtn: "bg-[#313851] text-white hover:bg-[#313851]/90 shadow-md shadow-[#313851]/10",
            creditsBg: "bg-[#F6F3ED] border-[#C2CBD3]/20 text-[#313851]/80"
        },
        neutral: {
            cardBg: "bg-white border-zinc-100 shadow-xl shadow-zinc-900/5",
            headerText: "text-zinc-950",
            descText: "text-zinc-500",
            iconBg: "bg-zinc-900 text-white",
            stepCardBg: "bg-zinc-50/50 border-zinc-100 hover:border-zinc-900/30 hover:bg-zinc-50",
            stepTitleText: "text-zinc-900",
            stepDescText: "text-zinc-500",
            badgeBg: "bg-zinc-100 text-zinc-800",
            toggleBtn: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50",
            miniBtn: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/10",
            creditsBg: "bg-zinc-50 border-zinc-100 text-zinc-600"
        }
    };

    const activeStyle = styles[theme] || styles.neutral;

    return (
        <div className="w-full mb-8 relative z-20">
            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    /* Mini Trigger Button when collapsed to save space */
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-start"
                    >
                        <button
                            onClick={toggleCollapse}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeStyle.miniBtn}`}
                        >
                            <IconComponent size={14} className="animate-pulse" />
                            How it works
                            <ChevronDown size={14} />
                        </button>
                    </motion.div>
                ) : (
                    /* Full walkthrough expanded card */
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`w-full border rounded-[2rem] p-8 overflow-hidden relative ${activeStyle.cardBg}`}
                    >
                        {/* Upper Header and Toggle Controls */}
                        <div className="flex justify-between items-start gap-4 mb-8 pb-4 border-b border-inherit">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${activeStyle.iconBg}`}>
                                    <IconComponent size={22} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${activeStyle.headerText}`}>
                                        {title}
                                        <span className={`text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full ${activeStyle.badgeBg}`}>
                                            Quick Guide
                                        </span>
                                    </h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeStyle.descText}`}>
                                        Simple 3-step walkthrough to get the best results
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleCollapse}
                                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${activeStyle.toggleBtn}`}
                                title="Dismiss Guide"
                            >
                                <ChevronUp size={20} />
                            </button>
                        </div>

                        {/* Interactive Steps Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon || HelpCircle;
                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-6 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group ${activeStyle.stepCardBg}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Numeric Icon Badge */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${activeStyle.iconBg}`}>
                                                {index + 1}
                                            </div>
                                            <div className={`p-2.5 bg-inherit border border-inherit rounded-xl text-inherit group-hover:scale-110 transition-transform`}>
                                                <StepIcon size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-black uppercase tracking-widest mb-1.5 ${activeStyle.stepTitleText}`}>
                                                {step.title}
                                            </h4>
                                            <p className={`text-xs font-semibold leading-relaxed ${activeStyle.stepDescText}`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Credits or Cost indicator warning if provided */}
                        {creditsInfo && (
                            <div className={`mt-8 p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold leading-relaxed ${activeStyle.creditsBg}`}>
                                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                <p>{creditsInfo}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HowItWorksWidget;
