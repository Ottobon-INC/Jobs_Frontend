import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateProfile } from '../../api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { PRIVACY_POLICY_HTML } from '../../data/privacyPolicy';

const PrivacyLockOverlay = () => {
    const { profile, refreshSession } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If profile is not loaded yet or user has already accepted, do not render the lock
    if (!profile || profile.privacy_policy_accepted) return null;

    const handleConfirm = async () => {
        if (!accepted) return;
        setLoading(true);
        setError(null);
        try {
            // Update profile
            await updateProfile({ privacy_policy_accepted: true });
            // Refresh authentication session context
            await refreshSession();
        } catch (err) {
            setError(err.message || "Failed to update agreement. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#313851]/40 backdrop-blur-xl overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-[#F4F1EA] card border border-[#1C1A17]/15 p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden my-8"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto bg-[#313851]/10 rounded-2xl flex items-center justify-center text-[#1C1A17] border border-[#1C1A17]/15 mb-4 shadow-lg shadow-[#313851]/5">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="text-[9px] font-black text-[#1C1A17]/40 uppercase tracking-[0.25em]">Action required</span>
                    <h2 className="text-2xl font-black text-[#1C1A17] tracking-tight mt-1">Review Privacy Policy</h2>
                    <p className="text-xs font-semibold text-[#1C1A17]/60 mt-2 leading-relaxed max-w-sm mx-auto">
                        To continue accessing the Ottobon Jobs platform, please review and accept our updated Privacy Policy terms.
                    </p>
                </div>

                {/* Policy Reader Block */}
                <div className="h-64 overflow-y-auto bg-white/70 border border-[#313851]/10 rounded-2xl p-4 custom-scrollbar mb-6 scroll-smooth">
                    <div 
                        className="prose max-w-none text-xs font-sans"
                        dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }} 
                    />
                </div>

                {/* Accept Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mb-6 p-3 rounded-xl bg-white/40 border border-[#313851]/5 hover:bg-white/80 transition-all select-none">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-[#313851]/20 text-[#1C1A17] focus:ring-[#313851]/30 accent-[#313851] cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-[#1C1A17] leading-relaxed group-hover:text-black transition-colors">
                        I have read, understood, and explicitly agree to the Privacy Policy rules for Ottobon Jobs.
                    </span>
                </label>

                {error && (
                    <div className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 p-4 rounded-xl text-center uppercase tracking-widest mb-4">
                        {error}
                    </div>
                )}

                {/* Action button */}
                <button
                    disabled={!accepted || loading}
                    onClick={handleConfirm}
                    className={`w-full bg-[#313851] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#313851]/10 transition-all duration-300 ${
                        (!accepted || loading) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#313851]/95 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Establishing Agreement...
                        </>
                    ) : (
                        <>
                            Accept & Establish Session
                            <ArrowRight size={14} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
};

export default PrivacyLockOverlay;
