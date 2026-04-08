import React from 'react';
import { motion } from "framer-motion";
import {
    Code2,
    Palette,
    BarChart,
    Search,
    Cpu,
    Globe,
    Zap,
    Heart
} from "lucide-react";
import { CategoryCard } from "../ui/CategoryCard";
import { cn } from "../../utils/cn";

/**
 * Enhanced CategoriesSection - Minimal, modern, and highly interactive.
 * Using a responsive grid (2 cols mobile / 4 cols desktop).
 */
const categories = [
    { name: "Engineering", icon: Code2, count: "12k+ Jobs" },
    { name: "Design", icon: Palette, count: "5k+ Jobs" },
    { name: "Marketing", icon: BarChart, count: "8k+ Jobs" },
    { name: "Data Science", icon: Search, count: "4k+ Jobs" },
    { name: "Robotics", icon: Cpu, count: "2k+ Jobs" },
    { name: "Finance", icon: Globe, count: "6k+ Jobs" },
    { name: "Sales", icon: Zap, count: "10k+ Jobs" },
    { name: "Healthcare", icon: Heart, count: "3k+ Jobs" },
];

export function CategoriesSection() {
    const scrollToJobs = () => {
        const el = document.getElementById('featured-jobs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="categories" className="bg-zinc-50/50 py-40 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                {/* Asymmetrical Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-32 gap-16">
                    <div className="max-w-3xl space-y-8">
                        <h2 className="text-5xl md:text-7xl font-bold text-black tracking-tight leading-zero">
                            Browse by <br />
                            <span className="text-zinc-200">Job Categories.</span>
                        </h2>
                        <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-xl">
                            Explore top-tier opportunities across global tech hubs. 
                            We filter the noise, presenting only the elite professional matches.
                        </p>
                    </div>
                    
                    <div className="lg:pt-4">
                        <button 
                            onClick={scrollToJobs}
                            className="group flex flex-col items-start gap-4"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-black transition-colors">
                                Explore Jobs
                            </span>
                            <div className="w-20 h-[2px] bg-zinc-100 group-hover:w-40 group-hover:bg-black transition-all duration-700" />
                        </button>
                    </div>
                </div>

                {/* Staggered / Asymmetrical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={cn(
                                "h-full",
                                index % 4 === 1 ? "lg:mt-12" : "",
                                index % 4 === 2 ? "lg:-mt-8" : "",
                                index % 4 === 3 ? "lg:mt-4" : ""
                            )}
                            transition={{ 
                                duration: 1.2, 
                                delay: (index % 4) * 0.15,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                        >
                            <CategoryCard
                                name={category.name}
                                icon={category.icon}
                                count={category.count}
                                onClick={scrollToJobs}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Decorative Element */}
                <div className="mt-32 h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent shadow-[0_1px_4px_rgba(0,0,0,0.02)]" />
            </div>
        </section>
    );
}
