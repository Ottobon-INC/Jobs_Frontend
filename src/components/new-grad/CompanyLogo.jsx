import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export const CompanyLogo = ({ company, className = "w-16 h-16", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    
    // Determine domain and logo URL
    const name = company?.name || 'Company';
    const domain = name.toLowerCase().replace(/\s/g, '').replace(/[\(\)]/g, '') + '.com';
    const initialLogo = company?.logo || `https://logo.clearbit.com/${domain}`;

    return (
        <div className={`${className} bg-white rounded-2xl flex items-center justify-center border border-zinc-100 relative overflow-hidden`}>
            {!imageError ? (
                <img 
                    src={initialLogo} 
                    alt={name} 
                    className="max-w-full max-h-full object-contain relative z-10 p-2"
                    onError={(e) => {
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('clearbit')) {
                            e.target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                        } else if (currentSrc.includes('google.com/s2')) {
                            e.target.src = `https://unavatar.io/${domain}`;
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
