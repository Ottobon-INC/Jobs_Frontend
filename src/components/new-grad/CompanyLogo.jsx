import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export const CompanyLogo = ({ company, className = "w-16 h-16", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    
    // Determine domain and logo URL
    const name = company?.name || 'Company';
    
    // Improved domain detection: only use if it looks like a real company domain
    const getCleanDomain = () => {
        if (!company?.name) return null;
        const n = company.name.toLowerCase().trim();
        // Ignore generic or common placeholder names
        if (['multiple', 'tcs', 'various', 'confidential'].includes(n)) return null;
        return n.replace(/\s/g, '').replace(/[\(\)]/g, '') + '.com';
    };
    
    const domain = getCleanDomain();
    
    // If no logo and no valid domain, start with error state
    const initialLogo = company?.logo || (domain ? `https://unavatar.io/${domain}` : null);
    
    useEffect(() => {
        if (!initialLogo) setImageError(true);
    }, [initialLogo]);

    return (
        <div className={`${className} bg-white rounded-2xl flex items-center justify-center border border-zinc-100 relative overflow-hidden`}>
            {!imageError ? (
                <img 
                    src={initialLogo} 
                    alt={name} 
                    className="max-w-full max-h-full object-contain relative z-10 p-2"
                    onError={(e) => {
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('unavatar.io')) {
                            e.target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                        } else {
                            setImageError(true);
                        }
                    }}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-[#313851]/40 bg-zinc-50">
                    <TrendingUp size={iconSize} />
                </div>
            )}
        </div>
    );
};
