import api from './client';

// Realistic, premium default testimonials with custom colors, outcomes, and highlights
const DEFAULT_TESTIMONIALS = [
    {
        id: 't1',
        name: 'Arjun Mehta',
        role: 'Senior Software Engineer',
        company: 'Google',
        initials: 'AM',
        avatarBg: '#cfe2fe',
        avatarColor: '#1e3a8a',
        content: 'Ottobon completely transformed my search. The AI-tailored resume advice matched the exact expectations of hiring teams, and I landed my dream role within 3 weeks!',
        highlight: 'AI-tailored resume advice',
        rating: 5,
        tag: 'Tech Placement',
        outcome: 'Hired in 14 days'
    },
    {
        id: 't2',
        name: 'Priya Sharma',
        role: 'Product Designer',
        company: 'Swiggy',
        initials: 'PS',
        avatarBg: '#ebd0d6',
        avatarColor: '#5a2a35',
        content: 'The mock interview simulator gave me a safe space to fail before the real thing. I walked into my Swiggy round with zero nerves.',
        highlight: 'safe space to fail',
        rating: 5,
        tag: 'Design Career',
        outcome: 'Hired in 21 days'
    },
    {
        id: 't3',
        name: 'Rohan Deshmukh',
        role: 'iOS Developer',
        company: 'CRED',
        initials: 'RD',
        avatarBg: '#e0e7ff',
        avatarColor: '#3730a3',
        content: 'I redeemed interview guides using the daily reward coins, which gave me an edge. The platform structure is modern, fast, and outcome-oriented.',
        highlight: 'daily reward coins',
        rating: 5,
        tag: 'Mobile Engineering',
        outcome: 'Hired in 18 days'
    },
    {
        id: 't4',
        name: 'Sneha Rao',
        role: 'Cloud Architect',
        company: 'Microsoft',
        initials: 'SR',
        avatarBg: '#d1fae5',
        avatarColor: '#065f46',
        content: 'Semantic fit analysis is a game-changer. Instead of spraying resumes, I focused on high-match roles and saw a 4x response rate increase.',
        highlight: '4x response rate increase',
        rating: 5,
        tag: 'Cloud & DevOps',
        outcome: 'Hired in 25 days'
    }
];

/**
 * Fetch testimonials from the backend Featured API.
 * If endpoint is not found, offline, or errors, resolves with the premium mock list.
 */
export const getTestimonials = async () => {
    try {
        const response = await api.get('/jobs/featured/testimonials');
        return response.data?.length > 0 ? response.data : DEFAULT_TESTIMONIALS;
    } catch (error) {
        console.warn('Featured Testimonials API offline or not found, using premium local fallback data.');
        return DEFAULT_TESTIMONIALS;
    }
};
