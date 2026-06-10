import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Check, X, Info } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    functionality: false,
  });

  useEffect(() => {
    // Check if consent preferences exist in localStorage
    const savedConsent = localStorage.getItem('ottobon_cookie_consent');
    if (!savedConsent) {
      // Small delay to make entrance feel premium
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      const parsed = JSON.parse(savedConsent);
      setPreferences(parsed);
      applyConsent(parsed);
    }
  }, []);

  const applyConsent = (consent) => {
    // Apply preferences to Google Analytics
    if (consent.analytics) {
      window['ga-disable-G-8803TMS2G8'] = false;
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    } else {
      window['ga-disable-G-8803TMS2G8'] = true;
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, functionality: true };
    localStorage.setItem('ottobon_cookie_consent', JSON.stringify(consent));
    setPreferences(consent);
    applyConsent(consent);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consent = { necessary: true, analytics: false, functionality: false };
    localStorage.setItem('ottobon_cookie_consent', JSON.stringify(consent));
    setPreferences(consent);
    applyConsent(consent);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('ottobon_cookie_consent', JSON.stringify(preferences));
    applyConsent(preferences);
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] p-6 bg-white/90 backdrop-blur-md border border-[#313851]/15 shadow-[0_20px_50px_rgba(49,56,81,0.15)] rounded-2xl text-[#313851] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#3b4ba4] flex items-center justify-center shrink-0">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-[16px] tracking-tight leading-tight mb-1 text-[#313851]">
                We value your privacy
              </h4>
              <p className="text-xs text-[#313851]/75 leading-relaxed font-medium">
                We use cookies to optimize performance, analyze website traffic, and personalize your experience. Learn more in our{' '}
                <a href="#privacy" className="underline font-bold text-[#3b4ba4] hover:text-[#3b4ba4]/80">
                  Privacy Policy
                </a>.
              </p>
            </div>
            <button
              onClick={handleRejectAll}
              className="text-[#313851]/40 hover:text-[#313851]/80 transition-colors p-1"
              aria-label="Close and reject cookies"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Custom Settings Accordion */}
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden mb-4 border-t border-[#313851]/10 pt-4 space-y-3"
              >
                {/* Category: Necessary */}
                <div className="flex items-center justify-between bg-[#F6F3ED]/50 p-3 rounded-xl border border-[#313851]/5">
                  <div>
                    <h5 className="text-xs font-bold text-[#313851]">Necessary Cookies</h5>
                    <p className="text-[10px] text-[#313851]/65 mt-0.5 leading-snug">Required for essential platform functionality & security.</p>
                  </div>
                  <div className="w-9 h-5 bg-[#313851] rounded-full p-0.5 flex items-center justify-end opacity-60 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                {/* Category: Analytics */}
                <div className="flex items-center justify-between bg-[#F6F3ED]/50 p-3 rounded-xl border border-[#313851]/5">
                  <div>
                    <h5 className="text-xs font-bold text-[#313851]">Analytics Cookies</h5>
                    <p className="text-[10px] text-[#313851]/65 mt-0.5 leading-snug">Used by Google Analytics to help us improve user flows.</p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer ${
                      preferences.analytics ? 'bg-[#3b4ba4] justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Category: Functionality */}
                <div className="flex items-center justify-between bg-[#F6F3ED]/50 p-3 rounded-xl border border-[#313851]/5">
                  <div>
                    <h5 className="text-xs font-bold text-[#313851]">Functionality Cookies</h5>
                    <p className="text-[10px] text-[#313851]/65 mt-0.5 leading-snug">Remember preferences like theme settings and UI states.</p>
                  </div>
                  <button
                    onClick={() => togglePreference('functionality')}
                    className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer ${
                      preferences.functionality ? 'bg-[#3b4ba4] justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 mt-2">
            {!showCustomize ? (
              <>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="px-4 py-2.5 rounded-xl border border-[#313851]/15 text-xs font-bold hover:bg-[#313851]/5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-[#313851]/85"
                >
                  <Settings size={14} />
                  Customize
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2.5 rounded-xl border border-[#313851]/15 text-xs font-bold hover:bg-[#313851]/5 transition-all cursor-pointer active:scale-95 text-[#313851]/85"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-5 py-2.5 rounded-xl bg-[#313851] text-white text-xs font-bold hover:bg-[#313851]/95 transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1"
                  >
                    <Check size={14} />
                    Accept All
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#313851]/15 text-xs font-bold hover:bg-[#313851]/5 transition-all cursor-pointer active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-5 py-2.5 rounded-xl bg-[#313851] text-white text-xs font-bold hover:bg-[#313851]/95 transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  Save Choices
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
