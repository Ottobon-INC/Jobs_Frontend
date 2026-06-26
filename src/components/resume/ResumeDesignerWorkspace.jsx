import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Sparkles, 
    Download, 
    Printer, 
    Save, 
    X, 
    ChevronRight, 
    ChevronDown,
    Plus, 
    Trash2, 
    Settings, 
    FileText, 
    Edit, 
    Check, 
    Eye,
    Briefcase,
    GraduationCap,
    Sliders,
    Globe,
    FolderGit,
    FolderCheck,
    Award,
    Layout,
    ArrowLeft,
    Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/client';
import { listUserResumes, saveUserResume, updateUserResume, deleteUserResume } from '../../api/resumeAnalyzerApi';


// Load Google Fonts dynamically when entering workspace
const useGoogleFonts = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@300;400;600;700;800&family=Open+Sans:wght@300;400;600;700;800&family=STIX+Two+Text:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            try {
                document.head.removeChild(link);
            } catch (e) {}
        };
    }, []);
};

const resolveFontFamily = (font) => {
    if (!font) return '"Inter", sans-serif';
    switch (font) {
        case 'font-inter':
        case 'Inter':
            return '"Inter", sans-serif';
        case 'font-outfit':
        case 'Outfit':
            return '"Outfit", sans-serif';
        case 'font-roboto':
        case 'Roboto':
            return '"Roboto", sans-serif';
        case 'font-playfair':
        case 'Playfair Display':
            return '"Playfair Display", serif';
        case 'Nunito Sans':
            return '"Nunito Sans", sans-serif';
        case 'Open Sans':
            return '"Open Sans", sans-serif';
        case 'STIX Two Text':
            return '"STIX Two Text", serif';
        case 'Tahoma':
            return 'Tahoma, sans-serif';
        case 'Arial':
            return 'Arial, sans-serif';
        case 'Georgia':
            return 'Georgia, serif';
        default:
            return font.startsWith('font-') ? `"${font.substring(5)}", sans-serif` : `"${font}", sans-serif`;
    }
};

// Clean HTML tags and entities from text, converting bullet lists cleanly
const cleanTextContent = (text) => {
    if (!text) return '';
    let clean = text;
    // Replace <li> tags with bullets and newlines
    clean = clean.replace(/<\/li>\s*<li>/gi, '\n• ');
    clean = clean.replace(/<li>/gi, '• ');
    clean = clean.replace(/<\/li>/gi, '\n');
    clean = clean.replace(/<ul[^>]*>/gi, '');
    clean = clean.replace(/<\/ul>/gi, '\n');
    clean = clean.replace(/<ol[^>]*>/gi, '');
    clean = clean.replace(/<\/ol>/gi, '\n');
    clean = clean.replace(/<br\s*\/?>/gi, '\n');
    clean = clean.replace(/<p[^>]*>/gi, '');
    clean = clean.replace(/<\/p>/gi, '\n');
    // Strip other tags
    clean = clean.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    clean = clean.replace(/&nbsp;/g, ' ')
                 .replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'");
    // Split, trim, filter, and rejoin
    return clean.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
};

// Dedicated Skills Gaps & Missing Keywords Section Component
const AtsGapsSection = ({ analysisResult, accent, onInject, isInjecting }) => {
    if (!analysisResult) return null;
    
    // The weaknesses represent missing skills/keywords, and strengths represent aligned keywords
    const missingSkills = analysisResult.weaknesses || [];
    const recommendations = analysisResult.improvement_tips || [];
    const score = analysisResult.ats_score || 0;

    if (missingSkills.length === 0 && recommendations.length === 0) return null;

    return (
        <div className="mb-4 bg-white border border-zinc-200 rounded-xl p-4 print:hidden break-inside-avoid shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5" style={{ color: accent || '#3b82f6' }}>
                    <Sparkles size={14} />
                    ATS Gaps & Recommendations
                </h2>
                {missingSkills.length > 0 && onInject && (
                    <button
                        onClick={onInject}
                        disabled={isInjecting}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-all
                            ${isInjecting 
                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95'
                            }`}
                    >
                        <Sparkles size={12} />
                        {isInjecting ? 'Injecting via AI...' : 'Auto-Inject Missing Skills'}
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: Missing Keywords */}
                {missingSkills.length > 0 && (
                    <div className="bg-rose-50/30 border border-rose-100 rounded-lg p-3">
                        <h3 className="font-bold text-rose-800 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {missingSkills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-rose-100 rounded-md text-[10px] font-bold text-rose-700 flex items-center gap-0.5 shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right side: Recommendations */}
                {recommendations.length > 0 && (
                    <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-3">
                        <h3 className="font-bold text-amber-800 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Actionable Tips
                        </h3>
                        <ul className="space-y-1.5 text-zinc-700 font-medium list-disc pl-4">
                            {recommendations.slice(0, 3).map((tip, idx) => (
                                <li key={idx} className="text-[10px] leading-snug">
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="mt-3 text-[10px] text-zinc-500 font-semibold flex items-center justify-between bg-zinc-50 p-2 rounded-lg">
                <span>ATS Match Score: <span className="font-bold" style={{ color: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444' }}>{score}%</span></span>
                <span className="italic">AI can integrate missing keywords seamlessly.</span>
            </div>
        </div>
    );
};

// Onyx (Minimalist Column) Template
const OnyxTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="text-center border-b pb-3 mb-3.5" style={{ borderColor: `${accent}25` }}>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mb-0.5" style={{ color: '#18181b' }}>{basics.name}</h1>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accent }}>{basics.headline}</p>
                
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 font-medium">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.location && <span>• {basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {!summary.hidden && summary.content && (
                <div className="mb-3.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-1.5" style={{ color: accent, borderColor: `${accent}35` }}>{summary.title || "Summary"}</h2>
                    <p className="text-zinc-650 font-normal leading-normal text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                </div>
            )}

            {/* Experience */}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-3.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ color: accent, borderColor: `${accent}35` }}>{sections.experience.title || "Experience"}</h2>
                    <div className="space-y-3">
                        {sections.experience.items.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-[11.5px]">{item.position}</h3>
                                    <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="flex justify-between items-baseline text-[10.5px] font-semibold text-zinc-500 mb-1">
                                    <span>{item.company} {item.location ? `• ${item.location}` : ''}</span>
                                </div>
                                {item.description && (
                                    <div 
                                        className="text-[11px] text-zinc-600 pl-2.5 border-l-2 font-normal leading-normal whitespace-pre-line" 
                                        style={{ borderColor: `${accent}25` }}
                                    >
                                        {cleanTextContent(item.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                <div className="mb-3.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ color: accent, borderColor: `${accent}35` }}>{sections.education.title || "Education"}</h2>
                    <div className="space-y-2.5">
                        {sections.education.items.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-[11.5px]">{item.degree} {item.area ? `in ${item.area}` : ''}</h3>
                                    <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="flex justify-between items-baseline text-[10.5px] font-semibold text-zinc-500">
                                    <span>{item.school} {item.location ? `• ${item.location}` : ''}</span>
                                    {item.grade && <span className="text-[9px] font-medium bg-zinc-100 px-1 py-0.5 rounded">Grade: {item.grade}</span>}
                                </div>
                                {item.description && (
                                    <p className="text-[11px] text-zinc-600 mt-0.5 font-normal leading-normal whitespace-pre-line">{cleanTextContent(item.description)}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                <div className="mb-3.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ color: accent, borderColor: `${accent}35` }}>{sections.projects.title || "Projects"}</h2>
                    <div className="space-y-2.5">
                        {sections.projects.items.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-[11.5px] flex items-center gap-1.5">
                                        {item.name}
                                        {item.website?.url && (
                                            <a href={item.website.url} className="text-[9px] hover:underline font-medium" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                                [Link]
                                            </a>
                                        )}
                                    </h3>
                                    <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <p className="text-[11px] text-zinc-600 font-normal leading-normal whitespace-pre-line">{cleanTextContent(item.description)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                <div className="mb-3.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ color: accent, borderColor: `${accent}35` }}>{sections.skills.title || "Skills"}</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {sections.skills.items.map((skill) => (
                            <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-200/50 rounded text-[10.5px] font-medium text-zinc-700 flex items-center gap-1">
                                {skill.name}
                                {skill.proficiency && (
                                    <span className="text-[8.5px] text-zinc-400 font-normal">({skill.proficiency})</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Languages & Certifications */}
            <div className="grid grid-cols-2 gap-5">
                {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2" style={{ color: accent, borderColor: `${accent}35` }}>{sections.languages.title || "Languages"}</h2>
                        <div className="space-y-1">
                            {sections.languages.items.map((lang) => (
                                <div key={lang.id} className="text-[11px] text-zinc-700">
                                    <strong className="text-zinc-900">{lang.name}</strong>
                                    {lang.description && <span className="text-zinc-500"> — {lang.description}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2" style={{ color: accent, borderColor: `${accent}35` }}>{sections.certifications.title || "Certifications"}</h2>
                        <div className="space-y-1.5">
                            {sections.certifications.items.map((cert) => (
                                <div key={cert.id} className="flex justify-between items-start gap-1">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-[11px] leading-tight">{cert.name}</h3>
                                        <span className="text-[9px] text-zinc-500 font-medium">{cert.issuer}</span>
                                    </div>
                                    <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0 mt-0.5">{cert.period}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Pikachu (Left-Sidebar) Template
const PikachuTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#3B5F95';
    const avatarUrl = basics.photo || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80";

    return (
        <div className="w-full text-zinc-800 leading-relaxed font-sans flex min-h-full" style={{ fontSize: styling.fontSizeValue }}>
            {/* Sidebar Column */}
            <div className="w-1/3 p-6 flex flex-col gap-6 select-none text-white text-left shrink-0" style={{ backgroundColor: accent }}>
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                    <img 
                        src={avatarUrl} 
                        alt={basics.name} 
                        className="w-28 h-28 rounded-full border-4 border-white/20 object-cover shadow-md"
                    />
                </div>

                {/* Education */}
                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 border-b border-white/20 pb-1 mb-3">{sections.education.title || "Education"}</h2>
                        <div className="space-y-3.5">
                            {sections.education.items.map((item) => (
                                <div key={item.id} className="text-xs">
                                    <div className="font-bold text-white/70">{item.period}</div>
                                    <div className="font-extrabold text-white">{item.school} {item.location ? `| ${item.location}` : ''}</div>
                                    <div className="text-white/80 font-medium">{item.degree} {item.area ? `in ${item.area}` : ''}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 border-b border-white/20 pb-1 mb-3">{sections.skills.title || "Skills"}</h2>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-white/95 font-medium pl-1">
                            {sections.skills.items.map((skill) => (
                                <li key={skill.id} className="leading-tight">
                                    {skill.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Certifications */}
                {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 border-b border-white/20 pb-1 mb-3">{sections.certifications.title || "Certifications"}</h2>
                        <div className="space-y-2 text-xs">
                            {sections.certifications.items.map((cert) => (
                                <div key={cert.id} className="leading-tight">
                                    <div className="font-bold text-white">{cert.name}</div>
                                    <div className="text-[10px] text-white/70 font-semibold">{cert.issuer} {cert.period ? `| ${cert.period}` : ''}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 border-b border-white/20 pb-1 mb-3">{sections.languages.title || "Languages"}</h2>
                        <div className="space-y-2 text-xs">
                            {sections.languages.items.map((lang) => (
                                <div key={lang.id} className="leading-tight">
                                    <span className="font-bold text-white">{lang.name}</span>
                                    {lang.description && <span className="text-[10px] text-white/70 font-semibold ml-1">({lang.description})</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Column */}
            <div className="w-2/3 p-6 flex flex-col gap-6 bg-white text-left">
                {/* Header info */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1 uppercase">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: accent }}>{basics.headline}</p>
                    
                    {/* Contact details with small simple list style */}
                    <div className="space-y-1 text-xs text-zinc-650 font-semibold">
                        {basics.phone && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">📞</span>
                                <span>{basics.phone}</span>
                            </div>
                        )}
                        {basics.email && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">✉️</span>
                                <span className="break-all">{basics.email}</span>
                            </div>
                        )}
                        {basics.location && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">📍</span>
                                <span>{basics.location}</span>
                            </div>
                        )}
                        {basics.website?.url && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">🔗</span>
                                <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                    {basics.website.label || basics.website.url}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {!summary.hidden && summary.content && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b border-zinc-100" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                        <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                    </div>
                )}

                {/* Experience */}
                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-zinc-100" style={{ color: accent }}>{sections.experience.title || "Work Experience"}</h2>
                        <div className="space-y-4">
                            {sections.experience.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[9px] text-zinc-450 font-bold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs text-zinc-655 font-normal leading-relaxed whitespace-pre-line pl-2.5 border-l-2" style={{ borderColor: `${accent}20` }}>
                                            {cleanTextContent(item.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-zinc-100" style={{ color: accent }}>{sections.projects.title || "Projects"}</h2>
                        <div className="space-y-3.5">
                            {sections.projects.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1">
                                            {item.name}
                                            {item.website?.url && (
                                                <a href={item.website.url} className="text-[10px] hover:underline font-bold" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                                    [Link]
                                                </a>
                                            )}
                                        </h3>
                                        <span className="text-[9px] text-zinc-450 font-bold shrink-0">{item.period}</span>
                                    </div>
                                    <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line pl-2.5 border-l-2" style={{ borderColor: `${accent}20` }}>{cleanTextContent(item.description)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Azurill (Header Banner) Template
const AzurillTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-relaxed font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header Banner */}
            <div className="p-6 text-white text-center rounded-xl mb-6 shadow-sm flex flex-col items-center" style={{ backgroundColor: accent }}>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">{basics.name}</h1>
                <p className="text-xs font-bold tracking-widest uppercase opacity-90 mb-3">{basics.headline}</p>
                
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs opacity-80 font-medium">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.location && <span>• {basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer">
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Split Content layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left side: Exp and Projects (60% width) */}
                <div className="col-span-8 flex flex-col gap-5">
                    {/* Summary */}
                    {!summary.hidden && summary.content && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{summary.title || "Summary"}</h2>
                            <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3.5 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{sections.experience.title || "Work Experience"}</h2>
                            <div className="space-y-4">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                            {item.company} {item.location ? `• ${item.location}` : ''}
                                        </div>
                                        {item.description && (
                                            <div 
                                                className="text-xs text-zinc-650 font-normal leading-relaxed pl-3 border-l-2 whitespace-pre-line" 
                                                style={{ borderColor: `${accent}25` }}
                                            >
                                                {cleanTextContent(item.description)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3.5 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{sections.projects.title || "Projects"}</h2>
                            <div className="space-y-3">
                                {sections.projects.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1">
                                                {item.name}
                                                {item.website?.url && (
                                                    <a href={item.website.url} className="text-[10px] hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                                        [Link]
                                                    </a>
                                                )}
                                            </h3>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Skills, Edu, Certs (40% width) */}
                <div className="col-span-4 flex flex-col gap-5">
                    {/* Skills */}
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{sections.skills.title || "Skills"}</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span 
                                        key={skill.id} 
                                        className="px-2 py-0.5 border text-[10px] font-semibold rounded"
                                        style={{ 
                                            borderColor: `${accent}20`,
                                            backgroundColor: `${accent}03`,
                                            color: '#27272a'
                                        }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{sections.education.title || "Education"}</h2>
                            <div className="space-y-3">
                                {sections.education.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-zinc-900 text-[11px] leading-tight">{item.degree}</span>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-medium">
                                            {item.school}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900 border-b pb-1" style={{ borderColor: `${accent}20` }}>{sections.certifications.title || "Certifications"}</h2>
                            <div className="space-y-2">
                                {sections.certifications.items.map((cert) => (
                                    <div key={cert.id} className="flex justify-between items-start gap-1">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 text-[11px] leading-tight">{cert.name}</h3>
                                            <span className="text-[9px] text-zinc-400 font-medium">{cert.issuer}</span>
                                        </div>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0 mt-0.5">{cert.period}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Gengar (Right-Sidebar) Template
const GengarTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-relaxed font-sans flex min-h-full" style={{ fontSize: styling.fontSizeValue }}>
            {/* Main Content Column (Left, 2/3 width) */}
            <div className="w-2/3 p-6 flex flex-col gap-6">
                {/* Header */}
                <div className="border-b pb-4" style={{ borderColor: `${accent}20` }}>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{basics.headline}</p>
                </div>

                {/* Summary */}
                {!summary.hidden && summary.content && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                        <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                    </div>
                )}

                {/* Experience */}
                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: accent }}>{sections.experience.title || "Work Experience"}</h2>
                        <div className="space-y-4">
                            {sections.experience.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs text-zinc-655 font-normal leading-relaxed whitespace-pre-line">
                                            {cleanTextContent(item.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                        <div className="space-y-3.5">
                            {sections.education.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.degree} {item.area ? `in ${item.area}` : ''}</h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        <span>{item.school} {item.location ? `• ${item.location}` : ''}</span>
                                        {item.grade && <span>GPA: {item.grade}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: accent }}>{sections.projects.title || "Projects"}</h2>
                        <div className="space-y-3">
                            {sections.projects.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1">
                                            {item.name}
                                            {item.website?.url && (
                                                <a href={item.website.url} className="text-[10px] hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                                    [Link]
                                                </a>
                                            )}
                                        </h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{sections.certifications.title || "Certifications"}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {sections.certifications.items.map((cert) => (
                                <div key={cert.id} className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-xs leading-tight">{cert.name}</h3>
                                        <span className="text-[10px] text-zinc-400 font-semibold">{cert.issuer}</span>
                                    </div>
                                    <span className="text-[9px] text-zinc-400 font-semibold shrink-0 mt-0.5">{cert.period}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Column (Right, 1/3 width) */}
            <div className="w-1/3 bg-zinc-50 border-l border-zinc-200/50 p-6 flex flex-col gap-6 select-none" style={{ backgroundColor: `${accent}04` }}>
                {/* Contact Section */}
                <div>
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-3">Contact</h2>
                    <div className="space-y-2.5 text-xs text-zinc-600 font-medium">
                        {basics.email && (
                            <div className="break-all">
                                <div className="text-[9px] font-bold text-zinc-400 uppercase">Email</div>
                                <div>{basics.email}</div>
                            </div>
                        )}
                        {basics.phone && (
                            <div>
                                <div className="text-[9px] font-bold text-zinc-400 uppercase">Phone</div>
                                <div>{basics.phone}</div>
                            </div>
                        )}
                        {basics.location && (
                            <div>
                                <div className="text-[9px] font-bold text-zinc-400 uppercase">Location</div>
                                <div>{basics.location}</div>
                            </div>
                        )}
                        {basics.website?.url && (
                            <div>
                                <div className="text-[9px] font-bold text-zinc-400 uppercase">Website</div>
                                <a>{basics.website.label || basics.website.url}</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-3">{sections.skills.title || "Skills"}</h2>
                        <div className="space-y-2.5">
                            {sections.skills.items.map((skill) => (
                                <div key={skill.id}>
                                    <div className="flex justify-between items-baseline text-xs font-semibold text-zinc-700 mb-1">
                                        <span>{skill.name}</span>
                                        {skill.proficiency && <span className="text-[9px] font-medium text-zinc-400">{skill.proficiency}</span>}
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200/60 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500" 
                                            style={{ 
                                                backgroundColor: accent,
                                                width: skill.level ? `${skill.level * 20}%` : '50%'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-3.5">{sections.languages.title || "Languages"}</h2>
                        <div className="space-y-2">
                            {sections.languages.items.map((lang) => (
                                <div key={lang.id} className="text-xs">
                                    <div className="font-bold text-zinc-800">{lang.name}</div>
                                    {lang.description && <div className="text-[10px] text-zinc-400 font-semibold">{lang.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Castform (Timeline) Template
const CastformTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header Banner */}
            <div className="border-b-4 pb-4 mb-5 flex flex-col gap-2" style={{ borderColor: accent }}>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">{basics.name}</h1>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{basics.headline}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.location && <span>• {basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Summary */}
            {!summary.hidden && summary.content && (
                <div className="mb-5">
                    <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line italic bg-zinc-50/50 p-3 rounded-lg border-l-2" style={{ borderColor: accent }}>
                        {cleanTextContent(summary.content)}
                    </p>
                </div>
            )}

            {/* Timeline Experience */}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-5">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: accent }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                        {sections.experience.title || "Experience Timeline"}
                    </h2>
                    <div className="relative pl-6 border-l-2 ml-1" style={{ borderColor: `${accent}20` }}>
                        <div className="space-y-4">
                            {sections.experience.items.map((item) => (
                                <div key={item.id} className="relative">
                                    {/* Bullet point on the line */}
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border bg-white" style={{ borderColor: accent }} />
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs text-zinc-655 font-normal leading-relaxed whitespace-pre-line">
                                            {cleanTextContent(item.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Projects */}
            {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                <div className="mb-5">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: accent }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                        {sections.projects.title || "Projects Timeline"}
                    </h2>
                    <div className="relative pl-6 border-l-2 ml-1" style={{ borderColor: `${accent}20` }}>
                        <div className="space-y-4">
                            {sections.projects.items.map((item) => (
                                <div key={item.id} className="relative">
                                    {/* Bullet point on the line */}
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border bg-white" style={{ borderColor: accent }} />
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1">
                                            {item.name}
                                            {item.website?.url && (
                                                <a href={item.website.url} className="text-[10px] hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                                    [Link]
                                                </a>
                                            )}
                                        </h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid for other details (Skills, Education, Certs) */}
            <div className="grid grid-cols-2 gap-6 mt-4">
                {/* Left side: Skills */}
                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: accent }}>{sections.skills.title || "Skills"}</h2>
                        <div className="flex flex-wrap gap-1.5">
                            {sections.skills.items.map((skill) => (
                                <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-150 rounded text-[10px] font-semibold text-zinc-700">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right side: Education */}
                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                        <div className="space-y-3">
                            {sections.education.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="font-bold text-zinc-900 text-[11px] leading-tight">{item.degree}</span>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-medium">
                                        {item.school} {item.grade ? `(GPA: ${item.grade})` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Glissando (Two-Column Grid) Template
const GlissandoTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Elegant Top Bar Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: `${accent}30` }}>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: accent }}>{basics.headline}</p>
                </div>
                <div className="text-right text-xs text-zinc-500 font-medium space-y-0.5">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline block" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Summary */}
            {!summary.hidden && summary.content && (
                <div className="mb-4">
                    <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                </div>
            )}

            {/* Equal two column layout */}
            <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    {/* Experience */}
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}15` }}>{sections.experience.title || "Experience"}</h2>
                            <div className="space-y-4">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                                            {item.company}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-zinc-655 font-normal leading-relaxed whitespace-pre-line">
                                                {cleanTextContent(item.description)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Education */}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}15` }}>{sections.education.title || "Education"}</h2>
                            <div className="space-y-3">
                                {sections.education.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-zinc-900 text-[11px] leading-tight">{item.degree}</span>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-medium">
                                            {item.school} {item.grade ? `• GPA: ${item.grade}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}15` }}>{sections.projects.title || "Projects"}</h2>
                            <div className="space-y-3">
                                {sections.projects.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1">
                                                {item.name}
                                            </h3>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <p className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}15` }}>{sections.skills.title || "Skills"}</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-150 rounded text-[10px] font-semibold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Dublin (Executive) Template
const DublinTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="border-b pb-4 mb-4 resume-section" style={{ borderColor: `${accent}30` }}>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">{basics.name}</h1>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: accent }}>{basics.headline}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 font-medium">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.location && <span>• {basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="col-span-2 space-y-4">
                    {/* Professional Summary */}
                    {!summary.hidden && summary.content && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{summary.title || "Summary"}</h2>
                            <p className="text-zinc-600 font-normal text-xs whitespace-pre-line leading-relaxed">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.experience.title || "Experience"}</h2>
                            <div className="space-y-3">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id} className="resume-item">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline text-xs font-semibold text-zinc-500 mb-1.5">
                                            <span>{item.company} {item.location ? `| ${item.location}` : ''}</span>
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line pl-2 border-l" style={{ borderColor: `${accent}20` }}>
                                                {cleanTextContent(item.description)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.projects.title || "Projects"}</h2>
                            <div className="space-y-3">
                                {sections.projects.items.map((item) => (
                                    <div key={item.id} className="resume-item">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.name}</h3>
                                            <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.date}</span>
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">
                                                {cleanTextContent(item.description)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4">
                    {/* Skills */}
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.skills.title || "Skills"}</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-150 rounded text-[10px] font-semibold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.education.title || "Education"}</h2>
                            <div className="space-y-2">
                                {sections.education.items.map((item) => (
                                    <div key={item.id} className="resume-item">
                                        <div className="text-[10px] text-zinc-400 font-semibold">{item.period}</div>
                                        <h3 className="font-bold text-zinc-900 text-xs leading-tight">{item.degree}</h3>
                                        <div className="text-xs text-zinc-550 font-medium">{item.institution}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.languages.title || "Languages"}</h2>
                            <div className="space-y-1">
                                {sections.languages.items.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-xs">
                                        <span className="font-bold text-zinc-800">{lang.name}</span>
                                        <span className="text-zinc-500 font-medium">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                        <div className="resume-section">
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: accent, borderColor: `${accent}20` }}>{sections.certifications.title || "Certifications"}</h2>
                            <div className="space-y-2">
                                {sections.certifications.items.map((cert) => (
                                    <div key={cert.id} className="resume-item text-xs">
                                        <div className="font-bold text-zinc-800 leading-tight">{cert.name}</div>
                                        <div className="text-[10px] text-zinc-400 font-semibold">{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Harvard (Classic) Template
const HarvardTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="text-center mb-6 resume-section">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 mb-1 uppercase" style={{ color: accent }}>{basics.name}</h1>
                <p className="text-xs font-extrabold tracking-widest text-zinc-500 uppercase mb-3">{basics.headline}</p>
                
                <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: accent }} />
                
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-zinc-550 font-semibold mb-3">
                    {basics.location && <span>{basics.location}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.email && <span>• {basics.email}</span>}
                    {basics.website?.url && (
                        <span>• <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>{basics.website.label || 'Website'}</a></span>
                    )}
                </div>
                
                <div className="w-full h-[1px] bg-zinc-200/80 mt-1" />
            </div>

            {/* Professional Summary */}
            {!summary.hidden && summary.content && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-1.5" style={{ borderColor: accent }}>{summary.title || "Summary"}</h2>
                    <p className="text-zinc-600 font-normal text-xs whitespace-pre-line leading-relaxed">{cleanTextContent(summary.content)}</p>
                </div>
            )}

            {/* Experience */}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ borderColor: accent }}>{sections.experience.title || "Experience"}</h2>
                    <div className="space-y-3">
                        {sections.experience.items.map((item) => (
                            <div key={item.id} className="resume-item">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                    <span className="text-[10px] text-zinc-500 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="flex justify-between items-baseline text-xs font-medium text-zinc-550 mb-1">
                                    <span className="italic">{item.company}</span>
                                    <span className="text-[10px] text-zinc-400">{item.location}</span>
                                </div>
                                {item.description && (
                                    <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line pl-1.5 border-l-2" style={{ borderColor: `${accent}15` }}>
                                        {cleanTextContent(item.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ borderColor: accent }}>{sections.education.title || "Education"}</h2>
                    <div className="space-y-2">
                        {sections.education.items.map((item) => (
                            <div key={item.id} className="resume-item">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.degree}</h3>
                                    <span className="text-[10px] text-zinc-500 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="flex justify-between items-baseline text-xs font-medium text-zinc-550">
                                    <span className="italic">{item.institution}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2.5" style={{ borderColor: accent }}>{sections.projects.title || "Projects"}</h2>
                    <div className="space-y-3">
                        {sections.projects.items.map((item) => (
                            <div key={item.id} className="resume-item">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.name}</h3>
                                    <span className="text-[10px] text-zinc-500 font-semibold shrink-0">{item.date}</span>
                                </div>
                                {item.description && (
                                    <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">
                                        {cleanTextContent(item.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2" style={{ borderColor: accent }}>{sections.skills.title || "Skills"}</h2>
                    <div className="text-xs text-zinc-700 leading-relaxed">
                        <span className="font-bold text-zinc-950">Technical Skills: </span>
                        {sections.skills.items.map(s => s.name).join(', ')}
                    </div>
                </div>
            )}

            {/* Languages & Certifications Side-by-Side */}
            <div className="grid grid-cols-2 gap-4 resume-section">
                {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2" style={{ borderColor: accent }}>{sections.languages.title || "Languages"}</h2>
                        <div className="space-y-1">
                            {sections.languages.items.map((lang) => (
                                <div key={lang.id} className="text-xs text-zinc-755">
                                    <span className="font-semibold text-zinc-900">{lang.name}</span> — <span className="text-zinc-500">{lang.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2" style={{ borderColor: accent }}>{sections.certifications.title || "Certifications"}</h2>
                        <div className="space-y-1">
                            {sections.certifications.items.map((cert) => (
                                <div key={cert.id} className="text-xs text-zinc-755">
                                    <span className="font-semibold text-zinc-900">{cert.name}</span> — <span className="text-[10px] text-zinc-400 font-semibold">{cert.issuer}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Kyoto (Modern) Template
const KyotoTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="flex justify-between items-start border-l-4 pl-4 mb-4 resume-section" style={{ borderColor: accent }}>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-0.5">{basics.name}</h1>
                    <p className="text-xs font-semibold tracking-wider text-zinc-550">{basics.headline}</p>
                </div>
                <div className="text-right text-[11px] text-zinc-500 font-medium">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {!summary.hidden && summary.content && (
                <div className="mb-4 border-l-4 pl-4 resume-section border-transparent">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                    <p className="text-zinc-600 font-normal text-xs whitespace-pre-line leading-relaxed">{cleanTextContent(summary.content)}</p>
                </div>
            )}

            {/* Experience */}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pl-4 border-l-4 border-transparent" style={{ color: accent }}>{sections.experience.title || "Experience"}</h2>
                    <div className="space-y-3 border-l pl-4 ml-1.5" style={{ borderColor: `${accent}25` }}>
                        {sections.experience.items.map((item) => (
                            <div key={item.id} className="relative resume-item">
                                {/* Dot indicator */}
                                <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-white border-2" style={{ borderColor: accent }} />
                                
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                    <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="text-xs font-semibold text-zinc-550 mb-1">{item.company} {item.location ? `| ${item.location}` : ''}</div>
                                {item.description && (
                                    <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">
                                        {cleanTextContent(item.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pl-4 border-l-4 border-transparent" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                    <div className="space-y-2 border-l pl-4 ml-1.5" style={{ borderColor: `${accent}25` }}>
                        {sections.education.items.map((item) => (
                            <div key={item.id} className="relative resume-item">
                                <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-white border-2" style={{ borderColor: accent }} />
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.degree}</h3>
                                    <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                                <div className="text-xs text-zinc-550 font-medium">{item.institution}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {sections.projects && !sections.projects.hidden && sections.projects.items?.length > 0 && (
                <div className="mb-4 resume-section">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pl-4 border-l-4 border-transparent" style={{ color: accent }}>{sections.projects.title || "Projects"}</h2>
                    <div className="space-y-3 border-l pl-4 ml-1.5" style={{ borderColor: `${accent}25` }}>
                        {sections.projects.items.map((item) => (
                            <div key={item.id} className="relative resume-item">
                                <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-white border-2" style={{ borderColor: accent }} />
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-zinc-900 text-xs">{item.name}</h3>
                                    <span className="text-[10px] text-zinc-400 font-semibold shrink-0">{item.date}</span>
                                </div>
                                {item.description && (
                                    <div className="text-xs text-zinc-650 font-normal leading-relaxed whitespace-pre-line">
                                        {cleanTextContent(item.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                <div className="mb-4 border-l-4 pl-4 resume-section border-transparent">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accent }}>{sections.skills.title || "Skills"}</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {sections.skills.items.map((skill) => (
                            <span key={skill.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors" style={{ backgroundColor: `${accent}10`, color: accent }}>
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Leafish (Elegant Border Accent) Template
const LeafishTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 pb-4 mb-4" style={{ borderColor: accent }}>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{basics.headline}</p>
                </div>
                <div className="text-right text-[10px] text-zinc-500 font-medium space-y-0.5">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left column */}
                <div className="col-span-8 space-y-4">
                    {!summary.hidden && summary.content && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest pl-2 border-l-4 mb-2 flex items-center" style={{ color: accent, borderColor: accent }}>
                                {summary.title || "Summary"}
                            </h2>
                            <p className="text-zinc-650 font-normal leading-relaxed text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}

                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest pl-2 border-l-4 mb-3 flex items-center" style={{ color: accent, borderColor: accent }}>
                                {sections.experience.title || "Experience"}
                            </h2>
                            <div className="space-y-3.5">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id} className="relative pl-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-zinc-500 uppercase mb-2">
                                            {item.company} {item.location ? `• ${item.location}` : ''}
                                        </div>
                                        {item.description && (
                                            <p className="text-[10.5px] text-zinc-650 font-normal leading-relaxed whitespace-pre-line">
                                                {cleanTextContent(item.description)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div className="col-span-4 space-y-4">
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest pl-2 border-l-4 mb-2.5 flex items-center" style={{ color: accent, borderColor: accent }}>
                                {sections.skills.title || "Skills"}
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[9px] font-semibold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest pl-2 border-l-4 mb-2.5 flex items-center" style={{ color: accent, borderColor: accent }}>
                                {sections.education.title || "Education"}
                            </h2>
                            <div className="space-y-2">
                                {sections.education.items.map((item) => (
                                    <div key={item.id} className="text-[10px]">
                                        <h3 className="font-bold text-zinc-900">{item.degree} {item.area ? `in ${item.area}` : ''}</h3>
                                        <div className="text-zinc-500 font-semibold">{item.school}</div>
                                        <div className="text-[8.5px] text-zinc-400 font-semibold">{item.period}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest pl-2 border-l-4 mb-2 flex items-center" style={{ color: accent, borderColor: accent }}>
                                {sections.languages.title || "Languages"}
                            </h2>
                            <div className="space-y-1.5 text-[10px]">
                                {sections.languages.items.map((lang) => (
                                    <div key={lang.id} className="flex justify-between">
                                        <span className="font-bold text-zinc-800">{lang.name}</span>
                                        <span className="text-zinc-400 font-medium">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Rhyhorn (Solid Accent Header) Template
const RhyhornTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header Banner */}
            <div className="p-6 text-white rounded-xl mb-4 flex justify-between items-center" style={{ backgroundColor: accent }}>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-0.5">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-90">{basics.headline}</p>
                </div>
                <div className="text-right text-[10px] opacity-80 font-medium space-y-0.5">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <div>
                            <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer">
                                {basics.website.label || basics.website.url}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="space-y-4 px-2">
                {!summary.hidden && summary.content && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">About Me</h2>
                        <p className="text-zinc-650 font-normal leading-relaxed text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                    </div>
                )}

                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">{sections.experience.title || "Experience"}</h2>
                        <div className="space-y-3">
                            {sections.experience.items.map((item) => (
                                <div key={item.id} className="border-l-2 pl-3" style={{ borderColor: `${accent}30` }}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <p className="text-[10.5px] text-zinc-650 leading-relaxed whitespace-pre-line">
                                            {cleanTextContent(item.description)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">{sections.education.title || "Education"}</h2>
                            <div className="space-y-2">
                                {sections.education.items.map((item) => (
                                    <div key={item.id} className="border-l-2 pl-3" style={{ borderColor: `${accent}30` }}>
                                        <h3 className="font-bold text-zinc-900 text-[11px]">{item.degree}</h3>
                                        <div className="text-[9px] font-semibold text-zinc-500">{item.school}</div>
                                        <div className="text-[8.5px] text-zinc-400 font-semibold">{item.period}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">{sections.skills.title || "Skills"}</h2>
                            <div className="flex flex-wrap gap-1">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-155 rounded text-[9px] font-semibold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Chikorita (Minimal Horizontal Accents) Template
const ChikoritaTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-0.5">{basics.name}</h1>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: accent }}>{basics.headline}</p>
                <div className="flex flex-wrap gap-x-4 text-[10.5px] text-zinc-500 font-semibold border-b pb-2">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {basics.location && <span>{basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="space-y-4">
                {!summary.hidden && summary.content && (
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                        <div className="h-[2px] w-12 mb-2" style={{ backgroundColor: accent }} />
                        <p className="text-zinc-650 font-normal leading-relaxed text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                    </div>
                )}

                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{sections.experience.title || "Experience"}</h2>
                        <div className="h-[2px] w-12 mb-2.5" style={{ backgroundColor: accent }} />
                        <div className="space-y-3">
                            {sections.experience.items.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[9px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5">
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <p className="text-[10.5px] text-zinc-650 leading-relaxed whitespace-pre-line">
                                            {cleanTextContent(item.description)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                        <div className="h-[2px] w-12 mb-2.5" style={{ backgroundColor: accent }} />
                        <div className="space-y-2">
                            {sections.education.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-[11px]">{item.degree} {item.area ? `in ${item.area}` : ''}</h3>
                                        <div className="text-[9px] text-zinc-500 font-semibold">{item.school}</div>
                                    </div>
                                    <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{sections.skills.title || "Skills"}</h2>
                        <div className="h-[2px] w-12 mb-2" style={{ backgroundColor: accent }} />
                        <div className="flex flex-wrap gap-1">
                            {sections.skills.items.map((skill) => (
                                <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-150 rounded text-[9px] font-semibold text-zinc-700">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Kakuna (Two-Column Corporate) Template
const KakunaTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="grid grid-cols-12 gap-6 border-b pb-4 mb-4" style={{ borderColor: `${accent}30` }}>
                <div className="col-span-7">
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-0.5">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{basics.headline}</p>
                </div>
                <div className="col-span-5 text-right text-[10px] text-zinc-500 font-semibold space-y-0.5">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <div>
                            <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                {basics.website.label || 'Website'}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Column (7/12) */}
                <div className="col-span-7 space-y-4">
                    {!summary.hidden && summary.content && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                            <p className="text-zinc-650 font-normal leading-relaxed text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}

                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2.5" style={{ color: accent }}>{sections.experience.title || "Experience"}</h2>
                            <div className="space-y-3.5">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-zinc-450 uppercase mb-2">
                                            {item.company} {item.location ? `• ${item.location}` : ''}
                                        </div>
                                        {item.description && (
                                            <p className="text-[10.5px] text-zinc-650 leading-relaxed whitespace-pre-line">
                                                {cleanTextContent(item.description)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Divider (1/12 margin) and Right Column (5/12) */}
                <div className="col-span-5 border-l pl-5 space-y-4" style={{ borderColor: `${accent}15` }}>
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2.5" style={{ color: accent }}>{sections.skills.title || "Skills"}</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-150 rounded text-[9px] font-semibold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                            <div className="space-y-2">
                                {sections.education.items.map((item) => (
                                    <div key={item.id}>
                                        <h3 className="font-bold text-zinc-900 text-[10.5px] leading-tight">{item.degree}</h3>
                                        <div className="text-[9px] text-zinc-500 font-semibold">{item.school}</div>
                                        <div className="text-[8.5px] text-zinc-400 font-semibold">{item.period}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: accent }}>{sections.languages.title || "Languages"}</h2>
                            <div className="space-y-1 text-[10px]">
                                {sections.languages.items.map((lang) => (
                                    <div key={lang.id} className="flex justify-between">
                                        <span className="font-bold text-zinc-800">{lang.name}</span>
                                        <span className="text-zinc-400 font-medium">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const EeveeTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="text-center py-5 border-t-4 border-b border-zinc-200 mb-5" style={{ borderTopColor: accent }}>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1">{basics.name}</h1>
                <p className="text-xs font-bold tracking-widest uppercase mb-3.5" style={{ color: accent }}>{basics.headline}</p>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-zinc-500">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>• {basics.phone}</span>}
                    {basics.location && <span>• {basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline font-bold" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            • {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Side (8/12) */}
                <div className="col-span-8 space-y-5">
                    {/* Summary */}
                    {!summary.hidden && summary.content && (
                        <div>
                            <div className="flex items-center mb-2">
                                <h2 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-100 border-l-4" style={{ color: accent, borderLeftColor: accent }}>{summary.title || "Summary"}</h2>
                            </div>
                            <p className="text-zinc-650 font-normal leading-relaxed text-[11px] whitespace-pre-line pl-1">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h2 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-100 border-l-4" style={{ color: accent, borderLeftColor: accent }}>{sections.experience.title || "Experience"}</h2>
                            </div>
                            <div className="space-y-4 pl-1">
                                {sections.experience.items.map((item) => (
                                    <div key={item.id} className="relative pl-3 border-l resume-item" style={{ borderColor: `${accent}25` }}>
                                        {/* Dot marker */}
                                        <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5" style={{ backgroundColor: accent }} />
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                            <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-zinc-500 mb-2">
                                            {item.company} {item.location ? `• ${item.location}` : ''}
                                        </div>
                                        {item.description && (
                                            <p className="text-[10.5px] text-zinc-655 leading-relaxed whitespace-pre-line">
                                                {cleanTextContent(item.description)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side (4/12) */}
                <div className="col-span-4 space-y-5">
                    {/* Skills */}
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h2 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-100 border-l-4 w-full" style={{ color: accent, borderLeftColor: accent }}>{sections.skills.title || "Skills"}</h2>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-1">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[9.5px] font-bold text-zinc-700 hover:border-zinc-300 transition-colors">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h2 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-100 border-l-4 w-full" style={{ color: accent, borderLeftColor: accent }}>{sections.education.title || "Education"}</h2>
                            </div>
                            <div className="space-y-3 pl-1">
                                {sections.education.items.map((item) => (
                                    <div key={item.id} className="text-[10px] resume-item">
                                        <h3 className="font-bold text-zinc-900 leading-snug">{item.degree}</h3>
                                        <div className="text-zinc-500 font-semibold mt-0.5">{item.school}</div>
                                        <div className="text-[8.5px] text-zinc-400 font-semibold mt-0.5">{item.period}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {sections.languages && !sections.languages.hidden && sections.languages.items?.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h2 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-100 border-l-4 w-full" style={{ color: accent, borderLeftColor: accent }}>{sections.languages.title || "Languages"}</h2>
                            </div>
                            <div className="space-y-1.5 text-[10px] pl-1">
                                {sections.languages.items.map((lang) => (
                                    <div key={lang.id} className="flex justify-between">
                                        <span className="font-bold text-zinc-800">{lang.name}</span>
                                        <span className="text-zinc-400 font-medium">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CharmanderTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor;

    return (
        <div className="w-full text-zinc-800 leading-normal font-sans" style={{ fontSize: styling.fontSizeValue }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-5 mb-5" style={{ borderColor: `${accent}20` }}>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1">{basics.name}</h1>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{basics.headline}</p>
                </div>
                <div className="text-right text-[10px] text-zinc-500 font-semibold space-y-0.5">
                    {basics.email && <div>{basics.email}</div>}
                    {basics.phone && <div>{basics.phone}</div>}
                    {basics.location && <div>{basics.location}</div>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline block font-bold" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>

            {/* Split layout: Section titles left, contents right */}
            <div className="space-y-5">
                {/* Summary Section */}
                {!summary.hidden && summary.content && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3">
                            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-right" style={{ color: accent }}>{summary.title || "Summary"}</h2>
                        </div>
                        <div className="col-span-9">
                            <p className="text-zinc-655 font-normal leading-relaxed text-[11px] whitespace-pre-line">{cleanTextContent(summary.content)}</p>
                        </div>
                    </div>
                )}

                {/* Experience Section */}
                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3">
                            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-right" style={{ color: accent }}>{sections.experience.title || "Experience"}</h2>
                        </div>
                        <div className="col-span-9 space-y-4">
                            {sections.experience.items.map((item) => (
                                <div key={item.id} className="resume-item">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-zinc-900 text-xs">{item.position}</h3>
                                        <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0">{item.period}</span>
                                    </div>
                                    <div className="text-[9px] font-bold text-zinc-500 mb-1.5">
                                        {item.company} {item.location ? `• ${item.location}` : ''}
                                    </div>
                                    {item.description && (
                                        <p className="text-[10.5px] text-zinc-650 leading-relaxed whitespace-pre-line">
                                            {cleanTextContent(item.description)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Section */}
                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3">
                            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-right" style={{ color: accent }}>{sections.skills.title || "Skills"}</h2>
                        </div>
                        <div className="col-span-9">
                            <div className="flex flex-wrap gap-1.5">
                                {sections.skills.items.map((skill) => (
                                    <span key={skill.id} className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[9.5px] font-bold text-zinc-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Education Section */}
                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3">
                            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-right" style={{ color: accent }}>{sections.education.title || "Education"}</h2>
                        </div>
                        <div className="col-span-9 space-y-3">
                            {sections.education.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start resume-item">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-[10.5px] leading-snug">{item.degree}</h3>
                                        <div className="text-zinc-500 font-semibold text-[9.5px] mt-0.5">{item.school}</div>
                                    </div>
                                    <span className="text-[8.5px] text-zinc-400 font-semibold shrink-0 mt-0.5">{item.period}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const galleryMockData = {
    basics: {
        name: "Kelly Blackwell",
        headline: "Administrative Assistant",
        email: "kelly.blackwell@gmail.com",
        phone: "(210) 286-1624",
        location: "San Antonio, TX",
        website: { url: "https://linkedin.com", label: "LinkedIn" }
    },
    summary: {
        title: "Professional Summary",
        content: "Administrative assistant with 6+ years of experience organizing presentations, preparing facility reports, and maintaining the utmost confidentiality. Possess a B.A. in History and expertise in Microsoft Excel. Looking to leverage my wealth of knowledge and experience into the open administrative assistant role.",
        hidden: false
    },
    sections: {
        experience: {
            title: "Work Experience",
            hidden: false,
            items: [
                {
                    id: "exp-1",
                    position: "Administrative Assistant",
                    company: "Redford & Sons",
                    location: "Boston, MA",
                    period: "Sept 2017 – Present",
                    description: "Schedule and coordinate meetings, appointments, and travel arrangements.\nTrain 2 administrative assistants during a company expansion.\nDeveloped new filing and organizational practices, saving the company $3,000 per year."
                },
                {
                    id: "exp-2",
                    position: "Secretary",
                    company: "Bright Spot LTD",
                    location: "Boston, MA",
                    period: "June 2016 – August 2017",
                    description: "Typed documents such as correspondence, drafts, memos, and emails, and prepared 3 report packets weekly for management.\nOpened, sorted, and distributed incoming messages and mail."
                }
            ]
        },
        education: {
            title: "Education",
            hidden: false,
            items: [
                {
                    id: "edu-1",
                    degree: "Bachelor of Arts",
                    area: "Finance",
                    school: "Brown University",
                    location: "Providence, RI",
                    period: "09/2009 – 05/2013",
                    grade: "3.8"
                }
            ]
        },
        skills: {
            title: "Skills",
            hidden: false,
            items: [
                { id: "sk-1", name: "Analytical Thinking", level: 5, proficiency: "Expert" },
                { id: "sk-2", name: "Tolerant & Flexible", level: 4, proficiency: "Advanced" },
                { id: "sk-3", name: "Team Leadership", level: 4, proficiency: "Advanced" }
            ]
        },
        languages: {
            title: "Languages",
            hidden: false,
            items: [
                { id: "lang-1", name: "English", description: "Native" },
                { id: "lang-2", name: "Spanish", description: "Conversational" }
            ]
        },
        certifications: {
            title: "Certifications",
            hidden: false,
            items: [
                { id: "cert-1", name: "CPR Certified", issuer: "Red Cross", period: "2018" }
            ]
        }
    }
};

export default function ResumeDesignerWorkspace({ resumeData, setResumeData, initialStyling = {}, analysisResult, onClose }) {
    useGoogleFonts();
    const navigate = useNavigate();

    // Default layout setup
    const [styling, setStyling] = useState(() => {
        const stored = sessionStorage.getItem('designer_styling');
        if (stored) {
            try {
                return {
                    template: 'onyx',
                    fontFamily: 'Inter',
                    accentColor: '#3b82f6',
                    fontSize: 'Default',
                    fontSizeValue: '12px',
                    sectionSpacing: 16,
                    paragraphSpacing: 12,
                    lineSpacing: 1.4,
                    marginSize: 'normal',
                    marginPadding: 'p-10',
                    fitToSinglePage: true,
                    fitScale: 1.0,
                    ...JSON.parse(stored),
                    ...initialStyling
                };
            } catch (e) {
                console.error("Failed to parse designer_styling", e);
            }
        }
        return {
            template: 'onyx',
            fontFamily: 'Inter',
            accentColor: '#3b82f6', // blue
            fontSize: 'Default', // Small, Default, Large
            fontSizeValue: '12px',
            sectionSpacing: 16,
            paragraphSpacing: 12,
            lineSpacing: 1.4,
            marginSize: 'normal', // compact, normal, spacious
            marginPadding: 'p-10',
            fitToSinglePage: true,
            fitScale: 1.0,
            ...initialStyling
        };
    });

    const [showGallery, setShowGallery] = useState(() => {
        const stored = sessionStorage.getItem('designer_showGallery');
        return stored !== null ? stored === 'true' : true;
    });
    const [cameFromEditor, setCameFromEditor] = useState(() => {
        const stored = sessionStorage.getItem('designer_cameFromEditor');
        return stored === 'true';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [columnFilter, setColumnFilter] = useState('all');
    const [graphicsFilter, setGraphicsFilter] = useState('all');
    const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
    const [graphicsDropdownOpen, setGraphicsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('designer_activeTab') || 'edit';
    }); // edit, formatting, saved

    useEffect(() => {
        sessionStorage.setItem('designer_styling', JSON.stringify(styling));
    }, [styling]);

    useEffect(() => {
        sessionStorage.setItem('designer_showGallery', showGallery.toString());
    }, [showGallery]);

    useEffect(() => {
        sessionStorage.setItem('designer_cameFromEditor', cameFromEditor.toString());
    }, [cameFromEditor]);

    useEffect(() => {
        sessionStorage.setItem('designer_activeTab', activeTab);
    }, [activeTab]);

    const [fitScale, setFitScale] = useState(1.0);
    const [previewPageCount, setPreviewPageCount] = useState(1);

    useEffect(() => {
        const autoFit = () => {
            const element = document.getElementById('resume-a4-canvas');
            if (!element) return;

            // Find the template child element
            const templateElement = Array.from(element.children).find(
                child => !child.classList.contains('print:hidden') && !child.classList.contains('print-hidden') && child.tagName !== 'STYLE'
            ) || element.firstElementChild;
            if (!templateElement) return;

            let paddingVal = 40;
            if (styling.marginPadding === 'p-6') paddingVal = 24;
            else if (styling.marginPadding === 'p-14') paddingVal = 56;

            const maxPageHeight = 1122;
            const availableHeight = maxPageHeight - (paddingVal * 2);

            if (!styling.fitToSinglePage) {
                setFitScale(1.0);
                element.style.setProperty('--fit-scale', '1.0');
                const contentHeight = templateElement.offsetHeight;
                const actualHeight = contentHeight + (paddingVal * 2);
                const pageCount = Math.max(1, Math.ceil(actualHeight / maxPageHeight));
                setPreviewPageCount(pageCount);
                return;
            }

            // Temporarily set fit-scale to 1.0 to measure unscaled height
            element.style.setProperty('--fit-scale', '1.0');
            const unscaledContentHeight = templateElement.offsetHeight;

            if (unscaledContentHeight > availableHeight) {
                const ratio = availableHeight / unscaledContentHeight;
                // Clamp scale between 0.4 and 1.0 to guarantee readability
                const newScale = Math.max(0.4, Math.min(1.0, ratio));
                setFitScale(newScale);
                element.style.setProperty('--fit-scale', newScale.toString());
            } else {
                setFitScale(1.0);
                element.style.setProperty('--fit-scale', '1.0');
            }
            setPreviewPageCount(1);
        };

        autoFit();
        const timer = setTimeout(autoFit, 150);
        return () => clearTimeout(timer);
    }, [
        resumeData,
        styling.template,
        styling.fontFamily,
        styling.marginPadding,
        styling.fitToSinglePage,
        styling.fontSizeValue,
        styling.sectionSpacing,
        styling.paragraphSpacing,
        styling.lineSpacing
    ]);

    const [openSection, setOpenSection] = useState('basics'); // basics, summary, experience, etc.
    const [savedResumes, setSavedResumes] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [resumeTitle, setResumeTitle] = useState("My Tailored Resume");
    const [activeResumeId, setActiveResumeId] = useState(null);
    const [selectedResumeIds, setSelectedResumeIds] = useState([]);
    const [exportingDocx, setExportingDocx] = useState(false);
    const printAreaRef = useRef();

    const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
    const [isInjecting, setIsInjecting] = useState(false);

    const handleInjectSkills = async () => {
        if (!analysisResult?.weaknesses?.length) return;
        setIsInjecting(true);
        const toastId = toast.loading("Injecting missing skills...");
        
        try {
            // Transform missing skills into standard schema objects
            const newSkills = analysisResult.weaknesses.map(skill => ({
                id: crypto.randomUUID(),
                name: skill,
                level: 0,
                proficiency: '',
                hidden: false,
                keywords: []
            }));
            
            // Append them directly to the skills section locally
            setResumeData(prev => {
                const existingSkills = prev.sections.skills?.items || [];
                return {
                    ...prev,
                    sections: {
                        ...prev.sections,
                        skills: {
                            ...(prev.sections.skills || {}),
                            items: [...existingSkills, ...newSkills]
                        }
                    }
                };
            });
            
            toast.success("Skills added to your Skills Section!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to inject skills.", { id: toastId });
        } finally {
            setIsInjecting(false);
        }
    };

    
const BronzorTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#1f2937';
    return (
        <div className="w-full flex bg-white text-zinc-800 leading-relaxed font-sans min-h-full" style={{ fontSize: styling.fontSizeValue }}>
            <div className="w-3/5 flex flex-col">
                <div className="bg-[#f3f0e7] px-8 py-10 flex flex-col justify-end" style={{ backgroundColor: `${accent}15` }}>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 uppercase leading-none mb-2">{basics.name}</h1>
                    <h2 className="text-sm font-bold tracking-widest text-zinc-600 uppercase mb-6">{basics.headline}</h2>
                    <div className="flex flex-col gap-1 text-xs font-semibold text-zinc-600 mt-2">
                        {basics.email && <div className="flex items-center gap-2"><span>✉</span> {basics.email}</div>}
                        {basics.phone && <div className="flex items-center gap-2"><span>☎</span> {basics.phone}</div>}
                        {basics.location && <div className="flex items-center gap-2"><span>📍</span> {basics.location}</div>}
                        {basics.website?.url && (
                            <div className="flex items-center gap-2">
                                <span>🔗</span>
                                <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer">
                                    {basics.website.label || 'Website'}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white px-8 py-6 flex-1">
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-zinc-900">Experience</h3>
                            <div className="space-y-4">
                                {sections.experience.items.map(item => (
                                    <div key={item.id}>
                                        <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.company} <span className="font-normal mx-1">-</span> {item.position}</div>
                                        <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} • {item.period}</div>
                                        {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line pl-3 border-l-2" style={{ borderColor: `${accent}30` }}>{cleanTextContent(item.description)}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-2/5 flex flex-col">
                <div className="bg-[#e4dcc7] px-6 py-10 flex flex-col" style={{ backgroundColor: `${accent}25` }}>
                    {!summary.hidden && summary.content && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900">Professional Summary</h3>
                            <p className="text-xs text-zinc-700 font-medium leading-relaxed">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}
                </div>
                <div className="bg-[#f3f0e7] px-6 py-6 flex-1" style={{ backgroundColor: `${accent}10` }}>
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900">Education</h3>
                            <div className="space-y-3">
                                {sections.education.items.map(item => (
                                    <div key={item.id}>
                                        <div className="font-bold text-xs text-zinc-900">{item.school}</div>
                                        <div className="text-[10px] text-zinc-600">{item.location} • {item.period}</div>
                                        <div className="text-xs text-zinc-800 font-semibold">{item.degree}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900">Skills</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                                {sections.skills.items.map(skill => <li key={skill.id}>{skill.name}</li>)}
                            </ul>
                        </div>
                    )}
                    {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-900">Certifications</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                                {sections.certifications.items.map(cert => <li key={cert.id}>{cert.name} / {cert.period}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const GlalieTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#18181b';
    return (
        <div className="w-full text-zinc-800 leading-relaxed font-sans px-8 py-8" style={{ fontSize: styling.fontSizeValue }}>
            <div className="flex gap-6 border-b-2 pb-4 mb-4" style={{ borderColor: accent }}>
                <div className="w-24 h-24 rounded-sm bg-zinc-200 shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl font-light tracking-wide text-zinc-900 uppercase mb-1">{basics.name}</h1>
                    <div className="text-white text-xs font-bold uppercase tracking-widest px-3 py-1 inline-block w-fit" style={{ backgroundColor: accent }}>{basics.headline}</div>
                    <div className="flex items-center gap-4 text-[10px] font-semibold text-zinc-500 mt-3">
                        {basics.phone && <span>📞 {basics.phone}</span>}
                        {basics.email && <span>✉ {basics.email}</span>}
                        {basics.location && <span>📍 {basics.location}</span>}
                        {basics.website?.url && (
                            <span>
                                🔗 <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                    {basics.website.label || 'Website'}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {!summary.hidden && summary.content && (
                <div className="mb-5">
                    <div className="text-white text-xs font-bold uppercase tracking-widest px-2 py-0.5 mb-2 inline-block" style={{ backgroundColor: accent }}>Professional Summary</div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">{cleanTextContent(summary.content)}</p>
                </div>
            )}
            <div className="flex gap-6">
                <div className="w-1/3 flex flex-col gap-5">
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <div className="text-white text-xs font-bold uppercase tracking-widest px-2 py-0.5 mb-3 inline-block" style={{ backgroundColor: accent }}>Skills</div>
                            <ul className="list-none text-xs text-zinc-700 space-y-1.5 font-medium">
                                {sections.skills.items.map(skill => <li key={skill.id} className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-800 rounded-full" />{skill.name}</li>)}
                            </ul>
                        </div>
                    )}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <div className="text-white text-xs font-bold uppercase tracking-widest px-2 py-0.5 mb-3 inline-block" style={{ backgroundColor: accent }}>Education</div>
                            <div className="space-y-3">
                                {sections.education.items.map(item => (
                                    <div key={item.id}>
                                        <div className="text-[10px] font-bold text-zinc-900 mb-0.5">{item.period}</div>
                                        <div className="text-xs font-bold uppercase text-zinc-800">{item.degree}</div>
                                        <div className="text-[10px] text-zinc-500">{item.school}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-2/3 flex flex-col gap-5">
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <div className="text-white text-xs font-bold uppercase tracking-widest px-2 py-0.5 mb-3 inline-block" style={{ backgroundColor: accent }}>Experience</div>
                            <div className="space-y-4">
                                {sections.experience.items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-24 shrink-0 text-[10px] font-bold text-zinc-500">{item.period}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xs uppercase text-zinc-900">{item.position}</h3>
                                            <div className="text-[10px] italic text-zinc-600 mb-1">{item.company}, {item.location}</div>
                                            {item.description && <div className="text-xs text-zinc-650 leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DittoTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#000000';
    return (
        <div className="w-full text-zinc-800 leading-relaxed font-serif px-10 py-10" style={{ fontSize: styling.fontSizeValue }}>
            <div className="text-center mb-6">
                <h1 className="text-4xl font-normal text-zinc-900 mb-1" style={{ color: accent }}>{basics.name}</h1>
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-600 mb-2">{basics.headline}</h2>
                <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-600 font-sans">
                    {basics.phone && <span>{basics.phone}</span>}
                    {basics.email && <span>{basics.email}</span>}
                    {basics.location && <span>{basics.location}</span>}
                    {basics.website?.url && (
                        <span>
                            • <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                {basics.website.label || 'Website'}
                            </a>
                        </span>
                    )}
                </div>
                <div className="w-full border-b mt-3" style={{ borderColor: `${accent}40` }} />
            </div>
            {!summary.hidden && summary.content && (
                <div className="mb-6 font-sans text-xs leading-relaxed text-zinc-700 italic text-center px-4">
                    {cleanTextContent(summary.content)}
                </div>
            )}
            {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-3" style={{ color: accent }}>Skills</h3>
                    <div className="grid grid-cols-2 gap-y-1 font-sans text-xs text-zinc-700 pl-4">
                        {sections.skills.items.map(skill => <div key={skill.id} className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-400 rounded-full"/>{skill.name}</div>)}
                    </div>
                </div>
            )}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-3" style={{ color: accent }}>Experience</h3>
                    <div className="space-y-4">
                        {sections.experience.items.map(item => (
                            <div key={item.id} className="font-sans">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="font-bold text-xs text-zinc-900 uppercase">{item.position}</h4>
                                    <span className="text-[10px] font-bold text-zinc-600">{item.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="text-[11px] italic text-zinc-700">{item.company}</div>
                                    <span className="text-[10px] italic text-zinc-500">{item.period}</span>
                                </div>
                                {item.description && <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line pl-2">{cleanTextContent(item.description)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-3" style={{ color: accent }}>Education</h3>
                    <div className="space-y-3">
                        {sections.education.items.map(item => (
                            <div key={item.id} className="font-sans flex justify-between items-baseline">
                                <div>
                                    <div className="font-bold text-xs text-zinc-900 uppercase">{item.degree}</div>
                                    <div className="text-[11px] italic text-zinc-700">{item.school}, {item.location}</div>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-600">{item.period}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const JigglypuffTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#3b82f6';
    return (
        <div className="w-full text-zinc-800 leading-relaxed font-sans" style={{ fontSize: styling.fontSizeValue }}>
            <div className="w-full flex items-center px-10 py-8" style={{ backgroundColor: accent }}>
                <div className="w-20 h-20 rounded-full border-2 border-white shrink-0 overflow-hidden shadow-sm mr-6">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-right text-white">
                    <h1 className="text-3xl font-black tracking-tight uppercase mb-0.5">{basics.name}</h1>
                    <h2 className="text-sm font-bold tracking-wider">{basics.headline}</h2>
                </div>
            </div>
            <div className="flex px-8 py-6 gap-8">
                <div className="w-[35%] flex flex-col gap-6">
                    <div className="mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Contact</h3>
                        <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
                            {basics.phone && <div><span className="font-black text-zinc-900 block text-[9px] mb-0.5">Phone</span>{basics.phone}</div>}
                            {basics.email && <div><span className="font-black text-zinc-900 block text-[9px] mb-0.5">Email</span>{basics.email}</div>}
                            {basics.location && <div><span className="font-black text-zinc-900 block text-[9px] mb-0.5">Address</span>{basics.location}</div>}
                            {basics.website?.url && (
                                <div>
                                    <span className="font-black text-zinc-900 block text-[9px] mb-0.5">Website</span>
                                    <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                        {basics.website.label || basics.website.url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Skills</h3>
                            <ul className="list-none space-y-1 text-xs text-zinc-700 font-medium">
                                {sections.skills.items.map(skill => <li key={skill.id} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-sm" style={{backgroundColor: accent}}/>{skill.name}</li>)}
                            </ul>
                        </div>
                    )}
                    {sections.certifications && !sections.certifications.hidden && sections.certifications.items?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Certifications</h3>
                            <ul className="list-none space-y-2 text-xs text-zinc-700 font-medium">
                                {sections.certifications.items.map(cert => <li key={cert.id}>• {cert.name} <span className="text-[9px] text-zinc-400 block ml-2">{cert.period}</span></li>)}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="w-[65%] flex flex-col gap-6 border-l pl-8" style={{ borderColor: `${accent}20` }}>
                    {!summary.hidden && summary.content && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Professional Summary</h3>
                            <p className="text-xs text-zinc-650 font-medium leading-relaxed">{cleanTextContent(summary.content)}</p>
                        </div>
                    )}
                    {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Experience</h3>
                            <div className="space-y-4">
                                {sections.experience.items.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-10 w-3 h-3 rounded-full mt-1 border-[3px] border-white ring-1 ring-zinc-200" style={{ backgroundColor: accent }} />
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-bold text-xs text-zinc-900">{item.position}</h4>
                                            <span className="text-[10px] font-bold text-zinc-500">{item.period}</span>
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">{item.company}</div>
                                        {item.description && <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{cleanTextContent(item.description)}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b-2 pb-1" style={{ color: accent, borderColor: `${accent}30` }}>Education</h3>
                            <div className="space-y-3">
                                {sections.education.items.map(item => (
                                    <div key={item.id}>
                                        <h4 className="font-bold text-xs text-zinc-900">{item.degree}</h4>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.school}</div>
                                        <div className="text-[9px] font-bold text-zinc-500">{item.period}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CelebiTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#6366f1';
    return (
        <div className="w-full min-h-full p-2 bg-white flex flex-col">
            <div className="w-full min-h-full border-[3px] rounded-2xl px-10 py-8 flex flex-col font-sans" style={{ borderColor: accent, fontSize: styling.fontSizeValue }}>
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight mb-1" style={{ color: accent }}>{basics.name}</h1>
                    <h2 className="text-sm font-bold text-zinc-600 mb-1.5">{basics.headline}</h2>
                    <div className="flex gap-4 text-[10px] font-medium text-zinc-500">
                        {basics.phone && <span>{basics.phone}</span>}
                        {basics.email && <span>| {basics.email}</span>}
                        {basics.location && <span>| {basics.location}</span>}
                        {basics.website?.url && (
                            <span>
                                | <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                                    {basics.website.label || 'Website'}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
                {!summary.hidden && summary.content && (
                    <div className="mb-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>Professional Summary</h3>
                        <p className="text-xs text-zinc-600 leading-relaxed font-medium">{cleanTextContent(summary.content)}</p>
                    </div>
                )}
                {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                    <div className="mb-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Experience</h3>
                        <div className="space-y-3">
                            {sections.experience.items.map(item => (
                                <div key={item.id}>
                                    <div className="font-bold text-xs text-zinc-900">{item.position}, {item.company}, {item.period}</div>
                                    {item.description && <ul className="list-disc list-outside ml-3 text-xs text-zinc-650 mt-1 space-y-0.5">
                                        {cleanTextContent(item.description).split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line.replace(/^[-•]\s*/, '')}</li>)}
                                    </ul>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                    <div className="mb-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Education</h3>
                        <div className="space-y-2">
                            {sections.education.items.map(item => (
                                <div key={item.id}>
                                    <div className="font-bold text-xs text-zinc-900">{item.degree}</div>
                                    <div className="text-[11px] text-zinc-700">{item.school}, {item.period}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                    <div className="mb-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Skills</h3>
                        <div className="grid grid-cols-2 gap-y-1 text-xs text-zinc-700">
                            {sections.skills.items.map(skill => <div key={skill.id} className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-400"/>{skill.name}</div>)}
                        </div>
                    </div>
                )}
            </div>
        
            {/* Custom Sections */}
            {sections.custom && sections.custom.map(sec => !sec.hidden && sec.items?.length > 0 && (
                <div key={sec.id} className="mt-5 mb-5 custom-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styling?.accentColor || '#1f2937' }}>{sec.title}</h3>
                    <div className="space-y-4">
                        {sec.items.map(item => (
                            <div key={item.id}>
                                <div className="flex font-bold text-xs text-zinc-900 mb-0.5">{item.name} {item.subtitle && <span className="font-normal mx-1">- {item.subtitle}</span>}</div>
                                <div className="text-[10px] text-zinc-500 font-semibold mb-2">{item.location} {item.location && item.period ? '•' : ''} {item.period}</div>
                                {item.description && <div className="text-xs text-zinc-600 whitespace-pre-line">{typeof cleanTextContent === 'function' ? cleanTextContent(item.description) : item.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const LucarioTemplate = ({ data, styling }) => {
    const { basics, summary, sections } = data;
    const accent = styling.accentColor || '#8b5cf6';
    return (
        <div className="w-full text-zinc-800 leading-relaxed font-serif px-10 py-8" style={{ fontSize: styling.fontSizeValue }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-normal text-zinc-900 uppercase tracking-wide mb-1">{basics.name}</h1>
                        <h2 className="text-xs font-bold text-zinc-600" style={{ color: accent }}>{basics.headline}</h2>
                    </div>
                </div>
                <div className="text-[9px] text-zinc-600 font-sans flex flex-col items-end gap-0.5">
                    {basics.phone && <span>{basics.phone}</span>}
                    {basics.email && <span>{basics.email}</span>}
                    {basics.location && <span>{basics.location}</span>}
                    {basics.website?.url && (
                        <a href={basics.website.url} className="hover:underline" target="_blank" rel="noreferrer" style={{ color: accent }}>
                            {basics.website.label || 'Website'}
                        </a>
                    )}
                </div>
            </div>
            {!summary.hidden && summary.content && (
                <div className="mb-5 font-sans">
                    <h3 className="text-[10px] font-black uppercase tracking-widest py-1 border-y border-zinc-200 mb-2" style={{ color: accent }}>Professional Summary</h3>
                    <p className="text-xs text-zinc-700 font-medium leading-relaxed">{cleanTextContent(summary.content)}</p>
                </div>
            )}
            {sections.experience && !sections.experience.hidden && sections.experience.items?.length > 0 && (
                <div className="mb-5 font-sans">
                    <h3 className="text-[10px] font-black uppercase tracking-widest py-1 border-y border-zinc-200 mb-3" style={{ color: accent }}>Experience</h3>
                    <div className="space-y-4">
                        {sections.experience.items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-32 shrink-0">
                                    <div className="font-bold text-[11px] text-zinc-800">{item.company}</div>
                                    <div className="text-[10px] text-zinc-500">{item.location}</div>
                                    <div className="text-[10px] font-bold text-zinc-400 mt-1">{item.period}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-xs text-zinc-900 mb-1" style={{ color: accent }}>{item.position}</div>
                                    {item.description && <ul className="list-disc list-outside ml-3 text-xs text-zinc-600 mt-1 space-y-0.5">
                                        {cleanTextContent(item.description).split('\n').filter(l=>l.trim()).map((line,i)=><li key={i}>{line.replace(/^[-•]\s*/,'')}</li>)}
                                    </ul>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {sections.education && !sections.education.hidden && sections.education.items?.length > 0 && (
                <div className="mb-5 font-sans">
                    <h3 className="text-[10px] font-black uppercase tracking-widest py-1 border-y border-zinc-200 mb-3" style={{ color: accent }}>Education</h3>
                    <div className="space-y-3">
                        {sections.education.items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-32 shrink-0">
                                    <div className="font-bold text-[11px] text-zinc-800">{item.school}</div>
                                    <div className="text-[10px] font-bold text-zinc-400 mt-0.5">{item.period}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-xs text-zinc-900" style={{ color: accent }}>{item.degree}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {sections.skills && !sections.skills.hidden && sections.skills.items?.length > 0 && (
                <div className="mb-5 font-sans">
                    <h3 className="text-[10px] font-black uppercase tracking-widest py-1 border-y border-zinc-200 mb-3" style={{ color: accent }}>Skills</h3>
                    <div className="grid grid-cols-3 gap-y-1.5 text-[11px] font-medium text-zinc-700">
                        {sections.skills.items.map(skill => <div key={skill.id} className="flex items-center gap-1.5"><div className="w-1 h-1 bg-zinc-400 rounded-full"/>{skill.name}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
};


const allTemplates = [
        { id: 'onyx', name: 'Apex', desc: 'Minimalist Column', category: 'classic', columns: 1, graphics: false },
        { id: 'pikachu', name: 'Vertex', desc: 'Left Sidebar Theme', category: 'modern', columns: 2, graphics: true },
        { id: 'harvard', name: 'Fusion', desc: 'Classic Corporate Theme', category: 'classic', columns: 1, graphics: false },
        { id: 'azurill', name: 'Nova', desc: 'Header Banner Theme', category: 'modern', columns: 1, graphics: true },
        { id: 'gengar', name: 'Orbit', desc: 'Right Sidebar Theme', category: 'modern', columns: 2, graphics: true },
        { id: 'castform', name: 'Summit', desc: 'Timeline Highlight', category: 'modern', columns: 1, graphics: true },
        { id: 'glissando', name: 'Elite', desc: 'Two-Column Grid', category: 'modern', columns: 2, graphics: false },
        { id: 'dublin', name: 'Prime', desc: 'Executive Split Layout', category: 'classic', columns: 2, graphics: true },
        { id: 'kyoto', name: 'Horizon', desc: 'Modern Left Accent Border', category: 'modern', columns: 1, graphics: true },
        { id: 'leafish', name: 'Prestige', desc: 'Elegant Border Accent', category: 'modern', columns: 1, graphics: true },
        { id: 'rhyhorn', name: 'Legacy', desc: 'Solid Accent Header', category: 'modern', columns: 2, graphics: true },
        { id: 'chikorita', name: 'Pinnacle', desc: 'Minimal Horizontal Accents', category: 'classic', columns: 1, graphics: false },
        { id: 'kakuna', name: 'Executive', desc: 'Two-Column Corporate', category: 'classic', columns: 2, graphics: false },
        { id: 'eevee', name: 'Sydney', desc: 'Creative Bold Accent', category: 'modern', columns: 2, graphics: true },
        { id: 'charmander', name: 'Boston', desc: 'Modern Minimalist Split', category: 'classic', columns: 2, graphics: false },
        { id: 'bronzor', name: 'Austin', desc: 'Split Color Blocks', category: 'modern', columns: 2, graphics: true },
        { id: 'glalie', name: 'Seattle', desc: 'Dark Banner Headers', category: 'modern', columns: 2, graphics: true },
        { id: 'ditto', name: 'San Francisco', desc: 'Minimalist Centered', category: 'classic', columns: 1, graphics: false },
        { id: 'jigglypuff', name: 'Paris', desc: 'Accent Top Banner', category: 'modern', columns: 2, graphics: true },
        { id: 'celebi', name: 'Tokyo', desc: 'Full Outline Accent', category: 'modern', columns: 1, graphics: true },
        { id: 'lucario', name: 'Rome', desc: 'Elegant Top Border', category: 'classic', columns: 1, graphics: false },
    ];

    const filteredTemplates = allTemplates.filter(t => {
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesColumns = columnFilter === 'all' || t.columns === parseInt(columnFilter);
        const matchesGraphics = graphicsFilter === 'all' || 
                                (graphicsFilter === 'with' ? t.graphics === true : t.graphics === false);
        return matchesCategory && matchesQuery && matchesColumns && matchesGraphics;
    });

    const fontFamilies = [
        'Nunito Sans',
        'Open Sans',
        'Roboto',
        'STIX Two Text',
        'Tahoma',
        'Arial',
        'Georgia',
        'Inter',
        'Outfit',
        'Playfair Display'
    ];

    // Fetch user's saved structured resumes
    const fetchSavedResumes = async () => {
        setLoadingSaved(true);
        try {
            const data = await listUserResumes();
            setSavedResumes(data);
        } catch (e) {
            console.error("Failed to load saved templates", e);
        } finally {
            setLoadingSaved(false);
        }
    };

    useEffect(() => {
        fetchSavedResumes();
    }, []);

    // Set font family, margins and text sizes
    useEffect(() => {
        let fVal = '12px';
        const fSizeLower = (styling.fontSize || 'Default').toLowerCase();
        if (fSizeLower === 'small') fVal = '10px';
        if (fSizeLower === 'large') fVal = '14px';

        let pVal = 'p-10';
        if (styling.marginSize === 'compact') pVal = 'p-6';
        if (styling.marginSize === 'spacious') pVal = 'p-14';

        setStyling(prev => ({
            ...prev,
            fontSizeValue: fVal,
            marginPadding: pVal
        }));
    }, [styling.fontSize, styling.marginSize]);

    // Handle Edit Basics Form input
    const handleBasicsChange = (field, val) => {
        setResumeData(prev => ({
            ...prev,
            basics: {
                ...prev.basics,
                [field]: val
            }
        }));
    };

    const handleWebsiteChange = (field, val) => {
        setResumeData(prev => ({
            ...prev,
            basics: {
                ...prev.basics,
                website: {
                    ...prev.basics.website,
                    [field]: val
                }
            }
        }));
    };

    // Experience CRUD items handler
    const updateExperienceItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.experience.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    experience: { ...prev.sections.experience, items }
                }
            };
        });
    };

    const addExperienceItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            company: "New Company",
            position: "New Position",
            location: "",
            period: "2024 - Present",
            website: { url: "", label: "" },
            description: "<ul><li>Key responsibility/achievement</li></ul>"
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                experience: {
                    ...prev.sections.experience,
                    items: [...(prev.sections.experience.items || []), newItem]
                }
            }
        }));
    };

    const deleteExperienceItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                experience: {
                    ...prev.sections.experience,
                    items: prev.sections.experience.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Education CRUD items handler
    const updateEducationItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.education.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    education: { ...prev.sections.education, items }
                }
            };
        });
    };

    const addEducationItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            school: "University Name",
            degree: "Bachelor of Science",
            area: "Computer Science",
            grade: "",
            location: "",
            period: "2020 - 2024",
            website: { url: "", label: "" },
            description: ""
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                education: {
                    ...prev.sections.education,
                    items: [...(prev.sections.education.items || []), newItem]
                }
            }
        }));
    };

    const deleteEducationItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                education: {
                    ...prev.sections.education,
                    items: prev.sections.education.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Skills CRUD items handler
    const updateSkillItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.skills.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    skills: { ...prev.sections.skills, items }
                }
            };
        });
    };

    const addSkillItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            name: "New Skill",
            proficiency: "Intermediate",
            level: 3,
            keywords: []
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                skills: {
                    ...prev.sections.skills,
                    items: [...(prev.sections.skills.items || []), newItem]
                }
            }
        }));
    };

    const deleteSkillItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                skills: {
                    ...prev.sections.skills,
                    items: prev.sections.skills.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Projects CRUD items handler
    const updateProjectItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.projects.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    projects: { ...prev.sections.projects, items }
                }
            };
        });
    };

    const addProjectItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            name: "New Project",
            description: "Built a structured application designed to solve a core problem...",
            period: "2024",
            website: { url: "", label: "" }
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                projects: {
                    ...prev.sections.projects,
                    items: [...(prev.sections.projects.items || []), newItem]
                }
            }
        }));
    };

    const deleteProjectItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                projects: {
                    ...prev.sections.projects,
                    items: prev.sections.projects.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Languages CRUD items handler
    const updateLanguageItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.languages.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    languages: { ...prev.sections.languages, items }
                }
            };
        });
    };

    const addLanguageItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            name: "English",
            description: "Native / Bilingual"
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                languages: {
                    ...prev.sections.languages,
                    items: [...(prev.sections.languages.items || []), newItem]
                }
            }
        }));
    };

    const deleteLanguageItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                languages: {
                    ...prev.sections.languages,
                    items: prev.sections.languages.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Certifications CRUD items handler
    const updateCertItem = (id, field, val) => {
        setResumeData(prev => {
            const items = prev.sections.certifications.items.map(item => {
                if (item.id === id) return { ...item, [field]: val };
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    certifications: { ...prev.sections.certifications, items }
                }
            };
        });
    };

    const addCertItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            hidden: false,
            name: "AWS Solutions Architect",
            issuer: "Amazon Web Services",
            period: "2024",
            website: { url: "", label: "" }
        };
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                certifications: {
                    ...prev.sections.certifications,
                    items: [...(prev.sections.certifications.items || []), newItem]
                }
            }
        }));
    };

    const deleteCertItem = (id) => {
        setResumeData(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                certifications: {
                    ...prev.sections.certifications,
                    items: prev.sections.certifications.items.filter(item => item.id !== id)
                }
            }
        }));
    };

    // Custom Section CRUD Handlers
    const handleAddCustomSection = () => {
        const newSectionId = `custom-${crypto.randomUUID()}`;
        const newSection = {
            id: newSectionId,
            title: "New Custom Section",
            hidden: false,
            items: [
                {
                    id: crypto.randomUUID(),
                    name: "Item Name",
                    subtitle: "Subtitle",
                    location: "Location",
                    period: "Date - Date",
                    description: "Description"
                }
            ]
        };

        setResumeData(prev => {
            const currentCustom = prev.sections?.custom || [];
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    custom: [...currentCustom, newSection]
                }
            };
        });
        
        setActiveTab('edit');
        setOpenSection(newSectionId);
        toast.success("New custom section added!");
    };

    const updateCustomSectionTitle = (secId, newTitle) => {
        setResumeData(prev => {
            const custom = (prev.sections.custom || []).map(sec => {
                if (sec.id === secId) return { ...sec, title: newTitle };
                return sec;
            });
            return { ...prev, sections: { ...prev.sections, custom } };
        });
    };

    const deleteCustomSection = (secId) => {
        setResumeData(prev => {
            const custom = (prev.sections.custom || []).filter(sec => sec.id !== secId);
            return { ...prev, sections: { ...prev.sections, custom } };
        });
    };

    const addCustomSectionItem = (secId) => {
        setResumeData(prev => {
            const custom = (prev.sections.custom || []).map(sec => {
                if (sec.id === secId) {
                    return {
                        ...sec,
                        items: [...sec.items, {
                            id: crypto.randomUUID(),
                            name: "Item Name",
                            subtitle: "Subtitle",
                            location: "Location",
                            period: "Date",
                            description: "Description"
                        }]
                    };
                }
                return sec;
            });
            return { ...prev, sections: { ...prev.sections, custom } };
        });
    };

    const updateCustomSectionItem = (secId, itemId, field, val) => {
        setResumeData(prev => {
            const custom = (prev.sections.custom || []).map(sec => {
                if (sec.id === secId) {
                    const items = sec.items.map(item => {
                        if (item.id === itemId) return { ...item, [field]: val };
                        return item;
                    });
                    return { ...sec, items };
                }
                return sec;
            });
            return { ...prev, sections: { ...prev.sections, custom } };
        });
    };

    const deleteCustomSectionItem = (secId, itemId) => {
        setResumeData(prev => {
            const custom = (prev.sections.custom || []).map(sec => {
                if (sec.id === secId) {
                    const items = sec.items.filter(item => item.id !== itemId);
                    return { ...sec, items };
                }
                return sec;
            });
            return { ...prev, sections: { ...prev.sections, custom } };
        });
    };

    // Save Resume to Database
    const handleSaveResume = async () => {
        const payload = {
            title: resumeTitle,
            resume_data: resumeData,
            styling_config: styling
        };

        const toastId = toast.loading("Saving resume configuration...");
        try {
            if (activeResumeId) {
                await updateUserResume(activeResumeId, payload);
                toast.success("Resume updated successfully!", { id: toastId });
            } else {
                const res = await saveUserResume(payload);
                setActiveResumeId(res.id);
                toast.success("Resume saved successfully!", { id: toastId });
            }
            fetchSavedResumes();
        } catch (e) {
            console.error("Save error", e);
            toast.error("Failed to save resume layout.", { id: toastId });
        }
    };

    // Load saved resume
    const handleLoadSavedResume = (saved) => {
        setResumeTitle(saved.title);
        setResumeData(saved.resume_data);
        setStyling(saved.styling_config);
        setActiveResumeId(saved.id);
        toast.success(`Loaded "${saved.title}"`);
    };

    // Delete saved resume
    const handleDeleteSavedResume = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this resume configuration?")) return;

        const toastId = toast.loading("Deleting configuration...");
        try {
            await deleteUserResume(id);
            toast.success("Resume configuration deleted.", { id: toastId });
            if (activeResumeId === id) {
                setActiveResumeId(null);
            }
            fetchSavedResumes();
        } catch (e) {
            console.error(e);
            toast.error("Delete failed.", { id: toastId });
        }
    };

    // Trigger high-resolution client-side PDF export
    const handlePrintResume = async () => {
        const element = document.getElementById('resume-a4-canvas');
        if (!element) {
            toast.error("Resume element not found.");
            return;
        }

        const printStyle = document.createElement('style');
        printStyle.id = 'resume-single-print-rules';
        printStyle.innerHTML = `
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 0 !important;
                }
                /* Hide sidebar, navbar, and print-hidden elements */
                aside, nav, header, .print\\:hidden, [class*="print:hidden"], button {
                    display: none !important;
                }
                
                body * {
                    visibility: hidden;
                }
                
                #resume-a4-canvas, #resume-a4-canvas * {
                    visibility: visible;
                }
                
                html, body, #root, .workspace-container, div:has(#resume-a4-canvas), main:has(#resume-a4-canvas) {
                    height: auto !important;
                    min-height: auto !important;
                    overflow: visible !important;
                    position: static !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                #resume-a4-canvas {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 210mm !important;
                    box-shadow: none !important;
                    transform: none !important;
                    background-color: white !important;
                    border: none !important;
                }
            }
        `;
        document.head.appendChild(printStyle);

        // Allow DOM to apply styles
        setTimeout(() => {
            window.print();
            
            // Clean up
            setTimeout(() => {
                const existing = document.getElementById('resume-single-print-rules');
                if (existing) document.head.removeChild(existing);
            }, 1000);
        }, 150);
    };

    // Trigger print/PDF layout for multiple selected resumes
    const handleBatchDownload = () => {
        if (selectedResumeIds.length === 0) {
            toast.error("Please select at least one resume to download.");
            return;
        }

        // Append batch print styling dynamically to body
        const printStyle = document.createElement('style');
        printStyle.id = 'resume-batch-print-rules';
        printStyle.innerHTML = `
            @media print {
                @page {
                    size: A4;
                    margin: 12mm !important;
                }
                /* Hide sidebar, navbar, and print-hidden elements */
                aside, nav, header, .print\:hidden, [class*="print:hidden"] {
                    display: none !important;
                }
                /* Hide everything inside the workspace except the batch container */
                .workspace-container > :not(#resume-print-batch-container) {
                    display: none !important;
                }
                /* Reset SPA fixed layout and screen height limits on all parent containers */
                html, body, #root, 
                div:has(#resume-print-batch-container), 
                main:has(#resume-print-batch-container), 
                .workspace-container {
                    height: auto !important;
                    min-height: auto !important;
                    overflow: visible !important;
                    position: static !important;
                    display: block !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                #resume-print-batch-container {
                    display: block !important;
                    position: relative !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }
                .print-page-break {
                    page-break-after: always !important;
                    break-after: page !important;
                }
                [class*="batch-resume-container-"] {
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: auto !important;
                    height: auto !important;
                }
                
                /* Avoid item break across pages */
                [class*="batch-resume-container-"] .resume-item,
                [class*="batch-resume-container-"] .space-y-3 > *,
                [class*="batch-resume-container-"] .space-y-4 > *,
                [class*="batch-resume-container-"] .space-y-2\\.5 > *,
                [class*="batch-resume-container-"] .space-y-2 > *,
                [class*="batch-resume-container-"] .grid > *,
                [class*="batch-resume-container-"] .space-y-1\\.5 > *,
                [class*="batch-resume-container-"] .space-y-1 > * {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }
                
                /* Keep section headers with content */
                [class*="batch-resume-container-"] h2,
                [class*="batch-resume-container-"] h3 {
                    break-after: avoid !important;
                    page-break-after: avoid !important;
                }
            }
        `;
        document.head.appendChild(printStyle);
        window.print();
        
        // Clean up print styling afterward
        setTimeout(() => {
            try {
                const existing = document.getElementById('resume-batch-print-rules');
                if (existing) document.head.removeChild(existing);
            } catch (e) {}
        }, 1000);
    };

    // Convert structured resume back to markdown and download as docx
    const handleDownloadDocx = async () => {
        setExportingDocx(true);
        const toastId = toast.loading("Converting & generating Word document...");
        
        try {
            // Converter helper
            let md = `# ${resumeData.basics.name}\n\n`;
            if (resumeData.basics.headline) md += `**${resumeData.basics.headline}**\n\n`;
            md += `Email: ${resumeData.basics.email || ''} | Phone: ${resumeData.basics.phone || ''} | Location: ${resumeData.basics.location || ''}\n`;
            if (resumeData.basics.website?.url) {
                md += `Website: [${resumeData.basics.website.label || resumeData.basics.website.url}](${resumeData.basics.website.url})\n`;
            }
            md += `\n---\n\n`;

            if (resumeData.summary.content) {
                md += `## ${resumeData.summary.title || 'Professional Summary'}\n\n${resumeData.summary.content}\n\n`;
            }

            if (resumeData.sections.experience?.items?.length > 0) {
                md += `## Work Experience\n\n`;
                resumeData.sections.experience.items.forEach(item => {
                    md += `### ${item.position} - ${item.company}\n`;
                    md += `*${item.period} | ${item.location || ''}*\n\n`;
                    let desc = item.description || '';
                    desc = desc.replace(/<ul>/g, '').replace(/<\/ul>/g, '');
                    desc = desc.replace(/<li>/g, '- ').replace(/<\/li>/g, '\n');
                    md += `${desc}\n\n`;
                });
            }

            if (resumeData.sections.education?.items?.length > 0) {
                md += `## Education\n\n`;
                resumeData.sections.education.items.forEach(item => {
                    md += `### ${item.degree} in ${item.area}\n`;
                    md += `*${item.school} | ${item.period}*\n`;
                    if (item.grade) md += `Grade: ${item.grade}\n`;
                    if (item.description) md += `\n${item.description}\n`;
                    md += `\n`;
                });
            }

            if (resumeData.sections.skills?.items?.length > 0) {
                md += `## Skills\n\n`;
                const skillsList = resumeData.sections.skills.items.map(s => {
                    return s.proficiency ? `${s.name} (${s.proficiency})` : s.name;
                }).join(', ');
                md += `${skillsList}\n\n`;
            }

            if (resumeData.sections.projects?.items?.length > 0) {
                md += `## Projects\n\n`;
                resumeData.sections.projects.items.forEach(item => {
                    md += `### ${item.name}\n`;
                    md += `*${item.period}*\n\n`;
                    md += `${item.description}\n\n`;
                });
            }

            const response = await api.post('/resume-builder/download', {
                tailored_resume: md,
                job_title: resumeTitle
            }, { responseType: 'blob' });

            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tailored_Resume_${resumeTitle.replace(/[^a-z0-9]/gi, '_')}.docx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("DOCX downloaded successfully!", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate DOCX.", { id: toastId });
        } finally {
            setExportingDocx(false);
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'workspace-sidebar-shift';
        style.innerHTML = `
            @media (min-width: 768px) {
                .sidebar:hover ~ .header-and-content .workspace-container {
                    left: 260px !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            try {
                const el = document.getElementById('workspace-sidebar-shift');
                if (el) document.head.removeChild(el);
            } catch (e) {}
        };
    }, []);

    if (showGallery) {
        return (
            <div className="fixed inset-y-0 right-0 left-0 md:left-[70px] z-[100] bg-[#FAF9F5] overflow-y-auto flex flex-col font-sans select-none transition-[left] duration-[0.25s] ease-[cubic-bezier(0.4,0,0.2,1)]">
                {/* Header */}
                <div className="bg-white border-b border-zinc-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        {resumeData && (
                            <button
                                onClick={() => {
                                    if (cameFromEditor) {
                                        setShowGallery(false);
                                    } else {
                                        navigate(-1);
                                    }
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-xl transition-all mr-2 flex items-center gap-2 font-bold text-xs text-zinc-500 hover:text-zinc-800 uppercase tracking-widest"
                                title={cameFromEditor ? "Back to editor" : "Back"}
                            >
                                <ArrowLeft size={16} strokeWidth={2.5} /> {cameFromEditor ? "Back to Editor" : "Back"}
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-black text-zinc-900 tracking-tight">Choose your resume template</h1>
                            <p className="text-xs font-semibold text-zinc-450 mt-0.5">Select a template to customize your ATS-friendly resume. You can switch templates anytime.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder-zinc-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-3.5 text-zinc-400">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                            </svg>
                        </div>
                        
                        {onClose && (
                            <button
                                onClick={() => {
                                    if (cameFromEditor) {
                                        setShowGallery(false);
                                    } else {
                                        if (onClose) onClose();
                                        else navigate(-1);
                                    }
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
                            >
                                <X size={20} className="text-zinc-500" />
                            </button>
                        )}
                    </div>
                </div>



                {/* Categories & Grid */}
                <div className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-8 flex gap-12">
                    {/* Left categories filter sidebar */}
                    <div className="w-56 shrink-0 flex flex-col gap-3">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1 pl-1">CATEGORIES</h3>
                        {[
                            { id: 'all', label: 'All templates' },
                            { id: 'classic', label: 'Classic' },
                            { id: 'modern', label: 'Modern' }
                        ].map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all
                                        ${isActive 
                                            ? 'bg-zinc-950 text-white shadow-md' 
                                            : 'bg-white text-zinc-800 shadow-sm border border-zinc-100 hover:shadow-md hover:text-zinc-900'
                                        }
                                    `}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Templates Grid */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Header Section: Filter By & Colors */}
                        <div className="bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-full px-6 py-2.5 flex flex-wrap items-center justify-between shadow-sm mb-8 sticky top-6 z-40">
                            <div className="flex items-center gap-5">
                                <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest pl-2">FILTER BY:</span>
                                
                                {/* Columns Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setColumnsDropdownOpen(!columnsDropdownOpen);
                                            setGraphicsDropdownOpen(false);
                                        }}
                                        className="flex items-center justify-between gap-3 px-4 py-2 border border-zinc-200 hover:border-zinc-400 rounded-xl bg-white text-xs font-bold text-zinc-800 min-w-[120px] shadow-sm transition-all"
                                    >
                                        <span>{columnFilter === 'all' ? 'Columns' : columnFilter === '1' ? '1 column' : '2 column'}</span>
                                        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${columnsDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {columnsDropdownOpen && (
                                        <div className="absolute left-0 mt-1.5 w-full bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                            {[
                                                { value: 'all', label: 'All' },
                                                { value: '1', label: '1 column' },
                                                { value: '2', label: '2 column' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setColumnFilter(opt.value);
                                                        setColumnsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-all
                                                        ${columnFilter === opt.value ? 'bg-zinc-50 text-zinc-900 font-extrabold' : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'}
                                                    `}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Graphics Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setGraphicsDropdownOpen(!graphicsDropdownOpen);
                                            setColumnsDropdownOpen(false);
                                        }}
                                        className="flex items-center justify-between gap-3 px-4 py-2 border border-zinc-200 hover:border-zinc-400 rounded-xl bg-white text-xs font-bold text-zinc-800 min-w-[130px] shadow-sm transition-all"
                                    >
                                        <span>{graphicsFilter === 'all' ? 'Graphics' : graphicsFilter === 'with' ? 'With graphics' : 'Without graphics'}</span>
                                        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${graphicsDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {graphicsDropdownOpen && (
                                        <div className="absolute left-0 mt-1.5 w-full bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                            {[
                                                { value: 'all', label: 'All' },
                                                { value: 'with', label: 'With graphics' },
                                                { value: 'without', label: 'Without graphics' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setGraphicsFilter(opt.value);
                                                        setGraphicsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-all
                                                        ${graphicsFilter === opt.value ? 'bg-zinc-50 text-zinc-900 font-extrabold' : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'}
                                                    `}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colors Bar */}
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden lg:block">Colors:</span>
                                <div className="flex items-center gap-1.5">
                                    {[
                                        { value: '#ffffff', bg: 'bg-white border border-zinc-200' },
                                        { value: '#18181b', bg: 'bg-zinc-900' },
                                        { value: '#3a5f7d', bg: 'bg-[#3a5f7d]' },
                                        { value: '#4a90e2', bg: 'bg-[#4a90e2]' },
                                        { value: '#5bb19e', bg: 'bg-[#5bb19e]' },
                                        { value: '#d4af37', bg: 'bg-[#d4af37]' },
                                        { value: '#8b5cf6', bg: 'bg-violet-600' }
                                    ].map(color => {
                                        const isSelected = styling.accentColor.toLowerCase() === color.value.toLowerCase();
                                        return (
                                            <button
                                                key={color.value}
                                                onClick={() => setStyling(prev => ({ ...prev, accentColor: color.value }))}
                                                className={`w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${color.bg}
                                                    ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : ''}
                                                `}
                                                title={color.value}
                                            >
                                                {isSelected && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={color.value === '#ffffff' ? 'text-zinc-900' : 'text-white'}>
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredTemplates.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => {
                                        setStyling(prev => ({ ...prev, template: t.id }));
                                        setShowGallery(false);
                                        setCameFromEditor(true);
                                        toast.success(`Swapped to ${t.name} template!`);
                                    }}
                                    className="group relative bg-white border border-zinc-200/80 rounded-2xl cursor-pointer hover:shadow-2xl hover:border-zinc-900 transition-all flex flex-col overflow-hidden"
                                >
                                    {/* Thumbnail Preview Area */}
                                    <div className="bg-white overflow-hidden relative flex items-start justify-center border-b border-zinc-100 transition-all h-[420px]">
                                        <div className="relative w-full h-full pointer-events-none select-none">
                                            <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2" style={{ width: '793px', height: '1122px', transform: 'scale(0.44)', padding: '24px', boxSizing: 'border-box' }}>
                                                {t.id === 'onyx' && <OnyxTemplate data={galleryMockData} styling={{ ...styling, template: 'onyx', fontSizeValue: '12px' }} />}
                                                {t.id === 'pikachu' && <PikachuTemplate data={galleryMockData} styling={{ ...styling, template: 'pikachu', fontSizeValue: '12px' }} />}
                                                {t.id === 'azurill' && <AzurillTemplate data={galleryMockData} styling={{ ...styling, template: 'azurill', fontSizeValue: '12px' }} />}
                                                {t.id === 'gengar' && <GengarTemplate data={galleryMockData} styling={{ ...styling, template: 'gengar', fontSizeValue: '12px' }} />}
                                                {t.id === 'castform' && <CastformTemplate data={galleryMockData} styling={{ ...styling, template: 'castform', fontSizeValue: '12px' }} />}
                                                {t.id === 'glissando' && <GlissandoTemplate data={galleryMockData} styling={{ ...styling, template: 'glissando', fontSizeValue: '12px' }} />}
                                                {t.id === 'dublin' && <DublinTemplate data={galleryMockData} styling={{ ...styling, template: 'dublin', fontSizeValue: '12px' }} />}
                                                {t.id === 'harvard' && <HarvardTemplate data={galleryMockData} styling={{ ...styling, template: 'harvard', fontSizeValue: '12px' }} />}
                                                {t.id === 'kyoto' && <KyotoTemplate data={galleryMockData} styling={{ ...styling, template: 'kyoto', fontSizeValue: '12px' }} />}
                                                {t.id === 'leafish' && <LeafishTemplate data={galleryMockData} styling={{ ...styling, template: 'leafish', fontSizeValue: '12px' }} />}
                                                {t.id === 'rhyhorn' && <RhyhornTemplate data={galleryMockData} styling={{ ...styling, template: 'rhyhorn', fontSizeValue: '12px' }} />}
                                                {t.id === 'chikorita' && <ChikoritaTemplate data={galleryMockData} styling={{ ...styling, template: 'chikorita', fontSizeValue: '12px' }} />}
                                                {t.id === 'kakuna' && <KakunaTemplate data={galleryMockData} styling={{ ...styling, template: 'kakuna', fontSizeValue: '12px' }} />}
                                                {t.id === 'eevee' && <EeveeTemplate data={galleryMockData} styling={{ ...styling, template: 'eevee', fontSizeValue: '12px' }} />}
                                                {t.id === 'charmander' && <CharmanderTemplate data={galleryMockData} styling={{ ...styling, template: 'charmander', fontSizeValue: '12px' }} />}
                                                {t.id === 'bronzor' && <BronzorTemplate data={galleryMockData} styling={{ ...styling, template: 'bronzor', fontSizeValue: '12px' }} />}
                                                {t.id === 'glalie' && <GlalieTemplate data={galleryMockData} styling={{ ...styling, template: 'glalie', fontSizeValue: '12px' }} />}
                                                {t.id === 'ditto' && <DittoTemplate data={galleryMockData} styling={{ ...styling, template: 'ditto', fontSizeValue: '12px' }} />}
                                                {t.id === 'jigglypuff' && <JigglypuffTemplate data={galleryMockData} styling={{ ...styling, template: 'jigglypuff', fontSizeValue: '12px' }} />}
                                                {t.id === 'celebi' && <CelebiTemplate data={galleryMockData} styling={{ ...styling, template: 'celebi', fontSizeValue: '12px' }} />}
                                                {t.id === 'lucario' && <LucarioTemplate data={galleryMockData} styling={{ ...styling, template: 'lucario', fontSizeValue: '12px' }} />}
                                            </div>
                                        </div>

                                        {/* Hover Overlay Button */}
                                        <div className="absolute inset-0 bg-zinc-950/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="px-6 py-3 bg-white text-zinc-950 text-xs font-black rounded-xl shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                Use Template
                                            </button>
                                        </div>
                                    </div>

                                    {/* Template Metadata */}
                                    <div className="flex flex-col p-5 bg-white z-10 relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-extrabold text-base text-zinc-900 tracking-tight">{t.name}</h4>
                                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
                                                ${t.category === 'classic' ? 'bg-amber-100/60 text-amber-800' : 'bg-indigo-100/60 text-indigo-800'}
                                            `}>
                                                {t.category}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-zinc-400 leading-tight">{t.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-y-0 right-0 left-0 md:left-[70px] z-50 bg-[#F6F6F8] font-sans flex flex-col h-screen select-none print:bg-white transition-[left] duration-[0.25s] ease-[cubic-bezier(0.4,0,0.2,1)] workspace-container">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center h-[72px] shrink-0 print:hidden relative z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                navigate('/jobs');
                            }
                        }}
                        className="px-3 py-1.5 hover:bg-zinc-100 rounded-xl transition-all flex items-center gap-2 font-bold text-xs text-zinc-500 hover:text-zinc-800 uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} /> Back
                    </button>
                    <div className="w-[1px] h-6 bg-zinc-200" />
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-zinc-900" />
                        <input 
                            type="text" 
                            value={resumeTitle} 
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className="font-bold text-sm text-zinc-900 focus:outline-none focus:bg-zinc-50 border-b border-transparent focus:border-zinc-300 px-1 py-0.5 rounded transition-all w-44"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setCameFromEditor(true);
                            setShowGallery(true);
                        }}
                        className="ml-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-extrabold rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                        <Layout size={12} />
                        Change Template
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddCustomSection}
                        className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
                        title="Add Section"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={handleSaveResume}
                        className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Save size={13} />
                        Save Resume
                    </button>
                    <button
                        onClick={handleDownloadDocx}
                        disabled={exportingDocx}
                        className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Download size={13} />
                        Download DOCX
                    </button>
                    <button
                        onClick={handlePrintResume}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Printer size={13} />
                        Print / Export PDF
                    </button>
                </div>
            </div>

            {/* Main Split Layout Workspace */}
            <div className="flex flex-1 overflow-hidden print:overflow-visible">
                {/* Left Side: Sidebar Customizer (40% width) */}
                <div className="w-[450px] bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-hidden print:hidden">
                    {/* Navigation Tabs */}
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-zinc-100 shrink-0 bg-[#f4f4f0]/40">
                        {[
                            { id: 'edit', label: 'Content' },
                            { id: 'templates', label: 'Templates' },
                            { id: 'formatting', label: 'Formatting' },
                            { id: 'saved', label: 'Saved' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider border-b-2 text-center transition-all
                                    ${activeTab === tab.id 
                                        ? 'border-zinc-900 text-zinc-900 bg-white rounded-t-lg' 
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-[#eaeae4]/30'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text">
                        {/* Tab 1: Quick Template Styles Selector */}
                        {activeTab === 'templates' && (
                            <div className="space-y-6">
                                {/* Template Cards */}
                                <div>
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-3.5">Templates</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'onyx', name: 'Apex', desc: 'Minimalist' },
                                            { id: 'pikachu', name: 'Vertex', desc: 'Left Sidebar' },
                                            { id: 'azurill', name: 'Nova', desc: 'Header Banner' },
                                            { id: 'gengar', name: 'Orbit', desc: 'Right Sidebar' },
                                            { id: 'castform', name: 'Summit', desc: 'Timeline' },
                                            { id: 'glissando', name: 'Elite', desc: 'Two-Column' },
                                            { id: 'dublin', name: 'Prime', desc: 'Executive' },
                                            { id: 'harvard', name: 'Fusion', desc: 'Classic' },
                                            { id: 'kyoto', name: 'Horizon', desc: 'Modern' },
                                            { id: 'leafish', name: 'Prestige', desc: 'Elegant Accent' },
                                            { id: 'rhyhorn', name: 'Legacy', desc: 'Solid Banner' },
                                            { id: 'chikorita', name: 'Pinnacle', desc: 'Horizontal line' },
                                            { id: 'kakuna', name: 'Executive', desc: 'Two-Column Corp' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setStyling(prev => ({ ...prev, template: t.id }))}
                                                className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-1
                                                    ${styling.template === t.id 
                                                        ? 'border-zinc-950 bg-zinc-950/5 shadow-sm scale-[1.02]' 
                                                        : 'border-zinc-150 hover:bg-zinc-50'
                                                    }
                                                `}
                                            >
                                                <FileText size={18} className={styling.template === t.id ? 'text-zinc-900' : 'text-zinc-400'} />
                                                <span className="font-bold text-xs text-zinc-900">{t.name}</span>
                                                <span className="text-[9px] font-semibold text-zinc-400 leading-none">{t.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Custom Spacing & Fonts Formatting */}
                        {activeTab === 'formatting' && (
                            <div className="space-y-6">
                                {/* Fit to Single Page Toggle */}
                                <div className="bg-[#f5f5f0] p-4.5 rounded-2xl border-2 border-transparent transition-all hover:border-zinc-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 bg-zinc-900 text-white rounded-xl">
                                                <Sparkles size={16} className="animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wide">Fit to Single Page</h3>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Auto-scale content & spacing</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStyling(prev => ({ ...prev, fitToSinglePage: !prev.fitToSinglePage }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                                ${styling.fitToSinglePage ? 'bg-zinc-900' : 'bg-zinc-300'}
                                            `}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                                    ${styling.fitToSinglePage ? 'translate-x-5' : 'translate-x-0'}
                                                `}
                                            />
                                        </button>
                                    </div>
                                    {styling.fitToSinglePage && fitScale < 1.0 && (
                                        <div className="mt-3 pt-3 border-t border-dashed border-zinc-350 text-[10px] text-zinc-500 font-semibold flex items-center justify-between">
                                            <span>Scale Factor applied:</span>
                                            <span className="bg-zinc-250 px-1.5 py-0.5 rounded font-mono text-zinc-700">
                                                {Math.round(fitScale * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Font Size Section */}
                                <div>
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-3">Font size</h3>
                                    <div className="grid grid-cols-3 gap-3 bg-[#f5f5f0] p-2.5 rounded-2xl">
                                        {[
                                            { id: 'Small', label: 'Small', sizeClass: 'text-xs' },
                                            { id: 'Default', label: 'Default', sizeClass: 'text-sm' },
                                            { id: 'Large', label: 'Large', sizeClass: 'text-base' }
                                        ].map((sz) => {
                                            const isActive = styling.fontSize === sz.id;
                                            return (
                                                <button
                                                    key={sz.id}
                                                    onClick={() => setStyling(prev => ({ ...prev, fontSize: sz.id }))}
                                                    className={`py-3 rounded-xl flex flex-col items-center justify-center transition-all bg-white
                                                        ${isActive 
                                                            ? 'border-2 border-zinc-950 shadow-sm text-zinc-950 font-black scale-[1.02]' 
                                                            : 'border border-transparent text-zinc-450 hover:text-zinc-700 font-semibold'
                                                        }
                                                    `}
                                                >
                                                    <span className={`${sz.sizeClass} font-extrabold mb-0.5`}>A</span>
                                                    <span className="text-[11px]">{sz.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Page Margins Section */}
                                <div>
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-3">Page margins</h3>
                                    <div className="grid grid-cols-3 gap-3 bg-[#f5f5f0] p-2.5 rounded-2xl">
                                        {[
                                            { id: 'compact', label: 'Compact' },
                                            { id: 'normal', label: 'Normal' },
                                            { id: 'spacious', label: 'Spacious' }
                                        ].map((mg) => {
                                            const isActive = styling.marginSize === mg.id;
                                            return (
                                                <button
                                                    key={mg.id}
                                                    onClick={() => setStyling(prev => ({ ...prev, marginSize: mg.id }))}
                                                    className={`py-3 rounded-xl flex flex-col items-center justify-center transition-all bg-white
                                                        ${isActive 
                                                            ? 'border-2 border-zinc-950 shadow-sm text-zinc-950 font-black scale-[1.02]' 
                                                            : 'border border-transparent text-zinc-450 hover:text-zinc-700 font-semibold'
                                                        }
                                                    `}
                                                >
                                                    <span className="text-[11px] font-extrabold">{mg.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* More Font Settings Container */}
                                <div className="bg-[#f5f5f0] p-5 rounded-2xl space-y-6">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 mb-1">More font settings</h4>
                                    
                                    {/* Section Spacing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-zinc-700">
                                            <span>Section Spacing</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="8"
                                            max="32"
                                            step="2"
                                            value={styling.sectionSpacing}
                                            onChange={(e) => setStyling(prev => ({ ...prev, sectionSpacing: parseInt(e.target.value) }))}
                                            className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                                        />
                                    </div>

                                    {/* Paragraph Spacing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-zinc-700">
                                            <span>Paragraph Spacing</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="4"
                                            max="24"
                                            step="2"
                                            value={styling.paragraphSpacing}
                                            onChange={(e) => setStyling(prev => ({ ...prev, paragraphSpacing: parseInt(e.target.value) }))}
                                            className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                                        />
                                    </div>

                                    {/* Line Spacing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-zinc-700">
                                            <span>Line Spacing</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1.0"
                                            max="2.0"
                                            step="0.05"
                                            value={styling.lineSpacing}
                                            onChange={(e) => setStyling(prev => ({ ...prev, lineSpacing: parseFloat(e.target.value) }))}
                                            className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                                        />
                                    </div>

                                    {/* Custom Dropdown select for Font */}
                                    <div className="relative">
                                        <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Font</label>
                                        <button
                                            onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                                            className="w-full bg-white border border-zinc-250 focus:border-zinc-400 rounded-xl px-4 py-3 text-left flex justify-between items-center transition-all"
                                        >
                                            <span className="text-xs font-bold text-zinc-800">{styling.fontFamily}</span>
                                            <ChevronRight 
                                                size={14} 
                                                className={`text-zinc-500 transition-transform ${fontDropdownOpen ? 'rotate-[270deg]' : 'rotate-90'}`} 
                                            />
                                        </button>

                                        {fontDropdownOpen && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-150 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto py-1">
                                                {fontFamilies.map((font) => (
                                                    <button
                                                        key={font}
                                                        onClick={() => {
                                                            setStyling(prev => ({ ...prev, fontFamily: font }));
                                                            setFontDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-zinc-50
                                                            ${styling.fontFamily === font ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-650'}
                                                        `}
                                                    >
                                                        {font}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reset Font Settings Button */}
                                    <button
                                        onClick={() => {
                                            setStyling(prev => ({
                                                ...prev,
                                                fontFamily: 'Inter',
                                                fontSize: 'Default',
                                                fontSizeValue: '12px',
                                                sectionSpacing: 16,
                                                paragraphSpacing: 12,
                                                lineSpacing: 1.4
                                            }));
                                            toast.success("Font settings reset to default!");
                                        }}
                                        className="w-full py-3 border border-dashed border-zinc-300 hover:border-zinc-450 text-zinc-700 hover:text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                            <path d="M3 3v5h5"/>
                                        </svg>
                                        Reset font settings
                                    </button>
                                </div>

                                <div className="h-[1px] bg-zinc-100" />

                                {/* Preset Accent Colors */}
                                <div>
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-3">Accent Color</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {[
                                            { hex: '#3b82f6', name: 'Blue' },
                                            { hex: '#10b981', name: 'Emerald' },
                                            { hex: '#6366f1', name: 'Indigo' },
                                            { hex: '#ec4899', name: 'Pink' },
                                            { hex: '#f59e0b', name: 'Amber' },
                                            { hex: '#18181b', name: 'Charcoal' },
                                            { hex: '#8b5cf6', name: 'Violet' }
                                        ].map((c) => (
                                            <button
                                                key={c.hex}
                                                onClick={() => setStyling(prev => ({ ...prev, accentColor: c.hex }))}
                                                className="w-8 h-8 rounded-full border border-zinc-200/50 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                            >
                                                {styling.accentColor === c.hex && (
                                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Accordion Resume Data Form Editor */}
                        {activeTab === 'edit' && (
                            <div className="space-y-3.5">
                                <AtsGapsSection 
                                    analysisResult={analysisResult} 
                                    accent={styling.accentColor} 
                                    onInject={handleInjectSkills}
                                    isInjecting={isInjecting}
                                />
                                {/* Section 1: Basics */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'basics' ? null : 'basics')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sliders size={14} className="text-zinc-500" />
                                            <span>Contact Details</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'basics' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'basics' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={resumeData.basics.name}
                                                    onChange={(e) => handleBasicsChange('name', e.target.value)}
                                                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Headline</label>
                                                <input 
                                                    type="text" 
                                                    value={resumeData.basics.headline}
                                                    onChange={(e) => handleBasicsChange('headline', e.target.value)}
                                                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Email</label>
                                                    <input 
                                                        type="email" 
                                                        value={resumeData.basics.email}
                                                        onChange={(e) => handleBasicsChange('email', e.target.value)}
                                                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Phone</label>
                                                    <input 
                                                        type="text" 
                                                        value={resumeData.basics.phone}
                                                        onChange={(e) => handleBasicsChange('phone', e.target.value)}
                                                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Location</label>
                                                <input 
                                                    type="text" 
                                                    value={resumeData.basics.location}
                                                    onChange={(e) => handleBasicsChange('location', e.target.value)}
                                                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Website URL</label>
                                                    <input 
                                                        type="text" 
                                                        value={resumeData.basics.website?.url || ''}
                                                        onChange={(e) => handleWebsiteChange('url', e.target.value)}
                                                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Website Label</label>
                                                    <input 
                                                        type="text" 
                                                        value={resumeData.basics.website?.label || ''}
                                                        onChange={(e) => handleWebsiteChange('label', e.target.value)}
                                                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 2: Summary */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'summary' ? null : 'summary')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-zinc-500" />
                                            <span>Professional Summary</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'summary' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'summary' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-extrabold uppercase text-zinc-400">Visibility</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={!resumeData.summary.hidden}
                                                    onChange={(e) => setResumeData(prev => ({
                                                        ...prev,
                                                        summary: { ...prev.summary, hidden: !e.target.checked }
                                                    }))}
                                                    className="w-4 h-4 rounded border-zinc-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase text-zinc-400 mb-1">Content</label>
                                                <textarea 
                                                    value={resumeData.summary.content}
                                                    onChange={(e) => setResumeData(prev => ({
                                                        ...prev,
                                                        summary: { ...prev.summary, content: e.target.value }
                                                    }))}
                                                    rows={5}
                                                    className="w-full border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Experience */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'experience' ? null : 'experience')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-zinc-500" />
                                            <span>Work Experience</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'experience' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'experience' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-4">
                                            {resumeData.sections.experience.items.map((item, index) => (
                                                <div key={item.id} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => deleteExperienceItem(item.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Experience #{index + 1}</div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Role/Title</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.position}
                                                                onChange={(e) => updateExperienceItem(item.id, 'position', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Company</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.company}
                                                                onChange={(e) => updateExperienceItem(item.id, 'company', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Dates / Period</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.period}
                                                                onChange={(e) => updateExperienceItem(item.id, 'period', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Location</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.location}
                                                                onChange={(e) => updateExperienceItem(item.id, 'location', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Description (HTML lists supported)</label>
                                                        <textarea 
                                                            value={item.description}
                                                            onChange={(e) => updateExperienceItem(item.id, 'description', e.target.value)}
                                                            rows={3}
                                                            className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono focus:outline-none focus:border-zinc-900 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addExperienceItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Work Role
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Education */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'education' ? null : 'education')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={14} className="text-zinc-500" />
                                            <span>Education</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'education' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'education' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-4">
                                            {resumeData.sections.education.items.map((item, index) => (
                                                <div key={item.id} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => deleteEducationItem(item.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Education #{index + 1}</div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Degree</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.degree}
                                                                onChange={(e) => updateEducationItem(item.id, 'degree', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Field of Study</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.area}
                                                                onChange={(e) => updateEducationItem(item.id, 'area', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">School</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.school}
                                                                onChange={(e) => updateEducationItem(item.id, 'school', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Dates / Period</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.period}
                                                                onChange={(e) => updateEducationItem(item.id, 'period', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Grade / GPA</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.grade}
                                                                onChange={(e) => updateEducationItem(item.id, 'grade', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Location</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.location}
                                                                onChange={(e) => updateEducationItem(item.id, 'location', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addEducationItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Education
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 5: Skills */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'skills' ? null : 'skills')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Settings size={14} className="text-zinc-500" />
                                            <span>Competencies & Skills</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'skills' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'skills' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-3">
                                            {resumeData.sections.skills.items.map((item) => (
                                                <div key={item.id} className="flex gap-2 items-center bg-zinc-50 p-2 border border-zinc-100 rounded-xl">
                                                    <input 
                                                        type="text" 
                                                        value={item.name}
                                                        onChange={(e) => updateSkillItem(item.id, 'name', e.target.value)}
                                                        className="flex-1 border border-zinc-200 px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                    />
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        max="5"
                                                        value={item.level || 0}
                                                        onChange={(e) => updateSkillItem(item.id, 'level', parseInt(e.target.value) || 0)}
                                                        className="w-12 border border-zinc-200 px-1 py-1.5 rounded-lg text-xs font-semibold text-center focus:outline-none focus:border-zinc-900 bg-white"
                                                    />
                                                    <button 
                                                        onClick={() => deleteSkillItem(item.id)}
                                                        className="p-1.5 border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all bg-white"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addSkillItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Skill Item
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 6: Projects */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'projects' ? null : 'projects')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FolderGit size={14} className="text-zinc-500" />
                                            <span>Projects</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'projects' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'projects' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-4">
                                            {resumeData.sections.projects.items.map((item, index) => (
                                                <div key={item.id} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => deleteProjectItem(item.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Project #{index + 1}</div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Project Name</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.name}
                                                                onChange={(e) => updateProjectItem(item.id, 'name', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Period</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.period}
                                                                onChange={(e) => updateProjectItem(item.id, 'period', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Description</label>
                                                        <textarea 
                                                            value={item.description}
                                                            onChange={(e) => updateProjectItem(item.id, 'description', e.target.value)}
                                                            rows={3}
                                                            className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addProjectItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Project Details
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 7: Languages */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'languages' ? null : 'languages')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-zinc-500" />
                                            <span>Languages</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'languages' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'languages' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-3">
                                            {resumeData.sections.languages.items.map((item) => (
                                                <div key={item.id} className="flex gap-2 items-center bg-zinc-50 p-2 border border-zinc-100 rounded-xl">
                                                    <input 
                                                        type="text" 
                                                        value={item.name}
                                                        onChange={(e) => updateLanguageItem(item.id, 'name', e.target.value)}
                                                        className="w-1/2 border border-zinc-200 px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={item.description}
                                                        onChange={(e) => updateLanguageItem(item.id, 'description', e.target.value)}
                                                        className="w-1/2 border border-zinc-200 px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                    />
                                                    <button 
                                                        onClick={() => deleteLanguageItem(item.id)}
                                                        className="p-1.5 border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all bg-white"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addLanguageItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Language
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 8: Certifications */}
                                <div className="border border-zinc-150 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'certifications' ? null : 'certifications')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Award size={14} className="text-zinc-500" />
                                            <span>Certifications</span>
                                        </div>
                                        <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === 'certifications' ? 'rotate-95' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'certifications' && (
                                        <div className="p-4 bg-white border-t border-zinc-100 space-y-4">
                                            {resumeData.sections.certifications.items.map((item, index) => (
                                                <div key={item.id} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => deleteCertItem(item.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Cert #{index + 1}</div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Cert Name</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.name}
                                                                onChange={(e) => updateCertItem(item.id, 'name', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Issuer</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.issuer}
                                                                onChange={(e) => updateCertItem(item.id, 'issuer', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Dates / Period</label>
                                                            <input 
                                                                type="text" 
                                                                value={item.period}
                                                                onChange={(e) => updateCertItem(item.id, 'period', e.target.value)}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addCertItem}
                                                className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Plus size={14} /> Add Certification
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Custom Sections */}
                                {resumeData.sections.custom && resumeData.sections.custom.map((sec, secIndex) => (
                                    <div key={sec.id} className="border border-zinc-150 rounded-xl overflow-hidden relative group/section">
                                        <button
                                            onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
                                            className="w-full px-5 py-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100/65 font-bold text-xs uppercase tracking-wider text-zinc-800 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Layers size={14} className="text-zinc-500" />
                                                <span>{sec.title || "Custom Section"}</span>
                                            </div>
                                            <ChevronRight size={14} className={`text-zinc-400 transition-transform ${openSection === sec.id ? 'rotate-95' : ''}`} />
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteCustomSection(sec.id); }}
                                            className="absolute top-3.5 right-12 p-1.5 bg-zinc-100 border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-100 transition-all opacity-0 group-hover/section:opacity-100 shadow-sm"
                                            title="Delete Entire Section"
                                        >
                                            <Trash2 size={12} />
                                        </button>

                                        {openSection === sec.id && (
                                            <div className="p-4 bg-white border-t border-zinc-100 space-y-4">
                                                <div>
                                                    <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Section Title</label>
                                                    <input 
                                                        type="text" 
                                                        value={sec.title}
                                                        onChange={(e) => updateCustomSectionTitle(sec.id, e.target.value)}
                                                        className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                    />
                                                </div>

                                                {sec.items.map((item, index) => (
                                                    <div key={item.id} className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50 space-y-3 relative group">
                                                        <button 
                                                            onClick={() => deleteCustomSectionItem(sec.id, item.id)}
                                                            className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <div className="text-[10px] font-bold text-zinc-400 uppercase">Item #{index + 1}</div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Name / Role</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.name}
                                                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, 'name', e.target.value)}
                                                                    className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Subtitle / Company</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.subtitle}
                                                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, 'subtitle', e.target.value)}
                                                                    className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Location</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.location}
                                                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, 'location', e.target.value)}
                                                                    className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Period</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.period}
                                                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, 'period', e.target.value)}
                                                                    className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[9px] font-extrabold uppercase text-zinc-400 mb-0.5">Description</label>
                                                            <textarea 
                                                                value={item.description}
                                                                onChange={(e) => updateCustomSectionItem(sec.id, item.id, 'description', e.target.value)}
                                                                rows={3}
                                                                className="w-full border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => addCustomSectionItem(sec.id)}
                                                    className="w-full py-2.5 border border-dashed border-zinc-350 hover:border-zinc-500 rounded-xl text-zinc-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                                >
                                                    <Plus size={14} /> Add Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                            </div>
                        )}

                        {/* Tab 3: Saved Layouts List */}
                        {activeTab === 'saved' && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-2">Saved Resume Layouts</h3>
                                {loadingSaved ? (
                                    <div className="text-center py-6 text-zinc-400 text-xs font-semibold animate-pulse">
                                        Loading saved layouts...
                                    </div>
                                ) : savedResumes.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-350 border border-dashed border-zinc-200 rounded-xl p-4 text-xs font-medium">
                                        No saved designs found. Click "Save Draft" at the top to save your current layout.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Multi-select Action Bar */}
                                        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-3 mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 select-none">
                                                <input 
                                                    type="checkbox"
                                                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                                    checked={selectedResumeIds.length === savedResumes.length && savedResumes.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedResumeIds(savedResumes.map(r => r.id));
                                                        } else {
                                                            setSelectedResumeIds([]);
                                                        }
                                                    }}
                                                />
                                                Select All ({savedResumes.length})
                                            </label>
                                            {selectedResumeIds.length > 0 && (
                                                <button
                                                    onClick={handleBatchDownload}
                                                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Download size={13} /> Batch Download ({selectedResumeIds.length})
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {savedResumes.map((saved) => (
                                                <div
                                                    key={saved.id}
                                                    onClick={() => handleLoadSavedResume(saved)}
                                                    className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-50
                                                        ${activeResumeId === saved.id ? 'border-zinc-950 bg-zinc-950/5' : 'border-zinc-150'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedResumeIds.includes(saved.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                if (e.target.checked) {
                                                                    setSelectedResumeIds(prev => [...prev, saved.id]);
                                                                } else {
                                                                    setSelectedResumeIds(prev => prev.filter(id => id !== saved.id));
                                                                }
                                                            }}
                                                            className="rounded border-zinc-350 text-zinc-900 focus:ring-zinc-900"
                                                        />
                                                        <FolderCheck size={16} className="text-zinc-650 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-xs text-zinc-800 truncate">{saved.title}</h4>
                                                            <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider truncate">
                                                                Template: {saved.styling_config?.template || 'Onyx'} • {new Date(saved.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleDeleteSavedResume(saved.id, e)}
                                                        className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50/50 transition-colors shrink-0"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Live A4 Preview Pane (60% width) */}
                <div className="flex-1 bg-zinc-100 flex justify-center items-start overflow-y-auto p-8 select-text print:bg-white print:p-0 print:overflow-visible relative z-10">
                    <style key={`${styling.template}-${styling.fontFamily}-${styling.accentColor}-${styling.fontSizeValue}-${styling.sectionSpacing}-${styling.paragraphSpacing}-${styling.lineSpacing}-${styling.marginPadding}-${fitScale}`}>{`
                        .resume-designer-container,
                        .resume-designer-container .font-sans,
                        .resume-designer-container .font-serif,
                        .resume-designer-container * {
                            font-family: ${resolveFontFamily(styling.fontFamily)} !important;
                        }
                        
                        .resume-designer-container {
                            --base-font-size: ${styling.fontSizeValue || '12px'};
                            font-size: calc(var(--base-font-size) * var(--fit-scale)) !important;
                            line-height: calc(${styling.lineSpacing || 1.4} * var(--fit-scale)) !important;
                        }
                        
                        /* Section Spacing Overrides */
                        .resume-designer-container .resume-section,
                        .resume-designer-container .mb-3\\.5,
                        .resume-designer-container .mb-4,
                        .resume-designer-container .mb-6,
                        .resume-designer-container .mb-8 {
                            margin-bottom: calc(${styling.sectionSpacing || 16}px * var(--fit-scale)) !important;
                        }
                        
                        /* Paragraph/Item Spacing Overrides */
                        .resume-designer-container .resume-item,
                        .resume-designer-container .space-y-3 > * + *,
                        .resume-designer-container .space-y-4 > * + *,
                        .resume-designer-container .space-y-2\\.5 > * + *,
                        .resume-designer-container .space-y-2 > * + * {
                            margin-top: calc(${styling.paragraphSpacing || 12}px * var(--fit-scale)) !important;
                        }
                        
                        .resume-designer-container .gap-3 {
                            gap: calc(${styling.paragraphSpacing || 12}px * var(--fit-scale)) !important;
                        }
                        .resume-designer-container .gap-4 {
                            gap: calc(${styling.paragraphSpacing || 12}px * var(--fit-scale)) !important;
                        }

                        @media print {
                            /* Avoid item page splits during PDF export */
                            .resume-designer-container .resume-item,
                            .resume-designer-container .space-y-3 > *,
                            .resume-designer-container .space-y-4 > *,
                            .resume-designer-container .space-y-2\\.5 > *,
                            .resume-designer-container .space-y-2 > *,
                            .resume-designer-container .grid > *,
                            .resume-designer-container .space-y-1\\.5 > *,
                            .resume-designer-container .space-y-1 > * {
                                break-inside: avoid !important;
                                page-break-inside: avoid !important;
                            }
                            
                            /* Keep section headings with content */
                            .resume-designer-container h2,
                            .resume-designer-container h3 {
                                break-after: avoid !important;
                                page-break-after: avoid !important;
                            }
                        }

                        /* Font scaling overrides inside printed/live canvas using CSS attribute selectors */
                        .resume-designer-container [class~="text-[8px]"] { font-size: calc(var(--base-font-size) * 8 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[8.5px]"] { font-size: calc(var(--base-font-size) * 8.5 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[9px]"] { font-size: calc(var(--base-font-size) * 9 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[9.5px]"] { font-size: calc(var(--base-font-size) * 9.5 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[10px]"] { font-size: calc(var(--base-font-size) * 10 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[10.5px]"] { font-size: calc(var(--base-font-size) * 10.5 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[11px]"] { font-size: calc(var(--base-font-size) * 11 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[11.5px]"] { font-size: calc(var(--base-font-size) * 11.5 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[12px]"] { font-size: calc(var(--base-font-size) * 12 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[13px]"] { font-size: calc(var(--base-font-size) * 13 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container [class~="text-[14px]"] { font-size: calc(var(--base-font-size) * 14 / 12 * var(--fit-scale)) !important; }

                        .resume-designer-container .text-xs { font-size: calc(var(--base-font-size) * 12 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-sm { font-size: calc(var(--base-font-size) * 14 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-base { font-size: calc(var(--base-font-size) * 16 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-lg { font-size: calc(var(--base-font-size) * 18 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-xl { font-size: calc(var(--base-font-size) * 20 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-2xl { font-size: calc(var(--base-font-size) * 24 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-3xl { font-size: calc(var(--base-font-size) * 30 / 12 * var(--fit-scale)) !important; }
                        .resume-designer-container .text-4xl { font-size: calc(var(--base-font-size) * 36 / 12 * var(--fit-scale)) !important; }
                    `}</style>
                    <div 
                        id="resume-a4-canvas"
                        ref={printAreaRef}
                        className="bg-white shadow-xl shadow-zinc-900/5 border border-zinc-200/50 rounded-2xl w-[793px] min-h-[1122px] print:shadow-none print:border-none print:rounded-none relative resume-designer-container flex flex-col items-stretch"
                        style={{
                            boxSizing: 'border-box',
                            padding: styling.fitToSinglePage
                                ? `calc(${styling.marginPadding === 'p-6' ? '24px' : styling.marginPadding === 'p-14' ? '56px' : '40px'} * var(--fit-scale))`
                                : (styling.marginPadding === 'p-6' ? '24px' : styling.marginPadding === 'p-14' ? '56px' : '40px'),
                            '--fit-scale': styling.fitToSinglePage ? fitScale : 1.0,
                            height: styling.fitToSinglePage ? '1122px' : `${previewPageCount * 1122}px`
                        }}
                    >
                        {styling.template === 'onyx' && <OnyxTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'pikachu' && <PikachuTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'azurill' && <AzurillTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'gengar' && <GengarTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'castform' && <CastformTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'glissando' && <GlissandoTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'dublin' && <DublinTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'harvard' && <HarvardTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'kyoto' && <KyotoTemplate data={resumeData} styling={styling} analysisResult={analysisResult} />}
                        {styling.template === 'leafish' && <LeafishTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'rhyhorn' && <RhyhornTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'chikorita' && <ChikoritaTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'kakuna' && <KakunaTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'eevee' && <EeveeTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'charmander' && <CharmanderTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'bronzor' && <BronzorTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'glalie' && <GlalieTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'ditto' && <DittoTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'jigglypuff' && <JigglypuffTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'celebi' && <CelebiTemplate data={resumeData} styling={styling} />}
                        {styling.template === 'lucario' && <LucarioTemplate data={resumeData} styling={styling} />}
 
                        {/* Visual Page Break Indicators */}
                        {Array.from({ length: Math.max(0, previewPageCount - 1) }, (_, i) => i + 1).map(pageNum => (
                            <div 
                                key={pageNum}
                                className="absolute inset-x-0 pointer-events-none z-30 print:hidden flex items-center justify-between"
                                style={{ top: `${pageNum * 1122}px` }}
                            >
                                <div className="w-full border-b border-dashed border-blue-400/50" />
                                <span className="shrink-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-l shadow-sm ml-2">
                                    Page {pageNum + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden batch print container */}
            <div id="resume-print-batch-container" className="hidden print:block absolute left-0 top-0 w-full">
                {selectedResumeIds.map((id, index) => {
                    const resume = savedResumes.find(r => r.id === id);
                    if (!resume) return null;
                    const rData = resume.resume_data;
                    const rStyling = resume.styling_config || styling;
                    const isLast = index === selectedResumeIds.length - 1;

                    return (
                        <div 
                            key={id}
                            className={`bg-white w-[793px] min-h-[1122px] mx-auto ${!isLast ? 'print-page-break' : ''} batch-resume-container-${id}`}
                            style={{
                                boxSizing: 'border-box',
                                padding: rStyling.marginPadding === 'p-6' ? '24px' : rStyling.marginPadding === 'p-14' ? '56px' : '40px'
                            }}
                        >
                            <style>{`
                                .batch-resume-container-${id},
                                .batch-resume-container-${id} .font-sans,
                                .batch-resume-container-${id} .font-serif,
                                .batch-resume-container-${id} * {
                                    font-family: ${resolveFontFamily(rStyling.fontFamily)} !important;
                                }
                                .batch-resume-container-${id} {
                                    --base-font-size: ${rStyling.fontSizeValue || '12px'};
                                    font-size: var(--base-font-size) !important;
                                    line-height: ${rStyling.lineSpacing || 1.4} !important;
                                }
                                .batch-resume-container-${id} .resume-section,
                                .batch-resume-container-${id} .mb-3\\.5,
                                .batch-resume-container-${id} .mb-4,
                                .batch-resume-container-${id} .mb-6,
                                .batch-resume-container-${id} .mb-8 {
                                    margin-bottom: ${rStyling.sectionSpacing || 16}px !important;
                                }
                                .batch-resume-container-${id} .resume-item,
                                .batch-resume-container-${id} .space-y-3 > * + *,
                                .batch-resume-container-${id} .space-y-4 > * + *,
                                .batch-resume-container-${id} .space-y-2\\.5 > * + *,
                                .batch-resume-container-${id} .space-y-2 > * + * {
                                    margin-top: ${rStyling.paragraphSpacing || 12}px !important;
                                }

                                /* Font scaling overrides inside printed batch containers using CSS attribute selectors */
                                .batch-resume-container-${id} [class~="text-[8px]"] { font-size: calc(var(--base-font-size) * 8 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[8.5px]"] { font-size: calc(var(--base-font-size) * 8.5 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[9px]"] { font-size: calc(var(--base-font-size) * 9 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[9.5px]"] { font-size: calc(var(--base-font-size) * 9.5 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[10px]"] { font-size: calc(var(--base-font-size) * 10 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[10.5px]"] { font-size: calc(var(--base-font-size) * 10.5 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[11px]"] { font-size: calc(var(--base-font-size) * 11 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[11.5px]"] { font-size: calc(var(--base-font-size) * 11.5 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[12px]"] { font-size: calc(var(--base-font-size) * 12 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[13px]"] { font-size: calc(var(--base-font-size) * 13 / 12) !important; }
                                .batch-resume-container-${id} [class~="text-[14px]"] { font-size: calc(var(--base-font-size) * 14 / 12) !important; }

                                .batch-resume-container-${id} .text-xs { font-size: calc(var(--base-font-size) * 12 / 12) !important; }
                                .batch-resume-container-${id} .text-sm { font-size: calc(var(--base-font-size) * 14 / 12) !important; }
                                .batch-resume-container-${id} .text-base { font-size: calc(var(--base-font-size) * 16 / 12) !important; }
                                .batch-resume-container-${id} .text-lg { font-size: calc(var(--base-font-size) * 18 / 12) !important; }
                                .batch-resume-container-${id} .text-xl { font-size: calc(var(--base-font-size) * 20 / 12) !important; }
                                .batch-resume-container-${id} .text-2xl { font-size: calc(var(--base-font-size) * 24 / 12) !important; }
                                .batch-resume-container-${id} .text-3xl { font-size: calc(var(--base-font-size) * 30 / 12) !important; }
                                .batch-resume-container-${id} .text-4xl { font-size: calc(var(--base-font-size) * 36 / 12) !important; }
                            `}</style>
                            {rStyling.template === 'onyx' && <OnyxTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'pikachu' && <PikachuTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'azurill' && <AzurillTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'gengar' && <GengarTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'castform' && <CastformTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'glissando' && <GlissandoTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'dublin' && <DublinTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'harvard' && <HarvardTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'kyoto' && <KyotoTemplate data={rData} styling={rStyling} analysisResult={analysisResult} />}
                            {rStyling.template === 'leafish' && <LeafishTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'rhyhorn' && <RhyhornTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'chikorita' && <ChikoritaTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'kakuna' && <KakunaTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'eevee' && <EeveeTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'charmander' && <CharmanderTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'bronzor' && <BronzorTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'glalie' && <GlalieTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'ditto' && <DittoTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'jigglypuff' && <JigglypuffTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'celebi' && <CelebiTemplate data={rData} styling={rStyling} />}
                            {rStyling.template === 'lucario' && <LucarioTemplate data={rData} styling={rStyling} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
