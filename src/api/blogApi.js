import api, { supabase } from './client';

export const listBlogPosts = async (limit = 10) => {
    const { data, error } = await supabase
        .from('jobs_blogs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};

export const getBlogPost = async (id) => {
    const { data, error } = await supabase
        .from('jobs_blogs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const generateBlogPost = async () => {
    const response = await api.post('/blogs/generate');
    return response.data;
};
