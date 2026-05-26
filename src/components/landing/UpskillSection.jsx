import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function UpskillSection() {
    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    };

    return (
        <section className="relative py-24 overflow-hidden bg-[#F5F3EE]">
            {/* Dot grid pattern overlay */}
            <div 
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#1C1F2E 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text Content */}
                    <motion.div {...fadeUp}>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1C1F2E] mb-6">
                            Not Job-Ready Yet?<br />
                            <span className="text-[#1C1F2E]/30">Upskill First.</span>
                        </h2>
                        <p className="text-lg text-[#1C1F2E]/85 leading-relaxed mb-10 max-w-xl font-medium">
                            Found the perfect job but missing a few key requirements? 
                            Don't let the opportunity slip away. Seamlessly bridge your skill gap 
                            and become the perfect candidate.
                        </p>
                        
                        <a 
                            href="https://learn.ottobon.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-[#1C1F2E]/14 text-[#1C1F2E] font-bold transition-all duration-300 hover:bg-[#1C1F2E]/5 hover:border-[#1C1F2E]/30 group"
                        >
                            Go to Course Platform
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </motion.div>

                    {/* Right: Custom Premium SVG Illustration */}
                    <motion.div 
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.2 }}
                        className="relative aspect-square max-w-md mx-auto lg:ml-auto w-full"
                    >
                        <svg viewBox="0 0 500 500" className="w-full h-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <clipPath id="card1-clip">
                                    <rect x="45" y="115" width="110" height="110" rx="10" />
                                </clipPath>
                                <clipPath id="card2-clip">
                                    <rect x="195" y="95" width="110" height="110" rx="10" />
                                </clipPath>
                                <clipPath id="card3-clip">
                                    <rect x="345" y="115" width="110" height="110" rx="10" />
                                </clipPath>
                            </defs>

                            {/* Large base card filling the canvas */}
                            <rect x="10" y="10" width="480" height="480" rx="16" fill="#F5F3EE" stroke="#E2DDD6" strokeWidth="2" />

                            {/* Decorative Circles top-left */}
                            <circle cx="40" cy="40" r="5" fill="#D8D4CC" />
                            <circle cx="56" cy="40" r="5" fill="#D8D4CC" />
                            <circle cx="72" cy="40" r="5" fill="#D8D4CC" />

                            {/* Pro Learning pill badge top-right */}
                            <rect x="360" y="28" width="100" height="24" rx="12" fill="#1C1F2E" />
                            <text x="410" y="43" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">PRO LEARNING</text>

                            {/* Dashed connecting lines from cards to platforms/bridge */}
                            <line x1="100" y1="225" x2="100" y2="370" stroke="#D8D4CC" strokeWidth="1.5" strokeDasharray="4 4" />
                            <line x1="250" y1="205" x2="250" y2="275" stroke="#D8D4CC" strokeWidth="1.5" strokeDasharray="4 4" />
                            <line x1="400" y1="225" x2="400" y2="370" stroke="#D8D4CC" strokeWidth="1.5" strokeDasharray="4 4" />

                            {/* 1. Module 1 Card */}
                            <motion.g
                                whileHover={{ y: -6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="cursor-pointer"
                            >
                                <rect x="45" y="115" width="110" height="110" rx="10" fill="#FFFFFF" stroke="#E2DDD6" strokeWidth="1.5" />
                                <g clipPath="url(#card1-clip)">
                                    <rect x="45" y="115" width="110" height="24" fill="#E2DDD6" />
                                    <text x="57" y="131" fill="#1C1F2E" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">Module 1</text>
                                </g>
                                <rect x="57" y="152" width="86" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="57" y="162" width="56" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="57" y="186" width="52" height="14" rx="7" fill="#1C1F2E" />
                                <text x="83" y="195" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="700" letterSpacing="0.5" textAnchor="middle">HTML/CSS</text>
                            </motion.g>

                            {/* 2. Module 2 Card (Center card - slightly higher) */}
                            <motion.g
                                whileHover={{ y: -6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="cursor-pointer"
                            >
                                <rect x="195" y="95" width="110" height="110" rx="10" fill="#FFFFFF" stroke="#E2DDD6" strokeWidth="1.5" />
                                <g clipPath="url(#card2-clip)">
                                    <rect x="195" y="95" width="110" height="24" fill="#E2DDD6" />
                                    <text x="207" y="111" fill="#1C1F2E" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">Module 2</text>
                                </g>
                                <rect x="207" y="132" width="86" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="207" y="142" width="56" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="207" y="166" width="52" height="14" rx="7" fill="#1C1F2E" />
                                <text x="233" y="175" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="700" letterSpacing="0.5" textAnchor="middle">JS/REACT</text>
                            </motion.g>

                            {/* 3. Certificate Card */}
                            <motion.g
                                whileHover={{ y: -6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="cursor-pointer"
                            >
                                <rect x="345" y="115" width="110" height="110" rx="10" fill="#FFFFFF" stroke="#E2DDD6" strokeWidth="1.5" />
                                <g clipPath="url(#card3-clip)">
                                    <rect x="345" y="115" width="110" height="24" fill="#E2DDD6" />
                                    <text x="357" y="131" fill="#1C1F2E" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">Certificate</text>
                                </g>
                                <rect x="357" y="152" width="86" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="357" y="162" width="56" height="4" rx="2" fill="#E2DDD6" />
                                <rect x="357" y="186" width="52" height="14" rx="7" fill="#1C1F2E" />
                                <text x="383" y="195" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="700" letterSpacing="0.5" textAnchor="middle">VERIFIED</text>
                            </motion.g>

                            {/* Progress Bar Track */}
                            <rect x="45" y="245" width="410" height="6" rx="3" fill="#E2DDD6" />
                            {/* Progress Bar Fill - 70% of 410 = 287 */}
                            <motion.rect
                                x="45"
                                y="245"
                                height="6"
                                rx="3"
                                fill="#1C1F2E"
                                initial={{ width: 0 }}
                                whileInView={{ width: 287 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                viewport={{ once: true }}
                            />

                            {/* Skill Gap Dashed Line & Text */}
                            <line x1="145" y1="425" x2="355" y2="425" stroke="#D8D4CC" strokeWidth="1.5" strokeDasharray="4 4" />
                            <text x="250" y="440" fill="#8C8880" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.5" textAnchor="middle" className="uppercase">skill gap</text>

                            {/* Bridge Arc (M 145 370 Q 250 250 355 370) */}
                            <path d="M 145 370 Q 250 250 355 370" fill="none" stroke="#1C1F2E" strokeWidth="4" strokeLinecap="round" />

                            {/* Planks along Bridge (ticks) */}
                            <line x1="166" y1="348" x2="166" y2="356" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="187" y1="332" x2="187" y2="340" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="208" y1="320" x2="208" y2="328" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="229" y1="312" x2="229" y2="320" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="250" y1="310" x2="250" y2="318" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="271" y1="312" x2="271" y2="320" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="292" y1="320" x2="292" y2="328" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="313" y1="332" x2="313" y2="340" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            <line x1="334" y1="348" x2="334" y2="356" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />

                            {/* Stick Figure Midpoint walking (with small breathing/bobbing motion) */}
                            <motion.g
                                animate={{ y: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <circle cx="250" cy="287" r="5" fill="#1C1F2E" />
                                <line x1="250" y1="292" x2="250" y2="303" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                                {/* Arms */}
                                <line x1="250" y1="295" x2="242" y2="300" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                                <line x1="250" y1="295" x2="258" y2="299" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                                {/* Legs */}
                                <line x1="250" y1="303" x2="255" y2="310" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                                <line x1="250" y1="303" x2="245" y2="310" stroke="#1C1F2E" strokeWidth="2" strokeLinecap="round" />
                            </motion.g>

                            {/* Left Platform: Current You */}
                            <rect x="45" y="370" width="100" height="36" rx="8" fill="#F5F3EE" stroke="#E2DDD6" strokeWidth="1.5" />
                            <text x="95" y="392" fill="#1C1F2E" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">Current You</text>

                            {/* Right Platform: Job Ready */}
                            <rect x="355" y="370" width="100" height="36" rx="8" fill="#1C1F2E" stroke="#1C1F2E" strokeWidth="1.5" />
                            <text x="405" y="392" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">Job Ready</text>

                            {/* Bottom-Right Mastery Card */}
                            <motion.g
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="cursor-pointer"
                            >
                                <rect x="380" y="420" width="75" height="50" rx="8" fill="#FFFFFF" stroke="#E2DDD6" strokeWidth="1" />
                                <text x="417.5" y="443" fill="#1C1F2E" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle">85%</text>
                                <text x="417.5" y="458" fill="#8C8880" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="800" letterSpacing="1.5" textAnchor="middle">MASTERY</text>
                            </motion.g>
                        </svg>

                        {/* Glow effect behind */}
                        <div className="absolute -inset-4 bg-[#1C1F2E]/5 blur-3xl -z-10 rounded-full" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
