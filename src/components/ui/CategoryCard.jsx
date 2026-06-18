import React from 'react';
import { cn } from "../../utils/cn";

/**
 * CategoryCard - A premium, neumorphic interactive card.
 * Features a "pressed" hover effect and a dynamic, rotating SVG background.
 */
export function CategoryCard({ name, icon: Icon, onClick }) {
    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            className={cn(
                "group relative overflow-hidden cursor-pointer",
                "bg-[#D45B34]/10 backdrop-blur-xl rounded-[2.5rem] p-8",
                "border border-[#D45B34]/10",
                "transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1)",
                "hover:shadow-2xl hover:shadow-[#D45B34]/5 hover:-translate-y-2 hover:border-[#D45B34]/20",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D45B34]/10"
            )}
            tabIndex={0}
            role="button"
            aria-label={`Browse ${name} jobs`}
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container - Subtle & Minimal */}
                <div className={cn(
                    "w-16 h-16 rounded-3xl bg-[#D45B34]/10 border border-[#D45B34]/20 flex items-center justify-center mb-10 text-[#D45B34]",
                    "transition-all duration-700 group-hover:bg-[#D45B34] group-hover:text-white group-hover:rotate-[10deg]"
                )}>
                    <Icon strokeWidth={1.5} className="w-7 h-7" />
                </div>
                
                {/* Text Content */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-medium text-[#1C1A17] tracking-tight leading-tight transition-colors">
                        {name}
                    </h3>
                </div>

                {/* Refined CTA - Asymmetrical underline */}
                <div className="mt-12 flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-[#D45B34]/20 group-hover:w-16 group-hover:bg-[#D45B34] transition-all duration-700" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#1C1A17]/65 group-hover:text-[#1C1A17] transition-colors">
                        Explore Field
                    </span>
                </div>
            </div>
        </div>
    );
}
