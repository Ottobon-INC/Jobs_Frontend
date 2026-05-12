import api from './client';

export const listBlogPosts = async (limit = 10) => {
    const response = await api.get('/blogs', { params: { limit } });
    return response.data;
};

export const getBlogPost = async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
};

export const generateBlogPost = async () => {
    const response = await api.post('/blogs/generate');
    return response.data;
};
