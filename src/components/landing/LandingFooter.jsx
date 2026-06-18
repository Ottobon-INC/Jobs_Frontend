import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import PrivacyPolicyModal from "../auth/PrivacyPolicyModal";

export function LandingFooter() {
    const [policyOpen, setPolicyOpen] = useState(false);

    return (
        <footer className="pt-24 pb-12 border-t border-[#F4F1EA]/10 bg-[#222222]">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Brand Logo */}
                <div className="mb-16">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <img 
                            src="/favicon.png?v=2" 
                            alt="Ottobon Jobs" 
                            className="w-10 h-10 rounded-xl group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black/10" 
                        />
                        <span
                            className="font-medium text-2xl tracking-tighter uppercase text-[#F4F1EA]"
                            style={{
                                fontFamily: "'Inter', system-ui, sans-serif",
                            }}
                        >
                            Ottobon<span className="opacity-30">/</span>Jobs
                        </span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    {[
                        [
                            { label: "Explore Jobs", to: "/jobs" },
                            { label: "Discover Companies", to: "/jobs" },
                            { label: "Browse Collections", to: "/jobs" },
                        ],
                        [
                            { label: "For Job Seekers", to: "/register" },
                            { label: "For Employers", to: "/register" },
                            { label: "Sign up", to: "/register" },
                        ],
                        [
                            { label: "Directory", to: "/jobs" },
                            { label: "Conferences", to: "/jobs" },
                        ],
                        [
                            { label: "FAQs", to: "/jobs" },
                            { label: "About Us", to: "/jobs" },
                            { label: "Contact Us", to: "/jobs" },
                        ],
                    ].map((col, ci) => (
                        <ul key={ci} className="space-y-4">
                            {col.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-sm font-medium transition-all text-[#F4F1EA]/85 hover:text-[#D45B34]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium border-t border-[#F4F1EA]/10 text-[#F4F1EA]/65"
                >
                    <div className="flex gap-6">
                        {['Cookies Policy', 'Legal Terms', 'Privacy Policy'].map(t => (
                            <span
                                key={t}
                                onClick={() => {
                                    if (t === 'Privacy Policy') {
                                        setPolicyOpen(true);
                                    }
                                }}
                                className="cursor-pointer transition-all hover:text-[#F4F1EA]"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                    <span>© {new Date().getFullYear()} Ottobon Jobs. All rights reserved.</span>
                </div>
            </div>
            
            <PrivacyPolicyModal isOpen={policyOpen} onClose={() => setPolicyOpen(false)} />
        </footer>
    );
}
