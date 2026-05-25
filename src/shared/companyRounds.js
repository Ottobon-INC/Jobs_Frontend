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
        {
            round_name: 'DSA',
            focus_description: 'Data structures and algorithms. Ask 1-2 LeetCode-style problems. Always probe time and space complexity. Request step-by-step verbal walkthrough.',
            question_limit: 4,
        },
        {
            round_name: 'System Design',
            focus_description: 'Design a Google-scale system (Search, YouTube, Maps). Probe scalability, storage, caching, and trade-offs in depth.',
            question_limit: 3,
        },
        {
            round_name: 'Googleyness',
            focus_description: 'STAR behavioral questions. Focus on ambiguity tolerance, ownership, cross-functional collaboration, and culture fit.',
            question_limit: 2,
        },
    ],
    amazon: [
        {
            round_name: 'Leadership Principles',
            focus_description: 'STAR questions mapped directly to Amazon Leadership Principles: Customer Obsession, Ownership, Bias for Action, Deliver Results.',
            question_limit: 4,
        },
        {
            round_name: 'Technical Deep-dive',
            focus_description: 'System design and coding. Focus on scalability, reliability, and operational excellence as Amazon prioritizes.',
            question_limit: 4,
        },
        {
            round_name: 'Bar Raiser',
            focus_description: 'Ambiguous problem-solving scenarios. Evaluate unconventional thinking, depth of reasoning, and long-term impact.',
            question_limit: 2,
        },
    ],
    microsoft: [
        {
            round_name: 'Technical Coding',
            focus_description: 'DSA with emphasis on clean, maintainable code. Ask candidate to walk through reasoning. Growth mindset check woven in.',
            question_limit: 5,
        },
        {
            round_name: 'Design and Culture',
            focus_description: 'System design for a Microsoft product feature (OneDrive, Teams). Plus Growth Mindset: learning from failure, inclusivity, collaboration.',
            question_limit: 3,
        },
    ],
    meta: [
        {
            round_name: 'Coding',
            focus_description: 'Advanced algorithms. Expect optimal solutions — probe for O(n log n) or better. Move Fast culture — speed and correctness both matter.',
            question_limit: 4,
        },
        {
            round_name: 'System Design',
            focus_description: 'Social-scale distributed systems (Facebook Feed, Instagram Stories, WhatsApp). Probe sharding, CDN, real-time pipelines.',
            question_limit: 3,
        },
        {
            round_name: 'Behavioral',
            focus_description: 'STAR format focused on measurable impact and data-driven decisions. Meta values speed of iteration.',
            question_limit: 2,
        },
    ],
    startup: [
        {
            round_name: 'Culture Fit',
            focus_description: 'Ambiguity, entrepreneurial mindset, risk tolerance, excitement about early-stage work. Probe for resourcefulness.',
            question_limit: 3,
        },
        {
            round_name: 'Technical',
            focus_description: 'Full-stack generalist questions. Frontend, backend, infrastructure breadth. Ask about past side projects and shipping.',
            question_limit: 4,
        },
    ],
    default: [
        {
            round_name: 'General',
            focus_description: 'Balanced technical and behavioral questions adapted to the candidate profile and job description.',
            question_limit: 999,
        },
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
