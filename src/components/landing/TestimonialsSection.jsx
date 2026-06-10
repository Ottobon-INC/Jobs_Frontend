import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react';
import { getTestimonials } from '../../api/featuredApi';

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [loading, setLoading] = useState(true);
    const autoplayTimer = useRef(null);

    // Fetch testimonials on mount
    useEffect(() => {
        const fetchItems = async () => {
            const data = await getTestimonials();
            setTestimonials(data);
            setLoading(false);
        };
        fetchItems();
    }, []);

    // Autoplay controller
    useEffect(() => {
        if (isAutoplay && testimonials.length > 0) {
            autoplayTimer.current = setInterval(() => {
                handleNext();
            }, 5000);
        }
        return () => {
            if (autoplayTimer.current) clearInterval(autoplayTimer.current);
        };
    }, [isAutoplay, currentIndex, testimonials]);

    const handleNext = () => {
        if (testimonials.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        if (testimonials.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Calculate current visible cards for rendering (circular loop)
    const getVisibleTestimonials = () => {
        if (testimonials.length === 0) return [];
        const items = [];
        // Support looping window display (up to 3 cards visible on desktop)
        for (let i = 0; i < Math.min(testimonials.length, 3); i++) {
            const index = (currentIndex + i) % testimonials.length;
            items.push(testimonials[index]);
        }
        return items;
    };

    const renderHighlightedContent = (content, highlight) => {
        if (!highlight) return `"${content}"`;
        const parts = content.split(highlight);
        if (parts.length < 2) return `"${content}"`;
        return (
            <>
                "{parts[0]}
                <span 
                    className="not-italic font-bold bg-[#eef2ff] text-[#3b4ba4] px-1.5 py-0.5 rounded-md mx-0.5 inline-block"
                    style={{ fontSize: '0.925em' }}
                >
                    {highlight}
                </span>
                {parts[1]}"
            </>
        );
    };

    if (loading || testimonials.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-[#F6F3ED]">
                <div className="animate-pulse flex space-x-2">
                    <div className="w-3 h-3 bg-[#313851] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#313851] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#313851] rounded-full"></div>
                </div>
            </div>
        );
    }

    const visibleItems = getVisibleTestimonials();

    return (
        <section 
            id="testimonials" 
            className="relative pt-8 pb-28 overflow-hidden bg-gradient-to-b from-[#F6F3ED] to-[#e4e1da]"
            aria-labelledby="testimonials-title"
        >
            {/* Ambient Background Glow Elements */}
            <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#C2CBD3]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#313851]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[#313851]/65 text-[11px] font-extrabold uppercase tracking-[0.25em] mb-4">
                        Real Outcomes · Verified Seekers
                    </p>
                    <h2 
                        id="testimonials-title"
                        className="font-extrabold tracking-tight mb-4 text-[#313851] leading-tight"
                        style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                        }}
                    >
                        Your next offer starts <br className="hidden sm:inline" />
                        <span className="text-[#3b4ba4]">right here.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto font-medium text-[#313851]/70 text-sm md:text-base leading-relaxed">
                        Thousands of ambitious professionals used Ottobon's AI matching, semantic fit scores, and mock interviews to land roles faster — these are their stories.
                    </p>
                </div>

                {/* Carousel Container */}
                <div 
                    className="relative px-4 md:px-12"
                    onMouseEnter={() => setIsAutoplay(false)}
                    onMouseLeave={() => setIsAutoplay(true)}
                >
                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/70 backdrop-blur-md border border-[#313851]/10 text-[#313851] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_-4px_rgba(49,56,81,0.15)] cursor-pointer"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/70 backdrop-blur-md border border-[#313851]/10 text-[#313851] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_-4px_rgba(49,56,81,0.15)] cursor-pointer"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Testimonials Grid Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden py-4 px-2">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {visibleItems.map((item) => (
                                <motion.article
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 28,
                                        mass: 1
                                    }}
                                    className="relative backdrop-blur-xl bg-white border border-[#313851]/10 rounded-[20px] p-8 flex flex-col justify-between hover:border-[#313851]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-[0_12px_24px_-10px_rgba(49,56,81,0.04)]"
                                >
                                    <div>
                                        {/* Tags Header */}
                                        <div className="flex flex-wrap items-center gap-2 mb-6">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3b4ba4] bg-[#eef2ff] px-3.5 py-1.5 rounded-full">
                                                {item.tag}
                                            </span>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-1 mb-6">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} size={16} fill="#f59e0b" className="text-[#f59e0b] stroke-none" />
                                            ))}
                                        </div>

                                        {/* Feedback text */}
                                        <p className="text-[#313851]/90 font-medium leading-relaxed text-[15px] italic mb-6">
                                            {renderHighlightedContent(item.content, item.highlight)}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full border-t border-gray-100 my-6" />

                                    {/* Candidate Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                            <User className="w-5 h-5 stroke-[1.5]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#313851] text-sm leading-tight">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-[#313851]/70 mt-1 font-medium">
                                                {item.role} · <span className="font-bold text-[#313851]">{item.company}</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Seeker Journey Progress Box */}
                <div className="w-full max-w-[1120px] mx-auto mt-16 p-8 bg-white border border-[#313851]/10 rounded-[20px] shadow-[0_12px_24px_-10px_rgba(49,56,81,0.04)]">
                    <p className="text-[#313851]/60 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-10 text-left">
                        Typical Seeker Journey on Ottobon
                    </p>
                    
                    <div className="flex items-center justify-between relative px-2 md:px-6">
                        {/* Step 1: Upload CV */}
                        <div className="flex flex-col items-center z-10 min-w-[60px] md:min-w-0">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#313851] transition-transform hover:scale-110 duration-200" />
                            <span className="text-[9px] md:text-[10px] font-bold text-[#313851] mt-3.5 uppercase tracking-wider text-center max-w-[80px] md:max-w-none">
                                Upload CV
                            </span>
                        </div>
                        
                        {/* Line 1 -> Completed */}
                        <div className="h-[2px] flex-grow bg-[#313851] mx-2 md:mx-4" />
                        
                        {/* Step 2: Semantic Fit Scan */}
                        <div className="flex flex-col items-center z-10 min-w-[60px] md:min-w-0">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#313851] transition-transform hover:scale-110 duration-200" />
                            <span className="text-[9px] md:text-[10px] font-bold text-[#313851] mt-3.5 uppercase tracking-wider text-center max-w-[80px] md:max-w-none">
                                Semantic Fit Scan
                            </span>
                        </div>
                        
                        {/* Line 2 -> Completed */}
                        <div className="h-[2px] flex-grow bg-[#313851] mx-2 md:mx-4" />
                        
                        {/* Step 3: Mock Interviews (Active) */}
                        <div className="flex flex-col items-center z-10 min-w-[60px] md:min-w-0">
                            <div className="w-6 h-6 rounded-full border-2 border-[#3b4ba4]/35 flex items-center justify-center bg-white shadow-sm transition-transform hover:scale-110 duration-200">
                                <div className="w-2.5 h-2.5 bg-[#3b4ba4] rounded-full" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-[#3b4ba4] mt-2.5 uppercase tracking-wider text-center max-w-[80px] md:max-w-none">
                                Mock Interviews
                            </span>
                        </div>
                        
                        {/* Line 3 -> Upcoming */}
                        <div className="h-[2px] flex-grow bg-[#C2CBD3] mx-2 md:mx-4" />
                        
                        {/* Step 4: Apply Smart */}
                        <div className="flex flex-col items-center z-10 min-w-[60px] md:min-w-0">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#C2CBD3] transition-transform hover:scale-110 duration-200" />
                            <span className="text-[9px] md:text-[10px] font-bold text-[#C2CBD3] mt-3.5 uppercase tracking-wider text-center max-w-[80px] md:max-w-none">
                                Apply Smart
                            </span>
                        </div>
                        
                        {/* Line 4 -> Upcoming */}
                        <div className="h-[2px] flex-grow bg-[#C2CBD3] mx-2 md:mx-4" />
                        
                        {/* Step 5: Get the Offer */}
                        <div className="flex flex-col items-center z-10 min-w-[60px] md:min-w-0">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#C2CBD3] transition-transform hover:scale-110 duration-200" />
                            <span className="text-[9px] md:text-[10px] font-bold text-[#C2CBD3] mt-3.5 uppercase tracking-wider text-center max-w-[80px] md:max-w-none">
                                Get the Offer
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center items-center gap-2.5 mt-12">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                currentIndex === index 
                                    ? 'w-8 bg-[#313851]' 
                                    : 'w-2.5 bg-[#313851]/20 hover:bg-[#313851]/40'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
