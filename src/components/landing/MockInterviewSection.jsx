import { motion } from 'framer-motion';
import { Bot, Users, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-white p-8 rounded-[32px] border-2 border-black hover:shadow-[12px_12px_0px_#000] transition-all group"
    >
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon className="text-white w-7 h-7" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight mb-3 italic">{title}</h3>
        <p className="text-sm font-medium text-black/60 leading-relaxed uppercase tracking-wider">{description}</p>
    </motion.div>
);

export function MockInterviewSection() {
    return (
        <section className="py-32 px-6 md:px-12 lg:px-20 bg-[#f9f9f9] overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8">
                                <Sparkles size={12} className="text-yellow-400" />
                                <span>Next-Gen Preparation</span>
                            </div>

                            <h2 className="text-5xl md:text-7xl font-black text-black leading-[1.1] uppercase tracking-tight mb-8 italic pr-4">
                                Master Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black to-gray-500">
                                    Mock Interview
                                </span>
                            </h2>

                            <p className="text-xl font-medium text-black/80 mb-10 leading-relaxed max-w-lg">
                                Experience a simulation so real, you'll forget it's AI. We've synthesized the collective
                                wisdom of top industry professionals into a single, cohesive training partner.
                            </p>

                            <div className="p-8 bg-black text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquare size={64} />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic mb-4 flex items-center gap-3">
                                    <Bot className="text-white" />
                                    The Core Message
                                </h3>
                                <p className="text-lg font-medium tracking-wide leading-relaxed opacity-90 italic">
                                    "Real insights are used from the people of the company and AI is used to present it."
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard
                            icon={Users}
                            title="Human Verified"
                            description="Direct data from employees at Tier-1 tech firms ensures your prep matches actual internal bars."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Bot}
                            title="AI Delivered"
                            description="Neural-engine agents adapt to your tone and responses in real-time, providing infinite variation."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="High Fidelity"
                            description="Not just generic questions. We mirror specific company cultures, values, and technical stacks."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Mastery"
                            description="Receive granular feedback on your non-verbal cues, technical depth, and cultural alignment."
                            delay={0.4}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
