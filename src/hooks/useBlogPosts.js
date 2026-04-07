import { useState, useEffect } from 'react';
import { listBlogPosts, generateBlogPost } from '../api/blogApi';

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
            console.error("Error fetching blogs:", err);
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
