import { useState, useEffect } from 'react';
import { listBlogPosts, generateBlogPost } from '../api/blogApi';

const MOCK_FALLBACKS = [
    {
        id: 'f1',
        title: "The Future of AI in Recruitment",
        summary: "How neural networks are reshaping the way founders find talent in 2026.",
        published_at: new Date().toISOString(),
        category: "Technology"
    },
    {
        id: 'f2',
        title: "Landing a Dream Job at Swiggy",
        summary: "Insider tips on cracking the Swiggy interview from our community members.",
        published_at: new Date().toISOString(),
        category: "Career"
    },
    {
        id: 'f3',
        title: "How Skill Signals Are Changing Hiring",
        summary: "Why verified work, interview readiness, and sharper matching are becoming the new baseline.",
        published_at: new Date().toISOString(),
        category: "Hiring"
    }
];

export const useBlogPosts = (limit = 20) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await listBlogPosts(limit);
            setPosts(data);
        } catch (err) {
            console.error("Error fetching blogs, using fallback data:", err);
            setPosts(MOCK_FALLBACKS);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [limit]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await generateBlogPost();
            // Refresh list after generation
            setTimeout(fetchPosts, 2000);
        } catch (err) {
            console.error("Failed to generate", err);
            alert("Failed to generate blog post.");
        } finally {
            setGenerating(false);
        }
    };

    return { posts, loading, generating, handleGenerate };
};
