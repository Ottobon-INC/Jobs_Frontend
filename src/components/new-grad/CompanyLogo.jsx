import React, { useState } from 'react';

// All logos are served locally from /logos/ — no external API calls
const LOGO_MAP = {
    "accenture": "/logos/accenture.svg",
    "adobe": "/logos/adobe.png",
    "amazon": "/logos/amazon.svg",
    "amgen": "/logos/amgen.png",
    "apple": "/logos/apple.svg",
    "appliedmaterials": "/logos/appliedmaterials.png",
    "arm": "/logos/arm.png",
    "ashby": "/logos/ashby.png",
    "astrazeneca": "/logos/astrazeneca.png",
    "boeing": "/logos/boeing.svg",
    "breezy": "/logos/breezy.png",
    "capgemini": "/logos/capgemini.png",
    "chevron": "/logos/chevron.png",
    "cognizant": "/logos/cognizant.png",
    "deloitte": "/logos/deloitte.png",
    "epam": "/logos/epam.png",
    "ey": "/logos/ey.svg",
    "flipkart": "/logos/flipkart.png",
    "google": "/logos/google.svg",
    "greenhouse": "/logos/greenhouse.png",
    "hcl": "/logos/hcl.png",
    "hexaware": "/logos/hexaware.png",
    "homedepot": "/logos/homedepot.svg",
    "hpe": "/logos/hpe.svg",
    "ibm": "/logos/ibm.svg",
    "infosys": "/logos/infosys.svg",
    "intuit": "/logos/intuit.png",
    "krutrim-ai": "/logos/krutrim-ai.png",
    "lamresearch": "/logos/lamresearch.png",
    "loreal": "/logos/loreal.svg",
    "lti-mindtree": "/logos/lti-mindtree.png",
    "meta": "/logos/meta.svg",
    "micron": "/logos/micron.png",
    "microsoft": "/logos/microsoft.svg",
    "nvidia": "/logos/nvidia.svg",
    "openai": "/logos/openai.svg",
    "oracle": "/logos/oracle.svg",
    "ovhcloud": "/logos/ovhcloud.png",
    "palantir": "/logos/palantir.svg",
    "pepsico": "/logos/pepsico.svg",
    "phonepe": "/logos/phonepe.svg",
    "ptc": "/logos/ptc.png",
    "pwc": "/logos/pwc.png",
    "qualcomm": "/logos/qualcomm.png",
    "razorpay": "/logos/razorpay.svg",
    "rolls-royce": "/logos/rolls-royce.svg",
    "salesforce": "/logos/salesforce.png",
    "samsung-research": "/logos/samsung-research.png",
    "sarvam-ai": "/logos/sarvam-ai.png",
    "sentry": "/logos/sentry.png",
    "skyroot-aerospace": "/logos/skyroot-aerospace.png",
    "stryker": "/logos/stryker.png",
    "swiggy": "/logos/swiggy.png",
    "tcs": "/logos/tcs.svg",
    "thalesgroup": "/logos/thalesgroup.png",
    "toyota": "/logos/toyota.svg",
    "unilever": "/logos/unilever.png",
    "visa": "/logos/visa.png",
    "wipro": "/logos/wipro.svg",
    "zepto": "/logos/zepto.png",
    "zimmerbiomet": "/logos/zimmerbiomet.png"
};

export const CompanyLogo = ({ company, className = "w-16 h-16", iconSize = 24 }) => {
    const name = company?.name || 'Company';
    const slug = company?.slug || name.toLowerCase().replace(/\s+/g, '-');
    const externalLogo = company?.logo || company?.logo_url || null;
    
    const [imgIdx, setImgIdx] = useState(0);

    // Clean the name for domain guessing (e.g. "Visa Inc." -> "visa")
    const baseName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Build a unique list of fallback URLs
    const sources = [...new Set([
        LOGO_MAP[slug],
        LOGO_MAP[baseName],
        externalLogo,
        `https://logo.clearbit.com/${slug}.com`,
        `https://logo.clearbit.com/${baseName}.com`,
        `https://unavatar.io/${slug}.com?fallback=false`,
        `https://unavatar.io/${baseName}.com?fallback=false`
    ].filter(Boolean))];

    const hasValidSource = imgIdx < sources.length;
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <div className={`${className} bg-white rounded-2xl flex items-center justify-center border border-zinc-100 relative overflow-hidden`}>
            {hasValidSource ? (
                <img
                    src={sources[imgIdx]}
                    alt={name}
                    className="max-w-full max-h-full object-contain relative z-10 p-2"
                    onError={() => setImgIdx(prev => prev + 1)}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#313851] to-[#404a6b]">
                    <span className="text-white font-black text-lg tracking-tight">{initials}</span>
                </div>
            )}
        </div>
    );
};
