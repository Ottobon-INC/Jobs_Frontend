import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIVACY_POLICY_HTML } from '../../data/privacyPolicy';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#313851]/40 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-2xl max-h-[85vh] bg-[#F4F1EA] card border border-[#1C1A17]/15 p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#313851]/10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-[#1C1A17]/40 uppercase tracking-[0.25em]">Legal documentation</span>
                            <h2 className="text-2xl font-black text-[#1C1A17] tracking-tight">Privacy Policy Agreement</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 card bg-white hover:bg-[#313851]/5 border border-[#313851]/10 flex items-center justify-center text-[#1C1A17] hover:text-[#1C1A17]/80 transition-all shadow-md active:scale-95"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 py-6 custom-scrollbar scroll-smooth">
                        <div 
                            className="prose max-w-none text-sm font-sans"
                            dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }} 
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-[#313851]/10 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-[#313851] hover:bg-[#313851]/95 text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
                        >
                            Close Reader
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PrivacyPolicyModal;
