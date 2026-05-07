/**
 * companyRounds.js
 * Company-specific multi-round interview structures.
 * Used as a fallback when job.metadata has no interview_structure.
 *
 * Each round: { round_name, focus_description, question_limit }
 * question_limit = number of AI responses before advancing to the next round.
 */

const COMPANY_ROUNDS = {
    google: [
        { round_name: 'DSA', 
          focus_description: 'Data structures & algorithms. Ask 1-2 LeetCode-style problems. Probe time/space complexity.', 
          question_limit: 4 },
        { round_name: 'System Design', 
          focus_description: 'Design a Google-scale system (Search, YouTube, Maps). Probe scalability, storage, caching.', 
          question_limit: 3 },
        { round_name: 'Googleyness', 
          focus_description: 'STAR behavioral. Focus on ambiguity, ownership, cross-functional collaboration.', 
          question_limit: 2 },
    ],
    amazon: [
        { round_name: 'Leadership Principles', 
          focus_description: 'STAR questions mapped to Amazon LP: Customer Obsession, Ownership, Bias for Action.', 
          question_limit: 3 },
        { round_name: 'Technical Deep-dive', 
          focus_description: 'System design + coding. Focus on scalability and operational excellence.', 
          question_limit: 4 },
        { round_name: 'Bar Raiser', 
          focus_description: 'Ambiguous problem-solving. Evaluate unconventional thinking and long-term impact.', 
          question_limit: 2 },
    ],
    microsoft: [
        { round_name: 'Technical Coding', 
          focus_description: 'DSA with emphasis on clean, maintainable code. Ask candidate to walk through reasoning.', 
          question_limit: 4 },
        { round_name: 'System Design', 
          focus_description: 'Design a Microsoft product feature (OneDrive, Teams). Probe API design and extensibility.', 
          question_limit: 3 },
        { round_name: 'Culture Fit', 
          focus_description: 'Growth Mindset culture: learning from failure, collaboration, inclusivity, driving impact.', 
          question_limit: 2 },
    ],
    meta: [
        { round_name: 'Coding', 
          focus_description: 'Advanced algorithms. Expect optimal solutions — probe for O(n log n) or better.', 
          question_limit: 4 },
        { round_name: 'System Design', 
          focus_description: 'Social-scale system (Facebook Feed, Instagram Stories). Probe sharding, CDN, real-time pipelines.', 
          question_limit: 3 },
        { round_name: 'Behavioral', 
          focus_description: 'STAR format. Meta focuses on Move Fast culture — speed of iteration, data-driven decisions.', 
          question_limit: 2 },
    ],
    startup: [
        { round_name: 'Culture Fit', 
          focus_description: 'Ambiguity, entrepreneurial mindset, risk tolerance, early-stage excitement.', 
          question_limit: 3 },
        { round_name: 'Technical', 
          focus_description: 'Full-stack generalist questions. Frontend, backend, infra breadth. Past side projects.', 
          question_limit: 3 },
        { round_name: 'Founder Round', 
          focus_description: 'Realistic startup scenario with limited resources. Resourcefulness and product thinking.', 
          question_limit: 2 },
    ],
    default: [
        { round_name: 'General', 
          focus_description: 'Technical and behavioral questions relevant to the role.', 
          question_limit: 999 },
    ],
};

/**
 * Returns the round configuration for a given company name.
 * Performs a case-insensitive fuzzy match against known companies.
 * Falls back to 'default' if no match is found.
 *
 * @param {string} companyName
 * @returns {Array<{round_name: string, focus_description: string, question_limit: number}>}
 */
export function getCompanyRounds(companyName = '') {
    if (!companyName) return COMPANY_ROUNDS.default;

    const lower = companyName.toLowerCase().trim();

    // Exact or partial key match
    const knownKeys = Object.keys(COMPANY_ROUNDS);
    for (const key of knownKeys) {
        if (key === 'default') continue;
        if (lower.includes(key) || key.includes(lower)) {
            return COMPANY_ROUNDS[key];
        }
    }

    // Extended fuzzy aliases
    const aliases = {
        google: ['alphabet', 'deepmind', 'waymo'],
        amazon: ['aws', 'prime', 'alexa'],
        microsoft: ['azure', 'msft', 'xbox', 'github'],
        meta: ['facebook', 'instagram', 'whatsapp', 'oculus'],
        startup: ['seed', 'series a', 'series b', 'venture', 'vc-backed', 'early-stage'],
    };

    for (const [key, aliasList] of Object.entries(aliases)) {
        if (aliasList.some(alias => lower.includes(alias))) {
            return COMPANY_ROUNDS[key];
        }
    }

    return COMPANY_ROUNDS.default;
}

export { COMPANY_ROUNDS };
