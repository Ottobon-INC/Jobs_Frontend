import React, { useState } from 'react';

// All logos are served locally from /logos/ — no external API calls
const LOGO_MAP = {
    "accenture": "/logos/accenture.svg",
    "acetrot": "/logos/acetrot.png",
    "ada-global": "/logos/ada-global.png",
    "aditya-birla-capital": "/logos/aditya-birla-capital.png",
    "adobe": "/logos/adobe.png",
    "ai-interview-agents": "/logos/ai-interview-agents.png",
    "aircanada": "/logos/aircanada.png",
    "airtel": "/logos/airtel.png",
    "airtel-payments-bank": "/logos/airtel-payments-bank.png",
    "algoshack": "/logos/algoshack.png",
    "alike": "/logos/alike.png",
    "amazon": "/logos/amazon.svg",
    "ambion-softwares": "/logos/ambion-softwares.png",
    "amgen": "/logos/amgen.png",
    "apex-design-co": "/logos/apex-design-co.png",
    "appian": "/logos/appian.png",
    "apple": "/logos/apple.svg",
    "appliedmaterials": "/logos/appliedmaterials.png",
    "arcana": "/logos/arcana.png",
    "arcgate": "/logos/arcgate.png",
    "arm": "/logos/arm.png",
    "ashby": "/logos/ashby.png",
    "assessment-centre": "/logos/assessment-centre.png",
    "astrazeneca": "/logos/astrazeneca.png",
    "auric-ai": "/logos/auric-ai.jpg",
    "bairesdev": "/logos/bairesdev.png",
    "bajaj-finserv": "/logos/bajaj-finserv.png",
    "bar-raiser": "/logos/bar-raiser.png",
    "barclays": "/logos/barclays.png",
    "blackhawk-network-india": "/logos/blackhawk-network-india.png",
    "boeing": "/logos/boeing.svg",
    "bootcoding": "/logos/bootcoding.png",
    "breakout": "/logos/breakout.jpg",
    "breezy": "/logos/breezy.png",
    "business-discussion": "/logos/business-discussion.png",
    "bvm-infotech": "/logos/bvm-infotech.png",
    "capgemini": "/logos/capgemini.png",
    "caterpillar": "/logos/caterpillar.png",
    "celestica": "/logos/celestica.png",
    "chandan": "/logos/chandan.png",
    "chevron": "/logos/chevron.png",
    "chrysalis": "/logos/chrysalis.png",
    "chtrbox": "/logos/chtrbox.png",
    "cisco": "/logos/cisco.png",
    "code-players": "/logos/code-players.png",
    "coding-assessment": "/logos/coding-assessment.png",
    "coding-math": "/logos/coding-math.png",
    "cognizant": "/logos/cognizant.png",
    "cognoid": "/logos/cognoid.png",
    "collaborative-coding": "/logos/collaborative-coding.png",
    "convoso": "/logos/convoso.png",
    "coriolis": "/logos/coriolis.png",
    "crediblesoft": "/logos/crediblesoft.png",
    "crisil": "/logos/crisil.png",
    "deep-dive": "/logos/deep-dive.png",
    "delkon": "/logos/delkon.ico",
    "deloitte": "/logos/deloitte.png",
    "design-round": "/logos/design-round.png",
    "digital-heroes": "/logos/digital-heroes.png",
    "domain-screen": "/logos/domain-screen.ico",
    "dot2dot": "/logos/dot2dot.png",
    "eigen": "/logos/eigen.png",
    "epam": "/logos/epam.png",
    "epam-systems": "/logos/epam-systems.jpg",
    "epiroc-mining-india": "/logos/epiroc-mining-india.png",
    "esolz": "/logos/esolz.png",
    "exl-service": "/logos/exl-service.png",
    "ey": "/logos/ey.svg",
    "fintech-it": "/logos/fintech-it.png",
    "flatx": "/logos/flatx.png",
    "flipkart": "/logos/flipkart.png",
    "godigi-infotech": "/logos/godigi-infotech.png",
    "goldman-sachs": "/logos/goldman-sachs.png",
    "google": "/logos/google.svg",
    "googliness": "/logos/googliness.png",
    "gravitix": "/logos/gravitix.png",
    "greenhouse": "/logos/greenhouse.png",
    "gsat": "/logos/gsat.png",
    "gurutu": "/logos/gurutu.ico",
    "hcl": "/logos/hcl.png",
    "helius": "/logos/helius.jpg",
    "hexaware": "/logos/hexaware.png",
    "hiring-manager": "/logos/hiring-manager.jpg",
    "hitachi-energy": "/logos/hitachi-energy.png",
    "hk-infosoft": "/logos/hk-infosoft.jpg",
    "homedepot": "/logos/homedepot.svg",
    "honeywell": "/logos/honeywell.png",
    "housiey": "/logos/housiey.png",
    "hpe": "/logos/hpe.svg",
    "hrs": "/logos/hrs.png",
    "ibm": "/logos/ibm.svg",
    "indium-software": "/logos/indium-software.png",
    "infosys": "/logos/infosys.svg",
    "infotech": "/logos/infotech.jpg",
    "interview": "/logos/interview.png",
    "interview-loop": "/logos/interview-loop.png",
    "interviews": "/logos/interviews.ico",
    "intuit": "/logos/intuit.png",
    "ishr": "/logos/ishr.png",
    "ixigo": "/logos/ixigo.png",
    "juspay": "/logos/juspay.png",
    "kpmg": "/logos/kpmg.png",
    "krutrim-ai": "/logos/krutrim-ai.png",
    "lamresearch": "/logos/lamresearch.png",
    "larsen-and-toubro-infotech": "/logos/larsen-and-toubro-infotech.png",
    "larsen-toubro": "/logos/larsen-toubro.png",
    "link-ideas": "/logos/link-ideas.jpg",
    "llama": "/logos/llama.jpg",
    "logic-planet": "/logos/logic-planet.png",
    "loreal": "/logos/loreal.svg",
    "lti-mindtree": "/logos/lti-mindtree.png",
    "lucidbox": "/logos/lucidbox.ico",
    "mars-cosmetics": "/logos/mars-cosmetics.png",
    "meril": "/logos/meril.ico",
    "meta": "/logos/meta.svg",
    "micron": "/logos/micron.png",
    "microsoft": "/logos/microsoft.svg",
    "morpich-design": "/logos/morpich-design.png",
    "msm-unify": "/logos/msm-unify.png",
    "myhealthcare": "/logos/myhealthcare.jpg",
    "nayepankh": "/logos/nayepankh.jpg",
    "netapp": "/logos/netapp.png",
    "neurasys": "/logos/neurasys.png",
    "nextgen-infotech": "/logos/nextgen-infotech.ico",
    "nomura": "/logos/nomura.png",
    "nopadvance": "/logos/nopadvance.png",
    "notion": "/logos/notion.png",
    "nova-ventures": "/logos/nova-ventures.png",
    "nvidia": "/logos/nvidia.svg",
    "nykaa": "/logos/nykaa.png",
    "oa-1-2": "/logos/oa-1-2.ico",
    "online-assessment": "/logos/online-assessment.png",
    "online-coding-test": "/logos/online-coding-test.png",
    "online-test": "/logos/online-test.png",
    "onsite": "/logos/onsite.png",
    "onstro": "/logos/onstro.png",
    "openai": "/logos/openai.svg",
    "optima-analytics": "/logos/optima-analytics.png",
    "oracle": "/logos/oracle.svg",
    "ottobon": "/logos/ottobon.png",
    "ovhcloud": "/logos/ovhcloud.png",
    "paarsh-infotech": "/logos/paarsh-infotech.jpg",
    "palantir": "/logos/palantir.svg",
    "pan-india": "/logos/pan-india.jpg",
    "pattem-digital": "/logos/pattem-digital.png",
    "pawzz": "/logos/pawzz.png",
    "payu": "/logos/payu.png",
    "pepsico": "/logos/pepsico.svg",
    "persistent-systems": "/logos/persistent-systems.png",
    "phone-screen": "/logos/phone-screen.png",
    "phonepe": "/logos/phonepe.svg",
    "pinnacle-teleservices": "/logos/pinnacle-teleservices.png",
    "plane-software": "/logos/plane-software.ico",
    "primetradeai": "/logos/primetradeai.png",
    "prodev-infotech": "/logos/prodev-infotech.png",
    "propertyguru-pte": "/logos/propertyguru-pte.png",
    "ptc": "/logos/ptc.png",
    "pwc": "/logos/pwc.png",
    "pwc-india": "/logos/pwc-india.png",
    "qualcomm": "/logos/qualcomm.png",
    "queens-of-change": "/logos/queens-of-change.png",
    "questt": "/logos/questt.png",
    "ramyoz": "/logos/ramyoz.png",
    "razorpay": "/logos/razorpay.svg",
    "reckitt": "/logos/reckitt.png",
    "recruiter-screen": "/logos/recruiter-screen.png",
    "redhat": "/logos/redhat.png",
    "resmed": "/logos/resmed.png",
    "robusta": "/logos/robusta.png",
    "rolls-royce": "/logos/rolls-royce.svg",
    "routematic": "/logos/routematic.png",
    "salesforce": "/logos/salesforce.svg",
    "samsung-rd-india": "/logos/samsung-rd-india.png",
    "samsung-research": "/logos/samsung-research.png",
    "sarvam-ai": "/logos/sarvam-ai.png",
    "section": "/logos/section.png",
    "sentry": "/logos/sentry.png",
    "shrewd-business": "/logos/shrewd-business.ico",
    "skyflow": "/logos/skyflow.png",
    "skyroot-aerospace": "/logos/skyroot-aerospace.png",
    "slb": "/logos/slb.png",
    "smart-webtech": "/logos/smart-webtech.jpg",
    "snowflake": "/logos/snowflake.png",
    "sofac-e-systems": "/logos/sofac-e-systems.jpg",
    "stripe": "/logos/stripe.png",
    "stryker": "/logos/stryker.png",
    "sun-pharma": "/logos/sun-pharma.png",
    "swiggy": "/logos/swiggy.png",
    "symonis": "/logos/symonis.png",
    "synopsys": "/logos/synopsys.ico",
    "tcs": "/logos/tcs.svg",
    "teamified": "/logos/teamified.png",
    "technical-interview": "/logos/technical-interview.png",
    "technical-interviews": "/logos/technical-interviews.png",
    "tesco-india": "/logos/tesco-india.png",
    "thalesgroup": "/logos/thalesgroup.png",
    "the-adroit": "/logos/the-adroit.ico",
    "the-fast-way": "/logos/the-fast-way.png",
    "toyota": "/logos/toyota.svg",
    "unacademy": "/logos/unacademy.png",
    "unessa": "/logos/unessa.jpg",
    "unilever": "/logos/unilever.png",
    "unitedhealthgroup": "/logos/unitedhealthgroup.png",
    "unthinkable": "/logos/unthinkable.png",
    "urbanroof": "/logos/urbanroof.png",
    "veracity-software": "/logos/veracity-software.png",
    "visa": "/logos/visa.png",
    "wipro": "/logos/wipro.svg",
    "xerox": "/logos/xerox.png",
    "xiarch": "/logos/xiarch.png",
    "zepto": "/logos/zepto.png",
    "zimmerbiomet": "/logos/zimmerbiomet.png"
};

const cleanSlug = (name) => {
    if (!name) return "";
    let cleaned = name.toLowerCase().trim();
    cleaned = cleaned.replace(/[®™]/g, '');
    const suffixes = /\b(pvt|ltd|limited|inc|corporation|llp|group|solutions|services|foundation|labs|tech|technology|technologies)\b/g;
    cleaned = cleaned.replace(suffixes, '');
    cleaned = cleaned.replace(/[^a-z0-9\s-]/g, '');
    cleaned = cleaned.replace(/\s+/g, '-').replace(/-+/g, '-');
    cleaned = cleaned.replace(/^-+|-+$/g, '');
    return cleaned;
};

export const CompanyLogo = ({ company, className = "w-16 h-16", iconSize = 24 }) => {
    const name = (company?.name || 'Company').trim();
    const slug = cleanSlug(company?.slug || name);
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
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#1C1A17] to-[#222222]">
                    <span className="text-white font-black text-lg tracking-tight">{initials}</span>
                </div>
            )}
        </div>
    );
};
