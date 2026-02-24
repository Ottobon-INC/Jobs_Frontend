"use client";

import Link from "next/link";
import { Twitter, Instagram, Mail, Check } from "lucide-react";
import { useState } from "react";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [isJoined, setIsJoined] = useState(false);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsJoined(true);
            setEmail("");
            setTimeout(() => setIsJoined(false), 3000);
        }
    };

    return (
        <footer className="bg-black text-white pt-20 pb-8 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand & Newsletter Column */}
                    <div id="newsletter-section" className="space-y-8">
                        <h4 className="text-lg font-bold">Hire Different ™</h4>

                        <form onSubmit={handleJoin} className="flex gap-2 max-w-sm">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="bg-[#1A1A1A] border-none rounded-lg px-4 py-3 w-full text-sm text-white placeholder:text-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                                required
                            />
                            <button
                                type="submit"
                                className={`px-6 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${isJoined ? "bg-green-500 text-white" : "bg-white text-black hover:bg-white/90"
                                    }`}
                            >
                                {isJoined ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Joined
                                    </>
                                ) : (
                                    "Join for free"
                                )}
                            </button>
                        </form>

                        <div className="flex gap-4">
                            <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10">
                                <Mail className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:ml-auto">
                        <h4 className="font-bold mb-6 text-sm">Find Work</h4>
                        <ul className="space-y-4">
                            {["Explore Jobs", "Discover Companies", "Browse Collections"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:ml-auto">
                        <h4 className="font-bold mb-6 text-sm">Find People</h4>
                        <ul className="space-y-4">
                            {["Learn More", "Sign up"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:ml-auto">
                        <h4 className="font-bold mb-6 text-sm">Company</h4>
                        <ul className="space-y-4">
                            {["About us", "Careers", "Contact"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Massive Brand Name */}
                <div className="flex justify-center mb-12">
                    <h2 className="text-[clamp(4rem,20vw,16rem)] font-bold tracking-tighter text-white leading-none select-none opacity-90">
                        ottobon
                    </h2>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-sm text-white/40 font-medium">
                    <div>
                        &copy; {currentYear} ottobon Group. All Rights Reserved.
                    </div>
                    <div className="flex gap-8">
                        <Link href="#" className="underline hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="underline hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
