"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Zap, Shield, Users } from "lucide-react";

const benefits = [
    {
        title: "Fast-Track Applications",
        description: "Get direct access to hiring managers and faster responses with our verified profiles.",
        icon: Zap,
    },
    {
        title: "Verified Companies",
        description: "Every company on Ottobon is thoroughly vetted to ensure legitimate opportunities.",
        icon: Shield,
    },
    {
        title: "Salary Transparency",
        description: "Know your worth. We prioritize jobs with clear salary ranges and compensation details.",
        icon: CheckCircle2,
    },
    {
        title: "Community Driven",
        description: "Join a network of top professionals to share insights and interview experiences.",
        icon: Users,
    },
];

export function BenefitsSection() {
    return (
        <section className="bg-white py-24 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-black mb-8 leading-tight">
                            Why top professionals <br /> choose Ottobon
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                                        <benefit.icon className="w-5 h-5 text-black" />
                                    </div>
                                    <h3 className="text-xl font-bold text-black">{benefit.title}</h3>
                                    <p className="text-black/60 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 relative group"
                    >
                        <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-black/5 relative">
                            <Image
                                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070"
                                alt="Modern Professional Workplace"
                                width={1000}
                                height={1000}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl">
                                    <div className="text-white text-sm font-medium opacity-80 mb-1">Featured Workplace</div>
                                    <div className="text-white text-xl font-bold">Ottobon Certified HQ</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
